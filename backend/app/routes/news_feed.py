import re

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.schema import NewsFeedResponse
from app.routes.admin import get_current_admin_dependence
from app.sanitize import clean_html
from app.uploads import IMAGE_EXTENSIONS, MAX_VIDEO_BYTES, VIDEO_EXTENSIONS, clean_alt, delete_upload, has_file, is_image, require_alt, save_upload

router = APIRouter()

MEDIA_EXTENSIONS = IMAGE_EXTENSIONS | VIDEO_EXTENSIONS
MAX_LENGTHS = {"title": (200, "Title"), "feed_type": (50, "Type"), "author": (100, "Author"), "event_date": (100, "Event date")}


def _clean_fields(title: str, feed_type: str, description: str, author: str, event_date: str | None) -> dict:
    values = {
        "title": (title or "").strip(),
        "feed_type": (feed_type or "").strip().lower().replace(" ", "_") or "general",
        "author": (author or "").strip(),
        "event_date": (event_date or "").strip() or None,
    }
    for field, (limit, label) in MAX_LENGTHS.items():
        if values[field] and len(values[field]) > limit:
            raise HTTPException(status_code=400, detail=f"{label} is too long (max {limit} characters).")
    if not values["title"]:
        raise HTTPException(status_code=400, detail="Title is required.")
    if not values["author"]:
        raise HTTPException(status_code=400, detail="Author is required.")
    values["description"] = clean_html(description) or ""
    visible_text = re.sub(r"<[^>]+>|&nbsp;|\s", "", values["description"])
    if not visible_text and not re.search(r"<(img|video)", values["description"]):
        raise HTTPException(status_code=400, detail="Description is required.")
    return values


def _published():
    # Rows from before the publish switch may hold NULL: treat them as published
    return or_(models.NewsFeed.is_published.is_(True), models.NewsFeed.is_published.is_(None))


def _newest_first(query):
    return query.order_by(models.NewsFeed.id.desc())


def _get_or_404(news_id: int, db: Session) -> models.NewsFeed:
    news = db.query(models.NewsFeed).filter(models.NewsFeed.id == news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="News feed not found")
    return news


# ---------------- CREATE (ADMIN) ----------------
@router.post("/", status_code=201)
def create_news_feed(
    title: str = Form(...),
    feed_type: str = Form(...),
    description: str = Form(...),
    author: str = Form(...),
    event_date: str = Form(None),
    is_published: bool = Form(True),
    file: UploadFile = File(None),
    media_alt: str = Form(None),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence)
):
    values = _clean_fields(title, feed_type, description, author, event_date)
    media_alt = require_alt(has_file(file) and is_image(file.filename), media_alt)
    media_path = save_upload(file, "newsfeed", MEDIA_EXTENSIONS, MAX_VIDEO_BYTES) if has_file(file) else None

    news = models.NewsFeed(**values, media_url=media_path, media_alt=media_alt, is_published=is_published)
    db.add(news)
    db.commit()
    db.refresh(news)

    return NewsFeedResponse.model_validate(news)


# ---------------- PUBLIC LIST: published only, newest first ----------------
@router.get("/", response_model=list[NewsFeedResponse])
def get_all_news(db: Session = Depends(get_db)):
    return _newest_first(db.query(models.NewsFeed).filter(_published())).all()


# ---------------- ADMIN LIST / ITEM: includes drafts ----------------
@router.get("/admin/all", response_model=list[NewsFeedResponse])
def get_all_news_admin(db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    return _newest_first(db.query(models.NewsFeed)).all()


@router.get("/admin/{news_id}", response_model=NewsFeedResponse)
def get_news_admin(news_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    return _get_or_404(news_id, db)


# ---------------- PUBLIC ITEM ----------------
@router.get("/{news_id}", response_model=NewsFeedResponse)
def get_single_news(news_id: int, db: Session = Depends(get_db)):
    news = db.query(models.NewsFeed).filter(models.NewsFeed.id == news_id, _published()).first()
    if not news:
        raise HTTPException(status_code=404, detail="News feed not found")
    return news


# ---------------- UPDATE (ADMIN) ----------------
@router.put("/{news_id}")
def update_news_feed(
    news_id: int,
    title: str = Form(...),
    feed_type: str = Form(...),
    description: str = Form(...),
    author: str = Form(...),
    event_date: str = Form(None),
    is_published: bool = Form(None),
    remove_media: bool = Form(False),
    file: UploadFile = File(None),
    media_alt: str = Form(None),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence)
):
    news = _get_or_404(news_id, db)
    values = _clean_fields(title, feed_type, description, author, event_date)

    old_media = news.media_url
    if has_file(file):
        news.media_url = save_upload(file, "newsfeed", MEDIA_EXTENSIONS, MAX_VIDEO_BYTES)
    elif remove_media:
        news.media_url = None

    for key, value in values.items():
        setattr(news, key, value)
    if is_published is not None:
        news.is_published = is_published
    if media_alt is not None:
        news.media_alt = clean_alt(media_alt)
    if not news.media_url:
        news.media_alt = None

    try:
        news.media_alt = require_alt(is_image(news.media_url), news.media_alt)
    except HTTPException:
        if news.media_url != old_media:
            delete_upload(news.media_url)  # don't keep the rejected upload
        raise

    db.commit()
    db.refresh(news)
    if old_media and old_media != news.media_url:
        delete_upload(old_media)

    return NewsFeedResponse.model_validate(news)


# ---------------- DELETE (ADMIN) ----------------
@router.delete("/{news_id}")
def delete_news_feed(
    news_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence)
):
    news = _get_or_404(news_id, db)
    media_path = news.media_url
    db.delete(news)
    db.commit()
    delete_upload(media_path)

    return {"message": "News feed deleted successfully"}
