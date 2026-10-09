"""Per-item schema markup (JSON-LD) typed by admins in the editors.

Stored as text exactly as entered (so {{placeholders}} survive); only checked
to be a JSON object or array. Rendered by src/lib/schema.js on the website.
"""
import json

from fastapi import HTTPException, status

MAX_BYTES = 50 * 1024


def clean_schema_json(value: str | None, label: str = "Schema markup") -> str | None:
    text = (value or "").strip()
    if not text:
        return None
    if len(text.encode("utf-8")) > MAX_BYTES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"{label} is too large (max 50 KB).")
    try:
        parsed = json.loads(text)
    except ValueError as err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"{label} is not valid JSON: {err}") from err
    if not isinstance(parsed, (dict, list)):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f'{label} must be a JSON object, e.g. {{"@context": "https://schema.org", ...}}.')
    return text
