from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.schema import CreatePage, UpdatePage, PageResponse, PageLink
from app.routes.admin import get_current_admin_dependence
from app.trash import move_to_trash
from app.sanitize import clean_html

router = APIRouter()

# Custom pages are served at /<slug>, so they must not shadow built-in routes
RESERVED_SLUGS = {
    "about", "blog", "career", "contact", "portfolio", "services",
    "dashboard", "login", "register", "api", "uploads", "assets",
    "admin", "pages", "sitemap", "robots", "favicon", "news",
}


def _check_slug(slug: str, db: Session, exclude_id: int | None = None) -> None:
    if slug in RESERVED_SLUGS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f'"{slug}" is a reserved URL')

    query = db.query(models.Page).filter(models.Page.slug == slug)
    if exclude_id is not None:
        query = query.filter(models.Page.id != exclude_id)
    if query.first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A page with this URL already exists")


def _get_or_404(page_id: int, db: Session) -> models.Page:
    page = db.get(models.Page, page_id)
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    return page


# ---------------- PUBLIC ----------------
@router.get("/footer", response_model=list[PageLink])
def get_footer_pages(db: Session = Depends(get_db)):
    return (
        db.query(models.Page)
        .filter(models.Page.is_published.is_(True), models.Page.show_in_footer.is_(True))
        .order_by(models.Page.footer_order, models.Page.title)
        .all()
    )


@router.get("/slug/{slug}", response_model=PageResponse)
def get_page_by_slug(slug: str, db: Session = Depends(get_db)):
    page = (
        db.query(models.Page)
        .filter(models.Page.slug == slug, models.Page.is_published.is_(True))
        .first()
    )
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    return page


# ---------------- ADMIN ----------------
@router.get("/", response_model=list[PageResponse])
def get_all_pages(
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence),
):
    return db.query(models.Page).order_by(models.Page.footer_order, models.Page.title).all()


@router.get("/id/{page_id}", response_model=PageResponse)
def get_page(
    page_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence),
):
    return _get_or_404(page_id, db)


@router.post("/", response_model=PageResponse, status_code=status.HTTP_201_CREATED)
def create_page(
    data: CreatePage,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence),
):
    _check_slug(data.slug, db)

    page = models.Page(**{**data.model_dump(), "content": clean_html(data.content) or ""})
    db.add(page)
    db.commit()
    db.refresh(page)
    return page


@router.patch("/{page_id}", response_model=PageResponse)
def update_page(
    page_id: int,
    data: UpdatePage,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence),
):
    page = _get_or_404(page_id, db)

    updates = data.model_dump(exclude_unset=True)
    if "slug" in updates:
        _check_slug(updates["slug"], db, exclude_id=page_id)
    if "content" in updates:
        updates["content"] = clean_html(updates["content"]) or ""

    for key, value in updates.items():
        setattr(page, key, value)

    db.commit()
    db.refresh(page)
    return page


@router.delete("/{page_id}")
def delete_page(
    page_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence),
):
    page = _get_or_404(page_id, db)
    move_to_trash(db, "pages", [page], admin)
    return {"message": "Page deleted successfully"}
