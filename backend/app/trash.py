"""Recently deleted: admin deletes are kept for RETENTION_DAYS and can be restored.

A deleted record is stored as a JSON snapshot in DeletedItem and its uploaded
files are moved to uploads/_trash/ (not served publicly). Restoring re-creates
the record with its original id and moves the files back. After the retention
period the snapshot and its files are removed for good.

Existing queries need no "deleted" filter: deleted records really leave their
tables, so they can't leak onto the website.
"""
import os
import shutil
import uuid
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from typing import Callable

from fastapi import HTTPException
from sqlalchemy import inspect as sa_inspect
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app import models
from app.uploads import UPLOAD_ROOT

RETENTION_DAYS = 7
TRASH_DIR = "_trash"


@dataclass(frozen=True)
class Resource:
    model: type
    singular: str
    plural: str
    title: Callable
    upload_fields: tuple[str, ...] = ()
    unique_fields: tuple[str, ...] = ()  # checked before restoring
    publishable: bool = False


def _name(*parts):
    return " ".join(p for p in parts if p).strip()


# Keys match the admin dashboard sections (and /api/bulk/{key})
RESOURCES: dict[str, Resource] = {
    "blog": Resource(models.Blog, "blog post", "blog posts", lambda r: r.title, ("featured_image",), ("slug",)),
    "services": Resource(models.Service, "service", "services", lambda r: r.service_title, ("image_showcase_url",), ("url_slug",)),
    "team": Resource(models.Team, "team member", "team members", lambda r: r.full_name, ("profile_image",)),
    "portfolio": Resource(models.Portfolio, "portfolio item", "portfolio items", lambda r: r.project_title, ("primary_image",)),
    "testimonials": Resource(models.Testimonial, "testimonial", "testimonials", lambda r: r.client_name, ("profile_image",)),
    "newsfeed": Resource(models.NewsFeed, "news update", "news updates", lambda r: r.title, ("media_url",), publishable=True),
    "pages": Resource(models.Page, "page", "pages", lambda r: r.title, unique_fields=("slug",), publishable=True),
    "career": Resource(models.CareerApplication, "application", "applications", lambda r: _name(r.first_name, r.last_name), ("cv_url", "image_url")),
    "contacts": Resource(models.Contact, "quote request", "quote requests", lambda r: _name(r.first_name, r.last_name, f"<{r.email}>" if r.email else ""), ("project_file",)),
    "quotes": Resource(models.ContactUs, "enquiry", "enquiries", lambda r: _name(r.full_name, f"<{r.email}>" if r.email else "")),
    "newsletter": Resource(models.Newsletter, "subscriber", "subscribers", lambda r: r.email, unique_fields=("email",)),
}


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def as_utc(value: datetime) -> datetime:
    # SQLite returns naive datetimes; everything is stored in UTC
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)


def expires_at(item: models.DeletedItem) -> datetime:
    return as_utc(item.deleted_at) + timedelta(days=RETENTION_DAYS)


# ---------------- files ----------------

def _local_path(public_path: str | None) -> str | None:
    """Filesystem path for an upload inside uploads/, else None (external URL etc.)."""
    if not public_path or not isinstance(public_path, str):
        return None
    root = os.path.realpath(UPLOAD_ROOT)
    target = os.path.realpath(public_path.lstrip("/"))
    return target if target.startswith(root + os.sep) else None


def _move(src_public: str, dst_public: str) -> None:
    src, dst = _local_path(src_public), _local_path(dst_public)
    if src and dst and os.path.isfile(src):
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.move(src, dst)


def _remove(public_path: str) -> None:
    target = _local_path(public_path)
    if target and os.path.isfile(target):
        os.remove(target)
        folder = os.path.dirname(target)
        if os.path.basename(os.path.dirname(folder)) == TRASH_DIR and not os.listdir(folder):
            os.rmdir(folder)


# ---------------- snapshot ----------------

def _snapshot(row) -> dict:
    data = {}
    for attr in sa_inspect(row).mapper.column_attrs:
        value = getattr(row, attr.key)
        data[attr.key] = value.isoformat() if isinstance(value, (datetime, date)) else value
    return data


def _from_snapshot(model, data: dict) -> dict:
    values = {}
    for attr in sa_inspect(model).column_attrs:
        if attr.key not in data:
            continue  # column added after the delete: keep its default
        value = data[attr.key]
        python_type = None
        try:
            python_type = attr.columns[0].type.python_type
        except NotImplementedError:
            pass
        if isinstance(value, str) and python_type is datetime:
            value = datetime.fromisoformat(value)
        elif isinstance(value, str) and python_type is date:
            value = date.fromisoformat(value)
        values[attr.key] = value
    return values


# ---------------- delete / restore / purge ----------------

def move_to_trash(db: Session, key: str, rows: list, admin=None) -> int:
    """Delete rows (one transaction) keeping a restorable copy. Returns the count."""
    resource = RESOURCES[key]
    moves = []
    deleted_at = now_utc()
    for row in rows:
        files = []
        for field in resource.upload_fields:
            original = getattr(row, field)
            if _local_path(original):
                trash = f"/{UPLOAD_ROOT}/{TRASH_DIR}/{uuid.uuid4().hex}/{os.path.basename(original)}"
                files.append({"field": field, "original": original, "trash": trash})
                moves.append((original, trash))
        db.add(models.DeletedItem(
            resource=key,
            record_id=row.id,
            title=(resource.title(row) or f"{resource.singular.capitalize()} #{row.id}")[:255],
            data=_snapshot(row),
            files=files,
            deleted_by=getattr(admin, "username", None),
            deleted_at=deleted_at,
        ))
        db.delete(row)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=409, detail=f"The selected {resource.plural} could not be deleted. Nothing was changed.")

    # Files move only once the database change is committed
    for src, dst in moves:
        _move(src, dst)
    purge_expired(db)
    return len(rows)


class RestoreError(Exception):
    pass


def restore(db: Session, item: models.DeletedItem) -> object:
    resource = RESOURCES.get(item.resource)
    if not resource:
        raise RestoreError("This kind of item can no longer be restored.")
    model = resource.model

    for field in resource.unique_fields:
        value = item.data.get(field)
        if value and db.query(model).filter(getattr(model, field) == value).first():
            label = {"slug": "address", "url_slug": "address", "email": "email"}.get(field, field)
            raise RestoreError(f"Another {resource.singular} already uses the {label} “{value}”. Change or delete that one first.")

    values = _from_snapshot(model, item.data)
    if db.get(model, item.record_id):
        values.pop("id", None)  # id taken meanwhile: restore under a new id
    restored = model(**values)
    db.add(restored)
    db.delete(item)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise RestoreError(f"This {resource.singular} clashes with an existing one and could not be restored.")

    for f in item.files or []:
        _move(f["trash"], f["original"])
    return restored


def destroy(db: Session, items: list) -> int:
    """Remove items from Recently deleted for good (with their files)."""
    files = [f["trash"] for item in items for f in (item.files or [])]
    for item in items:
        db.delete(item)
    db.commit()
    for path in files:
        _remove(path)
    return len(items)


def purge_expired(db: Session) -> int:
    cutoff = now_utc() - timedelta(days=RETENTION_DAYS)
    expired = db.query(models.DeletedItem).filter(models.DeletedItem.deleted_at < cutoff).all()
    return destroy(db, expired) if expired else 0
