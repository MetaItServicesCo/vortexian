"""Bulk actions for admin lists: delete or publish/unpublish many records at once.

Each action runs in one transaction (all selected records change, or none do).
Deleted records go to Recently deleted and can be restored for 7 days.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.routes.admin import get_current_admin_dependence
from app.trash import RESOURCES, RETENTION_DAYS, Resource, move_to_trash

router = APIRouter()

MAX_IDS = 1000


class BulkIds(BaseModel):
    ids: list[int] = Field(min_length=1, max_length=MAX_IDS)


class BulkPublish(BulkIds):
    is_published: bool


def _resource(name: str) -> Resource:
    resource = RESOURCES.get(name)
    if not resource:
        raise HTTPException(status_code=404, detail="Unknown list")
    return resource


def _load(resource: Resource, ids: list[int], db: Session):
    wanted = set(ids)
    rows = db.query(resource.model).filter(resource.model.id.in_(wanted)).all()
    missing = sorted(wanted - {row.id for row in rows})
    return rows, missing


@router.post("/{name}/delete")
def bulk_delete(name: str, body: BulkIds, db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    resource = _resource(name)
    rows, missing = _load(resource, body.ids, db)
    deleted = move_to_trash(db, name, rows, admin) if rows else 0

    # Records already gone (e.g. deleted in another tab) are reported, not treated as errors
    return {
        "deleted": deleted,
        "missing": missing,
        "message": f"Deleted {deleted} {resource.plural}. They can be restored from Recently deleted for {RETENTION_DAYS} days.",
    }


@router.post("/{name}/publish")
def bulk_publish(name: str, body: BulkPublish, db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    resource = _resource(name)
    if not resource.publishable:
        raise HTTPException(status_code=400, detail=f"{resource.plural.capitalize()} cannot be published or unpublished.")
    rows, missing = _load(resource, body.ids, db)

    for row in rows:
        row.is_published = body.is_published
    db.commit()

    state = "Published" if body.is_published else "Unpublished"
    return {"updated": len(rows), "missing": missing, "message": f"{state} {len(rows)} {resource.plural}"}
