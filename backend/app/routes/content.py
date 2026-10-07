import json
import re
from typing import Any

from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.routes.admin import get_current_admin_dependence
from app.sanitize import clean_html_fields

router = APIRouter()

KEY_PATTERN = re.compile(r"^[a-z0-9_.-]{1,100}$")
MAX_DOCUMENT_BYTES = 512 * 1024


def _validate_key(key: str) -> str:
    if not KEY_PATTERN.match(key):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid content key")
    return key


def _load(row: models.SiteContent) -> dict:
    try:
        data = json.loads(row.data)
    except ValueError:
        return {}
    return data if isinstance(data, dict) else {}


# ---------------- ALL CONTENT (PUBLIC) ----------------
# The public site loads everything in one request and merges it over its
# built-in defaults, so keys that were never edited are simply absent.
@router.get("/")
def get_all_content(db: Session = Depends(get_db)) -> dict[str, Any]:
    return {row.key: _load(row) for row in db.query(models.SiteContent).all()}


@router.get("/{key}")
def get_content(key: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    row = db.get(models.SiteContent, _validate_key(key))
    return _load(row) if row else {}


# ---------------- SAVE (ADMIN) ----------------
@router.put("/{key}")
def save_content(
    key: str,
    data: dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence),
) -> dict[str, Any]:
    _validate_key(key)

    cleaned = clean_html_fields(data)
    serialized = json.dumps(cleaned, ensure_ascii=False)
    if len(serialized.encode("utf-8")) > MAX_DOCUMENT_BYTES:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Content too large")

    row = db.get(models.SiteContent, key)
    if row:
        row.data = serialized
    else:
        db.add(models.SiteContent(key=key, data=serialized))
    db.commit()

    return cleaned


# ---------------- RESET TO DEFAULTS (ADMIN) ----------------
@router.delete("/{key}")
def reset_content(
    key: str,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence),
):
    row = db.get(models.SiteContent, _validate_key(key))
    if row:
        db.delete(row)
        db.commit()
    return {"message": "Content reset to defaults"}
