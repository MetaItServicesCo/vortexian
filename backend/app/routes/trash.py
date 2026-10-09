from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.routes.admin import get_current_admin_dependence
from app.trash import RESOURCES, RETENTION_DAYS, RestoreError, as_utc, destroy, expires_at, purge_expired, restore

router = APIRouter()


class TrashIds(BaseModel):
    ids: list[int] = Field(min_length=1, max_length=1000)


def _item(item: models.DeletedItem) -> dict:
    resource = RESOURCES.get(item.resource)
    return {
        "id": item.id,
        "resource": item.resource,
        "type": resource.singular if resource else item.resource,
        "record_id": item.record_id,
        "title": item.title,
        "has_files": bool(item.files),
        "deleted_by": item.deleted_by,
        "deleted_at": as_utc(item.deleted_at).isoformat(),
        "expires_at": expires_at(item).isoformat(),
    }


@router.get("/")
def list_deleted(db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    purge_expired(db)
    items = db.query(models.DeletedItem).order_by(models.DeletedItem.deleted_at.desc(), models.DeletedItem.id.desc()).all()
    return {"retention_days": RETENTION_DAYS, "items": [_item(i) for i in items]}


@router.post("/restore")
def restore_items(body: TrashIds, db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    purge_expired(db)
    items = db.query(models.DeletedItem).filter(models.DeletedItem.id.in_(set(body.ids))).all()
    found = {i.id for i in items}
    restored, failed = [], []
    for item in items:
        summary = {"id": item.id, "title": item.title, "resource": item.resource}
        try:
            record = restore(db, item)
            restored.append({**summary, "record_id": record.id})
        except RestoreError as err:
            failed.append({**summary, "reason": str(err)})
    # Already restored elsewhere, deleted forever, or expired
    failed += [{"id": i, "title": None, "resource": None, "reason": "No longer in Recently deleted."} for i in sorted(set(body.ids) - found)]
    return {"restored": restored, "failed": failed}


@router.post("/delete-forever")
def delete_forever(body: TrashIds, db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    items = db.query(models.DeletedItem).filter(models.DeletedItem.id.in_(set(body.ids))).all()
    return {"deleted": destroy(db, items)}


@router.post("/empty")
def empty_trash(db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    return {"deleted": destroy(db, db.query(models.DeletedItem).all())}
