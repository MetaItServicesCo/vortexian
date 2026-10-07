from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.schema import CreateBlog, UpdateBlog, BlogResponse
from app.routes.admin import get_current_admin_dependence
from app.sanitize import clean_html
from app.uploads import IMAGE_EXTENSIONS, MAX_IMAGE_BYTES, delete_upload, has_file, require_alt, save_upload


router = APIRouter()

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
    featured_image_alt: str = Form(None),
    db: Session = Depends(get_db),
    admin: models.Admin = Depends(get_current_admin_dependence)
):
    alt = require_alt(has_file(image), featured_image_alt)
    image_path = None

    if has_file(image):
        image_path = save_upload(image, "blogs", IMAGE_EXTENSIONS, MAX_IMAGE_BYTES)

    blog = models.Blog(
        title=title,
        excerpt=excerpt,
        content=clean_html(content),
        category=category,
        author=author,
        featured_image=image_path,
        featured_image_alt=alt,
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

    updates = data.model_dump(exclude_unset=True)
    if updates.get("content") is not None:
        updates["content"] = clean_html(updates["content"])

    if "featured_image_alt" in updates:
        updates["featured_image_alt"] = require_alt(bool(blog.featured_image), updates["featured_image_alt"])

    for key, value in updates.items():
        setattr(blog, key, value)

    require_alt(bool(blog.featured_image), blog.featured_image_alt)

    db.commit()
    db.refresh(blog)

    return blog


@router.post("/update-image/{blog_id}", response_model=BlogResponse)
def update_blog_image(
    blog_id: int,
    image: UploadFile = File(...),
    featured_image_alt: str = Form(None),
    db: Session = Depends(get_db),
    admin: models.Admin = Depends(get_current_admin_dependence)
):
    blog = db.query(models.Blog).filter(models.Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    alt = require_alt(True, featured_image_alt)
    new_image = save_upload(image, "blogs", IMAGE_EXTENSIONS, MAX_IMAGE_BYTES)
    old_image = blog.featured_image

    blog.featured_image = new_image
    blog.featured_image_alt = alt
    db.commit()
    db.refresh(blog)

    delete_upload(old_image)
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

    image_path = blog.featured_image
    db.delete(blog)
    db.commit()
    delete_upload(image_path)

    return {"message": "Blog deleted successfully"}