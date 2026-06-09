from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import shutil, uuid, os

from app.database import get_db
from app import models
from app.schema import CreateBlog, UpdateBlog, BlogResponse
from app.routes.admin import get_current_admin_dependence


router = APIRouter()

UPLOAD_DIR = "uploads/blogs"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/create")
def create_blog(
    title: str = Form(...),
    excerpt: str = Form(...),
    content: str = Form(...),
    category: str = Form(...),
    author: str = Form(...),
    meta_title: str = Form(...),
    meta_description: str = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    admin: models.Admin = Depends(get_current_admin_dependence)
):

    image_path = None

    if image:
        file_ext = image.filename.split(".")[-1]
        file_name = f"{uuid.uuid4()}.{file_ext}"
        file_location = f"{UPLOAD_DIR}/{file_name}"

        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        image_path = f"/uploads/blogs/{file_name}"

    blog = models.Blog(
        title=title,
        excerpt=excerpt,
        content=content,
        category=category,
        author=author,
        featured_image=image_path,
        meta_title=meta_title,
        meta_description=meta_description
    )

    db.add(blog)
    db.commit()
    db.refresh(blog)

    return blog

@router.get("/admin", response_model=list[BlogResponse])
def get_all_blogs_admin(
    db: Session = Depends(get_db),
    admin: models.Admin = Depends(get_current_admin_dependence)
):
    return db.query(models.Blog).order_by(models.Blog.id.desc()).all()


@router.get("/public", response_model=list[BlogResponse])
def get_public_blogs(db: Session = Depends(get_db)):
    return db.query(models.Blog).order_by(models.Blog.id.desc()).all()


@router.get("/{blog_id}", response_model=BlogResponse)
def get_blog(blog_id: int, db: Session = Depends(get_db)):
    blog = db.query(models.Blog).filter(models.Blog.id == blog_id).first()

    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    return blog

@router.patch("/update/{blog_id}")
def update_blog(
    blog_id: int,
    data: UpdateBlog,
    db: Session = Depends(get_db),
    admin: models.Admin = Depends(get_current_admin_dependence)
):

    blog = db.query(models.Blog).filter(models.Blog.id == blog_id).first()

    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(blog, key, value)

    db.commit()
    db.refresh(blog)

    return blog


@router.delete("/delete/{blog_id}")
def delete_blog(
    blog_id: int,
    db: Session = Depends(get_db),
    admin: models.Admin = Depends(get_current_admin_dependence)
):

    blog = db.query(models.Blog).filter(models.Blog.id == blog_id).first()

    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    db.delete(blog)
    db.commit()

    return {"message": "Blog deleted successfully"}