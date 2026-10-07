from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.schema import NewsFeedResponse
from app.routes.admin import get_current_admin_dependence
from app.sanitize import clean_html
from app.uploads import IMAGE_EXTENSIONS, MAX_VIDEO_BYTES, VIDEO_EXTENSIONS, delete_upload, has_file, save_upload

router = APIRouter()

MEDIA_EXTENSIONS = IMAGE_EXTENSIONS | VIDEO_EXTENSIONS


# ---------------- CREATE NEWS FEED ----------------
@router.post("/", status_code=201)
def create_news_feed(
    title: str = Form(...),
    feed_type: str = Form(...),
    description: str = Form(...),
    author: str = Form(...),
    event_date: str = Form(None),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence)
):
    media_path = None

    if has_file(file):
        media_path = save_upload(file, "newsfeed", MEDIA_EXTENSIONS, MAX_VIDEO_BYTES)

    news = models.NewsFeed(
        title=title,
        feed_type=feed_type,
        description=clean_html(description),
        author=author,
        event_date=event_date,
        media_url=media_path,
        is_published=True
    )

    db.add(news)
    db.commit()
    db.refresh(news)

    return {"message": "News feed created successfully"}


# ---------------- GET ALL NEWS FEED ----------------
@router.get("/", response_model=list[NewsFeedResponse])
def get_all_news(db: Session = Depends(get_db)):
    news_list = db.query(models.NewsFeed).order_by(models.NewsFeed.id.desc()).all()
    return [NewsFeedResponse.model_validate(n) for n in news_list]


# ---------------- GET SINGLE NEWS FEED ----------------
@router.get("/{news_id}", response_model=NewsFeedResponse)
def get_single_news(
    news_id: int,
    db: Session = Depends(get_db)
):
    news = db.query(models.NewsFeed).filter(models.NewsFeed.id == news_id).first()

    if not news:
        raise HTTPException(status_code=404, detail="News feed not found")

    return NewsFeedResponse.model_validate(news)


# ---------------- UPDATE NEWS FEED ----------------
@router.put("/{news_id}")
def update_news_feed(
    news_id: int,
    title: str = Form(...),
    feed_type: str = Form(...),
    description: str = Form(...),
    author: str = Form(...),
    event_date: str = Form(None),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence)
):
    news = db.query(models.NewsFeed).filter(models.NewsFeed.id == news_id).first()

    if not news:
        raise HTTPException(status_code=404, detail="News feed not found")

    # Replace media only when a new file is uploaded
    if has_file(file):
        new_media = save_upload(file, "newsfeed", MEDIA_EXTENSIONS, MAX_VIDEO_BYTES)
        delete_upload(news.media_url)
        news.media_url = new_media

    # Fields update karo
    news.title = title
    news.feed_type = feed_type
    news.description = clean_html(description)
    news.author = author
    news.event_date = event_date

    db.commit()
    db.refresh(news)

    return {"message": "News feed updated successfully"}


# ---------------- DELETE NEWS FEED ----------------
@router.delete("/{news_id}")
def delete_news_feed(
    news_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence)
):
    news = db.query(models.NewsFeed).filter(models.NewsFeed.id == news_id).first()

    if not news:
        raise HTTPException(status_code=404, detail="News feed not found")

    media_path = news.media_url
    db.delete(news)
    db.commit()
    delete_upload(media_path)

    return {"message": "News feed deleted successfully"}