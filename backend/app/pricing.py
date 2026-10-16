"""Per-service pricing section (edited in the service editor, shown on the service page).

Stored as JSON in Service.pricing:
    {"enabled": true, "heading": "...", "intro": "...", "note": "...",
     "plans": [{"name", "price", "period", "badge", "description",
                "features": [...], "button_text", "button_link", "highlighted"}]}

Everything is free text chosen by the admin (prices included: "$499",
"From $15/hour", "Custom quote"...). This module only cleans and limits it.
"""
import json
import re

import nh3
from fastapi import HTTPException

MAX_PLANS, MAX_FEATURES = 12, 30
LIMITS = {"heading": 120, "intro": 400, "note": 300, "name": 80, "price": 40, "period": 40, "badge": 30,
          "description": 400, "feature": 160, "button_text": 40, "button_link": 300}
SAFE_LINK = re.compile(r"^(/(?!/)|#|https?://|mailto:|tel:)", re.I)


def _text(value, field: str) -> str:
    """Plain text: no HTML, single spaces, within the field's limit."""
    text = nh3.clean(str(value or ""), tags=set()).replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
    return re.sub(r"\s+", " ", text).strip()[:LIMITS[field]]


def _link(value) -> str:
    link = str(value or "").strip()[:LIMITS["button_link"]]
    if not link:
        return ""
    if re.match(r"^www\.", link, re.I):
        link = f"https://{link}"
    if not SAFE_LINK.match(link):
        raise HTTPException(status_code=400, detail=f'The button link "{link}" isn\'t allowed. Use a page on this site (/contact), a web address (https://…), an email (mailto:…) or a phone number (tel:…).')
    return link


def clean_pricing(raw) -> str | None:
    """Validate pricing from the editor; returns JSON to store, or None when there is no section."""
    if raw in (None, ""):
        return None
    try:
        data = json.loads(raw) if isinstance(raw, str) else raw
    except ValueError:
        raise HTTPException(status_code=400, detail="The pricing section could not be read. Please try again.")
    if not isinstance(data, dict):
        raise HTTPException(status_code=400, detail="The pricing section could not be read. Please try again.")

    plans = []
    for i, plan in enumerate(data.get("plans") or []):
        if not isinstance(plan, dict):
            continue
        features = [_text(f, "feature") for f in (plan.get("features") or []) if isinstance(f, str)]
        cleaned = {
            "name": _text(plan.get("name"), "name"),
            "price": _text(plan.get("price"), "price"),
            "period": _text(plan.get("period"), "period"),
            "badge": _text(plan.get("badge"), "badge"),
            "description": _text(plan.get("description"), "description"),
            "features": [f for f in features if f][:MAX_FEATURES],
            "button_text": _text(plan.get("button_text"), "button_text"),
            "button_link": _link(plan.get("button_link")),
            "highlighted": bool(plan.get("highlighted")),
        }
        if not any(cleaned[k] for k in ("name", "price", "description")) and not cleaned["features"]:
            continue   # an empty plan the admin added but never filled in
        if not cleaned["name"]:
            raise HTTPException(status_code=400, detail=f"Pricing plan {i + 1} needs a name.")
        if len(features) > MAX_FEATURES:
            raise HTTPException(status_code=400, detail=f'Plan "{cleaned["name"]}" has more than {MAX_FEATURES} features.')
        plans.append(cleaned)
    if len(plans) > MAX_PLANS:
        raise HTTPException(status_code=400, detail=f"Up to {MAX_PLANS} pricing plans per service.")

    section = {
        "enabled": bool(data.get("enabled")) and bool(plans),
        "heading": _text(data.get("heading"), "heading"),
        "intro": _text(data.get("intro"), "intro"),
        "note": _text(data.get("note"), "note"),
        "plans": plans,
    }
    if not plans and not section["heading"] and not section["intro"]:
        return None
    return json.dumps(section, ensure_ascii=False)
