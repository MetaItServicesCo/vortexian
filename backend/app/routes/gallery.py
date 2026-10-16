"""Gallery API (public /gallery and Dashboard → Gallery).

Public:
    GET /api/gallery/                    published photos, albums and the categories in use
    GET /api/gallery/albums/{slug}       one published album with its photos
Admin:
    GET    /api/gallery/admin            everything, drafts included
    POST   /api/gallery/admin/images     upload one photo (the dashboard sends a batch one by one)
    PATCH  /api/gallery/admin/images/{id}
    DELETE /api/gallery/admin/images/{id}        (Recently deleted)
    POST   /api/gallery/admin/images/reorder     {"ids": [...]}
    POST   /api/gallery/admin/albums, PATCH/DELETE /api/gallery/admin/albums/{id}, POST .../albums/reorder
Bulk publish / unpublish / delete: /api/bulk/gallery-images/... and /api/bulk/gallery-albums/...

A photo is public when it is published and, if it belongs to an album, the album is published too.
Deleting an album keeps its photos (shown without an album) so restoring the album brings them back with it.
"""
import re
from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app import categories as cats
from app import models
from app.database import get_db
from app.gallery_images import process_upload
from app.routes.admin import get_current_admin_dependence
from app.sanitize import slugify
from app.trash import move_to_trash

router = APIRouter()

LIMITS = {"title": 150, "caption": 500, "event_name": 150, "alt": 255, "description": 1000}


def _now():
    return datetime.now(timezone.utc)


def _clean(value, field: str) -> str | None:
    text = re.sub(r"<[^>]*>", "", str(value or "")).strip()
    return text[:LIMITS[field]] or None


def _date(value) -> str | None:
    value = str(value or "").strip()
    if not value:
        return None
    try:
        return date.fromisoformat(value).isoformat()
    except ValueError:
        raise HTTPException(status_code=400, detail="Event date should be a date (YYYY-MM-DD).")


def _image_out(img: models.GalleryImage, albums: dict | None = None, admin: bool = False) -> dict:
    album = (albums or {}).get(img.album_id)
    out = {
        "id": img.id, "title": img.title, "caption": img.caption, "event_name": img.event_name, "event_date": img.event_date,
        "alt": img.alt, "category_id": img.category_id, "category": img.category_name,
        "album_id": img.album_id, "album_slug": album.slug if album else None, "album_title": album.title if album else None,
        "src": img.path_medium, "full": img.path, "width": img.width, "height": img.height,
        "srcset": f"{img.path_thumb} {min(480, img.width or 480)}w, {img.path_medium} {min(960, img.width or 960)}w, "
                  f"{img.path_large} {min(1600, img.width or 1600)}w, {img.path} {img.width or 2400}w",
        "thumb": img.path_thumb,
    }
    if admin:
        out.update(is_published=img.is_published, sort_order=img.sort_order, file_size=img.file_size,
                   created_at=img.created_at.isoformat() if img.created_at else None)
    return out


def _ordered_images(db: Session):
    return db.query(models.GalleryImage).order_by(models.GalleryImage.sort_order, models.GalleryImage.id.desc())


def _albums(db: Session, published_only: bool) -> list[models.GalleryAlbum]:
    q = db.query(models.GalleryAlbum)
    if published_only:
        q = q.filter(models.GalleryAlbum.is_published.is_(True))
    return q.order_by(models.GalleryAlbum.sort_order, models.GalleryAlbum.event_date.desc(), models.GalleryAlbum.id.desc()).all()


def _album_out(album: models.GalleryAlbum, images: list[models.GalleryImage], admin: bool = False) -> dict:
    own = [i for i in images if i.album_id == album.id]
    cover = next((i for i in own if i.id == album.cover_image_id), None) or (own[0] if own else None)
    out = {
        "id": album.id, "title": album.title, "slug": album.slug, "description": album.description, "event_date": album.event_date,
        "cover_image_id": album.cover_image_id, "count": len(own),
        "cover": {"src": cover.path_medium, "srcset": f"{cover.path_thumb} 480w, {cover.path_medium} 960w", "alt": cover.alt,
                  "width": cover.width, "height": cover.height} if cover else None,
    }
    if admin:
        out.update(is_published=album.is_published, sort_order=album.sort_order)
    return out


def _public_images(db: Session, albums: list[models.GalleryAlbum]) -> list[models.GalleryImage]:
    """Published photos, except those in an album that exists but isn't published yet."""
    published = {a.id for a in albums}
    draft = {a.id for a in db.query(models.GalleryAlbum.id).filter(models.GalleryAlbum.is_published.is_(False))}
    return [i for i in _ordered_images(db).filter(models.GalleryImage.is_published.is_(True)).all()
            if i.album_id is None or i.album_id in published or i.album_id not in draft]


def _categories_in_use(db: Session, images: list[models.GalleryImage]) -> list[dict]:
    used = {i.category_id for i in images} | {None}
    by_name = {i.category_name for i in images}
    return [{"id": c.id, "name": c.name} for c in cats.ordered(db, "gallery") if c.id in used or c.name in by_name]


# ---------------------------------------------------------------- public

@router.get("/")
def public_gallery(db: Session = Depends(get_db)):
    albums = _albums(db, published_only=True)
    images = _public_images(db, albums)
    by_id = {a.id: a for a in albums}
    return {
        "images": [_image_out(i, by_id) for i in images],
        "albums": [a for a in (_album_out(a, images) for a in albums) if a["count"]],
        "categories": _categories_in_use(db, images),
    }


@router.get("/albums/{slug}")
def public_album(slug: str, db: Session = Depends(get_db)):
    album = db.query(models.GalleryAlbum).filter(models.GalleryAlbum.slug == slug, models.GalleryAlbum.is_published.is_(True)).first()
    if not album:
        raise HTTPException(status_code=404, detail="Album not found")
    images = _ordered_images(db).filter(models.GalleryImage.album_id == album.id, models.GalleryImage.is_published.is_(True)).all()
    return {"album": _album_out(album, images), "images": [_image_out(i, {album.id: album}) for i in images]}


# ---------------------------------------------------------------- admin

@router.get("/admin")
def admin_gallery(db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    albums = _albums(db, published_only=False)
    images = _ordered_images(db).all()
    by_id = {a.id: a for a in albums}
    cats.others(db, "gallery")
    db.commit()
    return {
        "images": [_image_out(i, by_id, admin=True) for i in images],
        "albums": [_album_out(a, images, admin=True) for a in albums],
        "categories": [{"id": c.id, "name": c.name} for c in cats.ordered(db, "gallery")],
    }


def _check_album(db: Session, album_id) -> int | None:
    if album_id in (None, "", "0", 0):
        return None
    album = db.get(models.GalleryAlbum, int(album_id))
    if not album:
        raise HTTPException(status_code=400, detail="That album no longer exists.")
    return album.id


@router.post("/admin/images", status_code=201)
def upload_image(
    file: UploadFile = File(...),
    title: str = Form(...),
    alt: str = Form(...),
    caption: str | None = Form(None),
    event_name: str | None = Form(None),
    event_date: str | None = Form(None),
    category_id: str | None = Form(None),
    album_id: str | None = Form(None),
    is_published: bool = Form(False),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence),
):
    title_, alt_ = _clean(title, "title"), _clean(alt, "alt")
    if not title_ or not alt_:
        raise HTTPException(status_code=400, detail="Every photo needs a title and alt text.")
    album = _check_album(db, album_id)
    category = cats.resolve(db, "gallery", category_id=category_id or None)
    saved = process_upload(file, title_)
    top = db.query(models.GalleryImage.sort_order).order_by(models.GalleryImage.sort_order).first()
    image = models.GalleryImage(
        title=title_, alt=alt_, caption=_clean(caption, "caption"), event_name=_clean(event_name, "event_name"),
        event_date=_date(event_date), category_id=category.id, category_name=category.name, album_id=album,
        is_published=is_published, sort_order=(top[0] - 1) if top else 0, created_at=_now(), **saved,
    )
    db.add(image)
    db.commit()
    db.refresh(image)
    albums = {a.id: a for a in db.query(models.GalleryAlbum).all()}
    return _image_out(image, albums, admin=True)


class ImageUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=300)
    alt: str | None = Field(default=None, max_length=500)
    caption: str | None = Field(default=None, max_length=1000)
    event_name: str | None = Field(default=None, max_length=300)
    event_date: str | None = None
    category_id: int | None = None
    album_id: int | None = None
    is_published: bool | None = None


@router.patch("/admin/images/{image_id}")
def update_image(image_id: int, body: ImageUpdate, db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    image = db.get(models.GalleryImage, image_id)
    if not image:
        raise HTTPException(status_code=404, detail="Photo not found.")
    data = body.model_dump(exclude_unset=True)
    if "title" in data:
        image.title = _clean(data["title"], "title") or image.title
        if not _clean(data["title"], "title"):
            raise HTTPException(status_code=400, detail="A photo needs a title.")
    if "alt" in data:
        if not _clean(data["alt"], "alt"):
            raise HTTPException(status_code=400, detail="A photo needs alt text (it describes the photo for Google and screen readers).")
        image.alt = _clean(data["alt"], "alt")
    for field in ("caption", "event_name"):
        if field in data:
            setattr(image, field, _clean(data[field], field))
    if "event_date" in data:
        image.event_date = _date(data["event_date"])
    if "category_id" in data:
        category = cats.resolve(db, "gallery", category_id=data["category_id"])
        image.category_id, image.category_name = category.id, category.name
    if "album_id" in data:
        new_album = _check_album(db, data["album_id"])
        if image.album_id and image.album_id != new_album:   # it can no longer be the old album's cover
            old = db.get(models.GalleryAlbum, image.album_id)
            if old and old.cover_image_id == image.id:
                old.cover_image_id = None
        image.album_id = new_album
    if "is_published" in data and data["is_published"] is not None:
        image.is_published = data["is_published"]
    image.updated_at = _now()
    db.commit()
    albums = {a.id: a for a in db.query(models.GalleryAlbum).all()}
    return _image_out(image, albums, admin=True)


class Order(BaseModel):
    ids: list[int] = Field(min_length=1, max_length=5000)


@router.post("/admin/images/reorder")
def reorder_images(body: Order, db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    rows = {i.id: i for i in db.query(models.GalleryImage).filter(models.GalleryImage.id.in_(body.ids)).all()}
    for n, image_id in enumerate(body.ids):
        if image_id in rows:
            rows[image_id].sort_order = n
    db.commit()
    return {"message": "Order saved."}


@router.delete("/admin/images/{image_id}")
def delete_image(image_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    image = db.get(models.GalleryImage, image_id)
    if not image:
        raise HTTPException(status_code=404, detail="Photo not found.")
    db.query(models.GalleryAlbum).filter(models.GalleryAlbum.cover_image_id == image.id).update({"cover_image_id": None})
    move_to_trash(db, "gallery-images", [image], admin)
    return {"message": "Photo deleted. It can be restored from Recently deleted for 7 days."}


# ---------------------------------------------------------------- albums

class AlbumIn(BaseModel):
    title: str | None = Field(default=None, max_length=300)
    slug: str | None = Field(default=None, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    event_date: str | None = None
    cover_image_id: int | None = None
    is_published: bool | None = None


def _album_slug(db: Session, requested: str | None, title: str, exclude_id: int | None = None) -> str:
    def taken(slug):
        q = db.query(models.GalleryAlbum.id).filter(models.GalleryAlbum.slug == slug)
        if exclude_id:
            q = q.filter(models.GalleryAlbum.id != exclude_id)
        return db.query(q.exists()).scalar()
    if requested and requested.strip():
        slug = slugify(requested)
        if not slug:
            raise HTTPException(status_code=400, detail="The album address must contain letters or numbers.")
        if taken(slug):
            raise HTTPException(status_code=400, detail=f'The address "/gallery/{slug}" is already used by another album.')
        return slug
    base, n = slugify(title) or "album", 2
    slug = base
    while taken(slug):
        slug, n = f"{base}-{n}", n + 1
    return slug


def _check_cover(db: Session, album_id: int | None, cover_id: int | None) -> int | None:
    if not cover_id:
        return None
    image = db.get(models.GalleryImage, cover_id)
    if not image or (album_id and image.album_id != album_id):
        raise HTTPException(status_code=400, detail="The cover must be one of this album's photos.")
    return image.id


@router.post("/admin/albums", status_code=201)
def create_album(body: AlbumIn, db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    title = _clean(body.title, "title")
    if not title:
        raise HTTPException(status_code=400, detail="Please give the album a title.")
    top = db.query(models.GalleryAlbum.sort_order).order_by(models.GalleryAlbum.sort_order).first()
    album = models.GalleryAlbum(title=title, slug=_album_slug(db, body.slug, title), description=_clean(body.description, "description"),
                                event_date=_date(body.event_date), is_published=bool(body.is_published),
                                sort_order=(top[0] - 1) if top else 0, created_at=_now())
    db.add(album)
    db.commit()
    db.refresh(album)
    return _album_out(album, [], admin=True)


@router.patch("/admin/albums/{album_id}")
def update_album(album_id: int, body: AlbumIn, db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    album = db.get(models.GalleryAlbum, album_id)
    if not album:
        raise HTTPException(status_code=404, detail="Album not found.")
    data = body.model_dump(exclude_unset=True)
    if "title" in data:
        title = _clean(data["title"], "title")
        if not title:
            raise HTTPException(status_code=400, detail="Please give the album a title.")
        album.title = title
    if "slug" in data:
        album.slug = _album_slug(db, data["slug"] or None, album.title, exclude_id=album.id) if data["slug"] else album.slug
    if "description" in data:
        album.description = _clean(data["description"], "description")
    if "event_date" in data:
        album.event_date = _date(data["event_date"])
    if "cover_image_id" in data:
        album.cover_image_id = _check_cover(db, album.id, data["cover_image_id"])
    if "is_published" in data and data["is_published"] is not None:
        album.is_published = data["is_published"]
    album.updated_at = _now()
    db.commit()
    images = db.query(models.GalleryImage).filter(models.GalleryImage.album_id == album.id).order_by(models.GalleryImage.sort_order).all()
    return _album_out(album, images, admin=True)


@router.post("/admin/albums/reorder")
def reorder_albums(body: Order, db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    rows = {a.id: a for a in db.query(models.GalleryAlbum).filter(models.GalleryAlbum.id.in_(body.ids)).all()}
    for n, album_id in enumerate(body.ids):
        if album_id in rows:
            rows[album_id].sort_order = n
    db.commit()
    return {"message": "Order saved."}


@router.delete("/admin/albums/{album_id}")
def delete_album(album_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    """Deletes the album only; its photos stay in the gallery and rejoin it if it's restored."""
    album = db.get(models.GalleryAlbum, album_id)
    if not album:
        raise HTTPException(status_code=404, detail="Album not found.")
    kept = db.query(models.GalleryImage).filter(models.GalleryImage.album_id == album.id).count()
    move_to_trash(db, "gallery-albums", [album], admin)
    return {"message": f"Album deleted; its {kept} photo{'s' if kept != 1 else ''} stay in the gallery. Restore it from Recently deleted within 7 days to get the album back."}

