from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import os, uuid, shutil

from app.database import get_db
from app import models
from app.schema import NewsFeedResponse
from app.routes.admin import get_current_admin_dependence

router = APIRouter()

UPLOAD_DIR = "uploads/newsfeed"
os.makedirs(UPLOAD_DIR, exist_ok=True)


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

    if file:
        ext = file.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        file_location = f"{UPLOAD_DIR}/{filename}"

        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        media_path = f"/uploads/newsfeed/{filename}"

    news = models.NewsFeed(
        title=title,
        feed_type=feed_type,
        description=description,
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

    # Agar naya file upload hua to purana delete karo
    if file and file.filename:
        # Purana file delete
        if news.media_url:
            old_path = news.media_url.lstrip("/")
            if os.path.exists(old_path):
                os.remove(old_path)

        # Naya file save
        ext = file.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        file_location = f"{UPLOAD_DIR}/{filename}"

        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        news.media_url = f"/uploads/newsfeed/{filename}"

    # Fields update karo
    news.title = title
    news.feed_type = feed_type
    news.description = description
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

    db.delete(news)
    db.commit()

    return {"message": "News feed deleted successfully"}