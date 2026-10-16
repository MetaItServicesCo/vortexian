"""Service page layout: the ordered blocks of a service page (Dashboard → Manage Services → Page sections).

Stored as JSON in Service.layout: {"blocks": [{"id", "type", "hidden", ...}]}.

Built-in blocks show the service's existing fields and appear exactly once:
    intro     short description, feature points, buttons, image
    why       the three "why choose" points
    overview  the long description ("Read more" unless collapsed is false)
    pricing   the pricing plans (Service.pricing)
Custom sections (up to MAX_CUSTOM): cards, steps, stats, checklist, cta, faq.

Everything is plain text chosen by the admin; this module cleans and limits it.
"""
import json
import re

import nh3
from fastapi import HTTPException

from app.pricing import _link  # same link rules as pricing buttons

BUILT_IN = ("intro", "why", "overview", "pricing")
CUSTOM = ("cards", "steps", "stats", "checklist", "cta", "faq")
MAX_CUSTOM = 8
LIMITS = {"eyebrow": 60, "heading": 140, "intro": 400, "text": 600, "title": 100, "item_text": 300,
          "value": 20, "label": 60, "button_text": 40, "point": 160, "question": 200, "answer": 1500,
          "phone": 40, "icon": 40, "image_alt": 255}
MAX_ITEMS = {"cards": 9, "steps": 6, "stats": 4, "checklist": 12, "faq": 15}
LABELS = {"cards": "Highlight cards", "steps": "Steps", "stats": "Key numbers", "checklist": "Checklist",
          "cta": "Call-to-action band", "faq": "FAQ"}


def _t(value, limit_key: str, multiline: bool = False) -> str:
    text = nh3.clean(str(value or ""), tags=set()).replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
    if multiline:
        text = "\n".join(re.sub(r"[ \t]+", " ", line).strip() for line in text.splitlines())
        text = re.sub(r"\n{3,}", "\n\n", text).strip()
    else:
        text = re.sub(r"\s+", " ", text).strip()
    return text[:LIMITS[limit_key]]


def _image(value) -> str:
    path = str(value or "").strip()[:500]
    if not path:
        return ""
    if path.startswith("/uploads/") or re.match(r"^https://", path, re.I):
        return path
    raise HTTPException(status_code=400, detail="Section images must be uploaded images or https:// addresses.")


def _icon(value) -> str:
    name = str(value or "").strip()
    return name if re.fullmatch(r"[A-Za-z0-9]{1,40}", name) else ""


def _block_id(value, n: int) -> str:
    raw = str(value or "")
    return raw if re.fullmatch(r"[A-Za-z0-9_-]{1,40}", raw) else f"block-{n}"


def _common(block: dict) -> dict:
    return {"eyebrow": _t(block.get("eyebrow"), "eyebrow"), "heading": _t(block.get("heading"), "heading")}


def _items(block: dict, kind: str) -> list:
    items = block.get("items") or []
    if not isinstance(items, list):
        return []
    if len(items) > MAX_ITEMS[kind] * 2:   # clearly not from the editor
        raise HTTPException(status_code=400, detail=f"Too many items in a {LABELS[kind]} section.")
    return items


def _clean_custom(block: dict, kind: str) -> dict:
    out = _common(block)
    label = f'{LABELS[kind]} section "{out["heading"] or "(no heading)"}"'
    if kind == "cards":
        out["intro"] = _t(block.get("intro"), "intro")
        out["items"] = [{
            "icon": _icon(i.get("icon")), "title": _t(i.get("title"), "title"), "text": _t(i.get("text"), "item_text"),
            "button_text": _t(i.get("button_text"), "button_text"), "button_link": _link(i.get("button_link")),
        } for i in _items(block, kind) if isinstance(i, dict)]
        out["items"] = [i for i in out["items"] if i["title"] or i["text"]]
    elif kind == "steps":
        out["intro"] = _t(block.get("intro"), "intro")
        out["items"] = [{"title": _t(i.get("title"), "title"), "text": _t(i.get("text"), "item_text")}
                        for i in _items(block, kind) if isinstance(i, dict)]
        out["items"] = [i for i in out["items"] if i["title"] or i["text"]]
    elif kind == "stats":
        out["items"] = [{"value": _t(i.get("value"), "value"), "label": _t(i.get("label"), "label")}
                        for i in _items(block, kind) if isinstance(i, dict)]
        out["items"] = [i for i in out["items"] if i["value"] or i["label"]]
    elif kind == "checklist":
        out["text"] = _t(block.get("text"), "text", multiline=True)
        out["items"] = [p for p in (_t(i, "point") for i in _items(block, kind) if isinstance(i, str)) if p]
        out["image"] = _image(block.get("image"))
        out["image_alt"] = _t(block.get("image_alt"), "image_alt")
        if out["image"] and not out["image_alt"]:
            raise HTTPException(status_code=400, detail=f"{label}: the image needs alt text.")
        out["image_side"] = "left" if block.get("image_side") == "left" else "right"
        out["button_text"] = _t(block.get("button_text"), "button_text")
        out["button_link"] = _link(block.get("button_link"))
    elif kind == "cta":
        out["text"] = _t(block.get("text"), "text", multiline=True)
        out["show_phone"] = bool(block.get("show_phone"))
        out["phone"] = _t(block.get("phone"), "phone")
        out["button_text"] = _t(block.get("button_text"), "button_text")
        out["button_link"] = _link(block.get("button_link"))
    elif kind == "faq":
        out["text"] = _t(block.get("text"), "text", multiline=True)
        out["button_text"] = _t(block.get("button_text"), "button_text")
        out["button_link"] = _link(block.get("button_link"))
        out["items"] = [{"question": _t(i.get("question"), "question"), "answer": _t(i.get("answer"), "answer", multiline=True)}
                        for i in _items(block, kind) if isinstance(i, dict)]
        out["items"] = [i for i in out["items"] if i["question"]]
        if any(not i["answer"] for i in out["items"]):
            raise HTTPException(status_code=400, detail=f"{label}: every question needs an answer.")
    if kind in MAX_ITEMS and len(out.get("items", [])) > MAX_ITEMS[kind]:
        raise HTTPException(status_code=400, detail=f"{label}: up to {MAX_ITEMS[kind]} items.")
    if kind in ("cards", "steps", "stats", "faq") and not out["items"] and not block.get("hidden"):
        raise HTTPException(status_code=400, detail=f"{label} is empty. Add at least one item, hide it, or remove it.")
    if kind in ("checklist", "cta") and not (out["heading"] or out.get("items") or out.get("text")) and not block.get("hidden"):
        raise HTTPException(status_code=400, detail=f"{label} is empty. Add a heading or text, hide it, or remove it.")
    return out


def clean_layout(raw) -> str | None:
    """Validate the page sections from the editor; returns JSON to store (None: default layout)."""
    if raw in (None, ""):
        return None
    try:
        data = json.loads(raw) if isinstance(raw, str) else raw
    except ValueError:
        raise HTTPException(status_code=400, detail="The page sections could not be read. Please try again.")
    blocks = data.get("blocks") if isinstance(data, dict) else None
    if not isinstance(blocks, list):
        raise HTTPException(status_code=400, detail="The page sections could not be read. Please try again.")

    out, seen, custom = [], set(), 0
    for n, block in enumerate(blocks):
        if not isinstance(block, dict):
            continue
        kind = block.get("type")
        base = {"id": _block_id(block.get("id"), n), "type": kind, "hidden": bool(block.get("hidden"))}
        if kind in BUILT_IN:
            if kind in seen:
                continue
            seen.add(kind)
            if kind in ("why", "overview"):
                base["heading"] = _t(block.get("heading"), "heading")
            if kind == "overview":
                base["collapsed"] = block.get("collapsed") is not False
            out.append(base)
        elif kind in CUSTOM:
            custom += 1
            if custom > MAX_CUSTOM:
                raise HTTPException(status_code=400, detail=f"Up to {MAX_CUSTOM} custom sections per service page.")
            out.append({**base, **_clean_custom(block, kind)})
    for kind in BUILT_IN:   # built-in blocks are never lost, only hidden
        if kind not in seen:
            out.append({"id": f"builtin-{kind}", "type": kind, "hidden": False, **({"collapsed": True} if kind == "overview" else {})})
    return json.dumps({"blocks": out}, ensure_ascii=False)

