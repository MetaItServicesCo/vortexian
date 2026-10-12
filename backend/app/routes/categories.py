from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app import categories as cats
from app import models
from app.database import get_db
from app.routes.admin import get_current_admin_dependence

router = APIRouter()


class CategoryInput(BaseModel):
    kind: str
    name: str = Field(min_length=1, max_length=100)
    show_in_menu: bool = True


class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    show_in_menu: bool | None = None


class Reorder(BaseModel):
    kind: str
    ids: list[int]


def _out(db: Session, cat: models.Category, with_count: bool = False) -> dict:
    data = {"id": cat.id, "kind": cat.kind, "name": cat.name, "sort_order": cat.sort_order, "show_in_menu": cat.show_in_menu, "is_system": cat.is_system}
    if with_count:
        data["count"] = cats.item_count(db, cat)
    return data


def _get(db: Session, category_id: int) -> models.Category:
    cat = db.get(models.Category, category_id)
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return cat


@router.get("/")
def list_categories(kind: str, db: Session = Depends(get_db)):
    """Public: categories of a kind in display order ("Others" last)."""
    cats.check_kind(kind)
    cats.others(db, kind)
    db.commit()
    return [_out(db, c) for c in cats.ordered(db, kind)]


@router.get("/admin")
def list_categories_admin(kind: str, db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    cats.check_kind(kind)
    cats.others(db, kind)
    db.commit()
    return [_out(db, c, with_count=True) for c in cats.ordered(db, kind)]


@router.post("/", status_code=201)
def create_category(data: CategoryInput, db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    kind = cats.check_kind(data.kind)
    name = data.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Category name is required.")
    if cats.by_name(db, kind, name):
        raise HTTPException(status_code=400, detail=f"A category named “{name}” already exists.")
    cat = cats.resolve(db, kind, name=name, create=True)
    cat.show_in_menu = data.show_in_menu
    db.commit()
    return _out(db, cat, with_count=True)


@router.patch("/{category_id}")
def update_category(category_id: int, data: CategoryUpdate, db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    cat = _get(db, category_id)
    if data.name is not None:
        name = data.name.strip()
        if cat.is_system and name != cat.name:
            raise HTTPException(status_code=400, detail="“Others” is built in and can't be renamed.")
        clash = cats.by_name(db, cat.kind, name)
        if clash and clash.id != cat.id:
            raise HTTPException(status_code=400, detail=f"A category named “{name}” already exists.")
        if name != cat.name:
            cat.name = name
            cats.sync_name(db, cat)
    if data.show_in_menu is not None:
        cat.show_in_menu = data.show_in_menu
    db.commit()
    return _out(db, cat, with_count=True)


@router.post("/reorder")
def reorder_categories(data: Reorder, db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    kind = cats.check_kind(data.kind)
    rows = {c.id: c for c in db.query(models.Category).filter(models.Category.kind == kind, models.Category.is_system.is_(False))}
    for position, cid in enumerate(data.ids, start=1):
        if cid in rows:
            rows[cid].sort_order = position
    db.commit()
    return [_out(db, c, with_count=True) for c in cats.ordered(db, kind)]


@router.delete("/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    cat = _get(db, category_id)
    if cat.is_system:
        raise HTTPException(status_code=400, detail="“Others” is built in and can't be deleted.")
    moved = cats.move_items_to_others(db, cat)
    db.delete(cat)
    db.commit()
    return {"message": f"Category deleted. {moved} item(s) moved to Others.", "moved": moved}
