"""Uploads for the rich text editor, and the Media Library (Dashboard → Media Library).

Media Library images get a readable, permanent public link on the site's
domain (e.g. https://vortexiantech.com/uploads/media/augmented-outsourcing.png)
that can be pasted into the editor's link box or shared on other websites.
"""
import os
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app import models
from app.config import settings
from app.database import get_db
from app.routes.admin import get_current_admin_dependence
from app.trash import move_to_trash
from app.uploads import IMAGE_EXTENSIONS, MAX_IMAGE_BYTES, MAX_VIDEO_BYTES, UPLOAD_ROOT, VIDEO_EXTENSIONS, save_upload

router = APIRouter()

# SVG is deliberately excluded: it can carry script and is served same-origin
MEDIA_EXTENSIONS = IMAGE_EXTENSIONS | VIDEO_EXTENSIONS


def _now():
    return datetime.now(timezone.utc)


def _ext(name: str | None) -> str:
    return os.path.splitext(name or "")[1].lstrip(".").lower()


def _title_from(filename: str | None) -> str:
    stem = os.path.splitext(os.path.basename(filename or ""))[0]
    return " ".join(stem.replace("_", " ").replace("-", " ").split())[:200] or "Image"


def _local(path: str) -> str:
    return os.path.join(UPLOAD_ROOT, path.split(f"/{UPLOAD_ROOT}/", 1)[-1])


def absolute_url(path: str) -> str:
    return f"{settings.site_url.rstrip('/')}{path}"


def _out(item: models.MediaItem) -> dict:
    return {
        "id": item.id,
        "path": item.path,
        "url": absolute_url(item.path),
        "title": item.title,
        "alt": item.alt,
        "file_size": item.file_size,
        "file_name": os.path.basename(item.path),
        "uploaded_by": item.uploaded_by,
        "created_at": item.created_at.isoformat() if item.created_at else None,
        "updated_at": item.updated_at.isoformat() if item.updated_at else None,
    }


def _register(db: Session, path: str, title: str, alt: str | None, admin) -> models.MediaItem:
    item = models.MediaItem(path=path, title=title[:200], alt=(alt or "").strip()[:255] or None,
                            file_size=os.path.getsize(_local(path)) if os.path.exists(_local(path)) else 0,
                            uploaded_by=getattr(admin, "username", None), created_at=_now())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


# ---------------- UPLOAD (ADMIN) ----------------
# Used by the rich text editor and image/video fields in Site Content.
# Images get a readable name from the file and appear in the Media Library.
@router.post("/upload", status_code=201)
def upload_media(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence),
):
    if _ext(file.filename) in IMAGE_EXTENSIONS:
        title = _title_from(file.filename)
        url = save_upload(file, "media", IMAGE_EXTENSIONS, MAX_IMAGE_BYTES, name=title)
        _register(db, url, title, None, admin)
    else:
        url = save_upload(file, "media", MEDIA_EXTENSIONS, MAX_VIDEO_BYTES)
    return {"url": url}


# ---------------- MEDIA LIBRARY (ADMIN) ----------------

@router.get("/library")
def list_library(q: str | None = None, db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    query = db.query(models.MediaItem)
    if q and q.strip():
        like = f"%{q.strip()[:100]}%"
        query = query.filter(or_(models.MediaItem.title.ilike(like), models.MediaItem.path.ilike(like), models.MediaItem.alt.ilike(like)))
    return [_out(i) for i in query.order_by(models.MediaItem.created_at.desc(), models.MediaItem.id.desc()).all()]


@router.post("/library", status_code=201)
def add_to_library(
    file: UploadFile = File(...),
    title: str | None = Form(None),
    alt: str | None = Form(None),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence),
):
    """One image per request (the dashboard uploads a batch one by one, with progress)."""
    if _ext(file.filename) not in IMAGE_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only images can be added: JPG, PNG, WEBP, GIF or AVIF.")
    name = (title or "").strip() or _title_from(file.filename)
    path = save_upload(file, "media", IMAGE_EXTENSIONS, MAX_IMAGE_BYTES, name=name)
    return _out(_register(db, path, name, alt, admin))


class MediaUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=200)
    alt: str | None = Field(default=None, max_length=255)


@router.patch("/library/{item_id}")
def update_item(item_id: int, body: MediaUpdate, db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    """Name and alt text. The file name (and so the link) never changes."""
    item = db.get(models.MediaItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Image not found.")
    if body.title is not None:
        if not body.title.strip():
            raise HTTPException(status_code=400, detail="Please give the image a name.")
        item.title = body.title.strip()
    if body.alt is not None:
        item.alt = body.alt.strip() or None
    item.updated_at = _now()
    db.commit()
    return _out(item)


@router.post("/library/{item_id}/replace")
def replace_item(item_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    """Swap the picture behind an existing link (same file type, so the link stays the same)."""
    item = db.get(models.MediaItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Image not found.")
    current, new = _ext(item.path), _ext(file.filename)
    same = {current, new} <= {"jpg", "jpeg"} or current == new
    if not same:
        raise HTTPException(status_code=400, detail=f"To keep the same link, upload a .{current.upper()} image (you chose .{new.upper() or '?'}).")
    target = _local(item.path)
    temp = f"{target}.replacing"
    written = 0
    try:
        with open(temp, "wb") as out:
            while chunk := file.file.read(1024 * 1024):
                written += len(chunk)
                if written > MAX_IMAGE_BYTES:
                    raise HTTPException(status_code=413, detail=f"File too large. Max size is {MAX_IMAGE_BYTES // (1024 * 1024)}MB")
                out.write(chunk)
        os.replace(temp, target)
    finally:
        if os.path.exists(temp):
            os.remove(temp)
    item.file_size, item.updated_at = written, _now()
    db.commit()
    return _out(item)


# Where an image's link appears, so deleting it doesn't silently break pages
USAGE_FIELDS = [
    (models.Blog, ("content", "featured_image"), "Blog post", lambda r: r.title, lambda r: f"/dashboard/blog/edit/{r.id}"),
    (models.Service, ("long_description", "image_showcase_url"), "Service", lambda r: r.service_title, lambda r: f"/dashboard/services/edit/{r.id}"),
    (models.Portfolio, ("business_challenge", "solution_node", "primary_image"), "Portfolio project", lambda r: r.project_title, lambda r: f"/dashboard/portfolio/edit/{r.id}"),
    (models.Page, ("content",), "Page", lambda r: r.title, lambda r: f"/dashboard/pages/{r.id}"),
    (models.NewsFeed, ("description", "media_url"), "News update", lambda r: r.title, lambda r: f"/dashboard/newsfeed/edit/{r.id}"),
    (models.SiteContent, ("data",), "Site content", lambda r: r.key, lambda r: f"/dashboard/content/{r.key}"),
]


def usage_of(db: Session, path: str) -> list[dict]:
    found = []
    for model, fields, label, title, link in USAGE_FIELDS:
        cols = [getattr(model, f) for f in fields if hasattr(model, f)]
        for row in db.query(model).filter(or_(*[c.contains(path) for c in cols])).limit(20).all():
            found.append({"type": label, "title": title(row) or label, "edit_url": link(row)})
    return found


@router.get("/library/{item_id}/usage")
def item_usage(item_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    item = db.get(models.MediaItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Image not found.")
    return {"usage": usage_of(db, item.path)}


@router.delete("/library/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    item = db.get(models.MediaItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Image not found.")
    move_to_trash(db, "media", [item], admin)
    return {"message": "Image deleted. It can be restored from Recently deleted for 7 days; its link stops working until then."}
