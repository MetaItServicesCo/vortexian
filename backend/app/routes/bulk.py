"""Bulk actions for admin lists: delete or publish/unpublish many records at once.

Each action runs in one transaction (all selected records change, or none do).
Uploaded files are removed only after the database commit succeeds, exactly
like the single-record delete endpoints.
"""
from dataclasses import dataclass, field

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.routes.admin import get_current_admin_dependence
from app.uploads import delete_upload

router = APIRouter()

MAX_IDS = 1000


@dataclass(frozen=True)
class BulkResource:
    model: type
    label: str  # plural, used in messages
    upload_fields: tuple[str, ...] = ()
    publishable: bool = False
    extra: dict = field(default_factory=dict)


# Keys match the admin dashboard sections
RESOURCES: dict[str, BulkResource] = {
    "blog": BulkResource(models.Blog, "blog posts", ("featured_image",)),
    "services": BulkResource(models.Service, "services", ("image_showcase_url",)),
    "team": BulkResource(models.Team, "team members", ("profile_image",)),
    "portfolio": BulkResource(models.Portfolio, "portfolio items", ("primary_image",)),
    "testimonials": BulkResource(models.Testimonial, "testimonials", ("profile_image",)),
    "newsfeed": BulkResource(models.NewsFeed, "news updates", ("media_url",), publishable=True),
    "pages": BulkResource(models.Page, "pages", publishable=True),
    "career": BulkResource(models.CareerApplication, "applications", ("cv_url", "image_url")),
    "contacts": BulkResource(models.Contact, "quote requests", ("project_file",)),
    "quotes": BulkResource(models.ContactUs, "enquiries"),
    "newsletter": BulkResource(models.Newsletter, "subscribers"),
}


class BulkIds(BaseModel):
    ids: list[int] = Field(min_length=1, max_length=MAX_IDS)


class BulkPublish(BulkIds):
    is_published: bool


def _resource(name: str) -> BulkResource:
    resource = RESOURCES.get(name)
    if not resource:
        raise HTTPException(status_code=404, detail="Unknown list")
    return resource


def _load(resource: BulkResource, ids: list[int], db: Session):
    wanted = set(ids)
    rows = db.query(resource.model).filter(resource.model.id.in_(wanted)).all()
    missing = sorted(wanted - {row.id for row in rows})
    return rows, missing


@router.post("/{name}/delete")
def bulk_delete(name: str, body: BulkIds, db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    resource = _resource(name)
    rows, missing = _load(resource, body.ids, db)

    files = [getattr(row, f) for row in rows for f in resource.upload_fields]
    try:
        for row in rows:
            db.delete(row)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=409, detail=f"The selected {resource.label} could not be deleted. Nothing was changed.")

    for path in files:
        delete_upload(path)

    # Records already gone (e.g. deleted in another tab) are reported, not treated as errors
    return {"deleted": len(rows), "missing": missing, "message": f"Deleted {len(rows)} {resource.label}"}


@router.post("/{name}/publish")
def bulk_publish(name: str, body: BulkPublish, db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    resource = _resource(name)
    if not resource.publishable:
        raise HTTPException(status_code=400, detail=f"{resource.label.capitalize()} cannot be published or unpublished.")
    rows, missing = _load(resource, body.ids, db)

    for row in rows:
        row.is_published = body.is_published
    db.commit()

    state = "Published" if body.is_published else "Unpublished"
    return {"updated": len(rows), "missing": missing, "message": f"{state} {len(rows)} {resource.label}"}
