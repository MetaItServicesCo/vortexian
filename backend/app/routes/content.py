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


# ---------------- SEO settings validation ----------------
# Tracking IDs are inserted into <script> tags on every page, so only the
# documented formats are accepted. Schema blocks must be valid JSON-LD.
GA_ID = re.compile(r"^G-[A-Z0-9]{4,20}$")
CLARITY_ID = re.compile(r"^[a-z0-9]{6,20}$")
VERIFICATION = re.compile(r"^[A-Za-z0-9_\-]{0,100}$")


def _bad(detail: str):
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


def _validate_seo(key: str, data: dict) -> dict:
    if key == "seo.tracking":
        ga = str(data.get("ga_measurement_id") or "").strip().upper()
        clarity = str(data.get("clarity_project_id") or "").strip().lower()
        if ga and not GA_ID.match(ga):
            _bad("Google Analytics ID should look like G-XXXXXXXXXX.")
        if clarity and not CLARITY_ID.match(clarity):
            _bad("Clarity project ID should be the short code from Clarity (letters and numbers, e.g. yqxvfsfl71).")
        if data.get("ga_enabled") and not ga:
            _bad("Enter the Google Analytics ID or turn Google Analytics off.")
        if data.get("clarity_enabled") and not clarity:
            _bad("Enter the Clarity project ID or turn Clarity off.")
        data = {**data, "ga_measurement_id": ga, "clarity_project_id": clarity}
    elif key == "seo.verification":
        for field, label in (("google_site_verification", "Google"), ("bing_site_verification", "Bing")):
            code = str(data.get(field) or "").strip()
            if not VERIFICATION.match(code):
                _bad(f"{label} verification: paste only the code from the content=\"…\" part of the tag.")
            data = {**data, field: code}
    elif key == "newsletter.settings":
        email_re = re.compile(r"^[^\s@<>\"]+@[^\s@<>\"]+\.[A-Za-z]{2,}$")
        from_email = str(data.get("from_email") or "").strip()
        reply_to = str(data.get("reply_to") or "").strip()
        from_name = str(data.get("from_name") or "").strip()
        if from_email and not email_re.match(from_email):
            _bad("Sender email address is not valid.")
        if reply_to and not email_re.match(reply_to):
            _bad("Reply-to email address is not valid.")
        if re.search(r'[<>"]', from_name) or len(from_name) > 100:
            _bad("Sender name can't contain < > or quotes (max 100 characters).")
        if len(str(data.get("welcome_subject") or "")) > 200:
            _bad("Welcome email subject is too long (max 200 characters).")
        data = {**data, "from_email": from_email, "reply_to": reply_to, "from_name": from_name}
    elif key == "seo.schema":
        blocks = data.get("blocks") or []
        if not isinstance(blocks, list):
            _bad("Schema blocks must be a list.")
        for i, block in enumerate(blocks, start=1):
            name = (block or {}).get("name") or f"Block {i}"
            raw = str((block or {}).get("json") or "").strip()
            if not raw:
                continue
            try:
                parsed = json.loads(raw)
            except ValueError as err:
                _bad(f"Schema “{name}” is not valid JSON: {err}")
            if not isinstance(parsed, (dict, list)):
                _bad(f"Schema “{name}” must be a JSON object, e.g. {{\"@context\": \"https://schema.org\", …}}.")
    return data


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

    cleaned = _validate_seo(key, clean_html_fields(data))
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
