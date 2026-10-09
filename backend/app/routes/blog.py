from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.schema import CreateBlog, UpdateBlog, BlogResponse
from app.routes.admin import get_current_admin_dependence
from app.sanitize import clean_html, slugify
from app.schema_markup import clean_schema_json
from app.uploads import IMAGE_EXTENSIONS, MAX_IMAGE_BYTES, delete_upload, has_file, require_alt, save_upload
from app.trash import move_to_trash


router = APIRouter()

# Column sizes in the Blog table; checked up front so long input gets a clear
# message instead of a database error.
MAX_LENGTHS = {"title": 200, "slug": 220, "category": 100, "author": 100, "meta_title": 60, "meta_description": 160}
LABELS = {"title": "Title", "slug": "URL slug", "category": "Category", "author": "Author",
          "meta_title": "SEO title", "meta_description": "SEO description"}


def _check_lengths(values: dict) -> None:
    for field, limit in MAX_LENGTHS.items():
        value = values.get(field)
        if value is not None and len(value) > limit:
            raise HTTPException(status_code=400, detail=f"{LABELS[field]} is too long ({len(value)}/{limit} characters).")


def _slug_taken(db: Session, slug: str, exclude_id: int | None = None) -> bool:
    query = db.query(models.Blog.id).filter(models.Blog.slug == slug)
    if exclude_id is not None:
        query = query.filter(models.Blog.id != exclude_id)
    return query.first() is not None


def _resolve_slug(db: Session, requested: str | None, title: str, exclude_id: int | None = None) -> str:
    """Explicit slugs must be unique; slugs derived from the title get a numeric suffix."""
    if requested and requested.strip():
        slug = slugify(requested)
        if not slug:
            raise HTTPException(status_code=400, detail="URL slug must contain letters or numbers.")
        if _slug_taken(db, slug, exclude_id):
            raise HTTPException(status_code=400, detail=f'The URL "/blog/{slug}" is already used by another post.')
        return slug

    base = slugify(title) or "post"
    slug, n = base, 2
    while _slug_taken(db, slug, exclude_id):
        slug, n = f"{base}-{n}", n + 1
    return slug

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
    slug: str = Form(None),
    schema_json: str = Form(None),
    db: Session = Depends(get_db),
    admin: models.Admin = Depends(get_current_admin_dependence)
):
    title = title.strip()
    schema_json = clean_schema_json(schema_json)
    _check_lengths({"title": title, "category": category, "author": author,
                    "meta_title": meta_title, "meta_description": meta_description})
    alt = require_alt(has_file(image), featured_image_alt)
    slug = _resolve_slug(db, slug, title)
    image_path = None

    if has_file(image):
        image_path = save_upload(image, "blogs", IMAGE_EXTENSIONS, MAX_IMAGE_BYTES)

    blog = models.Blog(
        title=title,
        slug=slug,
        excerpt=excerpt,
        content=clean_html(content),
        category=category,
        author=author,
        featured_image=image_path,
        featured_image_alt=alt,
        meta_title=meta_title,
        meta_description=meta_description,
        schema_json=schema_json,
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


@router.get("/slug/{slug}", response_model=BlogResponse)
def get_blog_by_slug(slug: str, db: Session = Depends(get_db)):
    blog = db.query(models.Blog).filter(models.Blog.slug == slug).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    return blog


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
    _check_lengths(updates)
    if "slug" in updates:
        if not (updates["slug"] or "").strip():
            raise HTTPException(status_code=400, detail="URL slug is required.")
        updates["slug"] = _resolve_slug(db, updates["slug"], updates.get("title") or blog.title, exclude_id=blog.id)
    if updates.get("content") is not None:
        updates["content"] = clean_html(updates["content"])
    if "schema_json" in updates:
        updates["schema_json"] = clean_schema_json(updates["schema_json"])

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

    move_to_trash(db, "blog", [blog], admin)

    return {"message": "Blog deleted successfully"}