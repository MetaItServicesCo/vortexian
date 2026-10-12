"""Categories for services and blog posts (Dashboard → Categories).

Every kind has a built-in "Others" category that can't be deleted: items with
no category, an unknown category, or a deleted category belong there.
Items store the category name in their own text column (Service.category_stack,
Blog.category) so everything that already reads those keeps working.
"""
from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app import models

KINDS = ("service", "blog")
OTHERS = "Others"
ITEMS = {
    "service": (models.Service, "category_stack"),
    "blog": (models.Blog, "category"),
}


def check_kind(kind: str) -> str:
    if kind not in KINDS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category type must be service or blog.")
    return kind


def others(db: Session, kind: str) -> models.Category:
    cat = db.query(models.Category).filter_by(kind=kind, is_system=True).first()
    if not cat:
        cat = models.Category(kind=kind, name=OTHERS, is_system=True, sort_order=10000, show_in_menu=True)
        db.add(cat)
        db.flush()
    return cat


def by_name(db: Session, kind: str, name: str) -> models.Category | None:
    return (
        db.query(models.Category)
        .filter(models.Category.kind == kind, func.lower(models.Category.name) == name.strip().lower())
        .first()
    )


def resolve(db: Session, kind: str, category_id=None, name: str | None = None, create: bool = False) -> models.Category:
    """The category for an item being saved.

    category_id wins; otherwise a name is matched (case-insensitive) and, when
    create=True, added as a new category. Anything else falls back to Others.
    """
    if category_id not in (None, ""):
        try:
            cat = db.get(models.Category, int(category_id))
        except (TypeError, ValueError):
            cat = None
        if cat and cat.kind == kind:
            return cat
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="That category no longer exists. Please choose another one.")
    clean = (name or "").strip()
    if clean:
        cat = by_name(db, kind, clean)
        if cat:
            return cat
        if create:
            top = db.query(func.max(models.Category.sort_order)).filter(models.Category.kind == kind, models.Category.is_system.is_(False)).scalar() or 0
            cat = models.Category(kind=kind, name=clean[:100], sort_order=top + 1, show_in_menu=True)
            db.add(cat)
            db.flush()
            return cat
    return others(db, kind)


def item_count(db: Session, cat: models.Category) -> int:
    model, _ = ITEMS[cat.kind]
    return db.query(model).filter(model.category_id == cat.id).count()


def sync_name(db: Session, cat: models.Category) -> None:
    """After a rename: update the name stored on the category's items."""
    model, column = ITEMS[cat.kind]
    db.query(model).filter(model.category_id == cat.id).update({column: cat.name}, synchronize_session=False)


def move_items_to_others(db: Session, cat: models.Category) -> int:
    model, column = ITEMS[cat.kind]
    target = others(db, cat.kind)
    return db.query(model).filter(model.category_id == cat.id).update({"category_id": target.id, column: target.name}, synchronize_session=False)


def ordered(db: Session, kind: str):
    return (
        db.query(models.Category)
        .filter(models.Category.kind == kind)
        .order_by(models.Category.is_system, models.Category.sort_order, models.Category.name)
        .all()
    )
