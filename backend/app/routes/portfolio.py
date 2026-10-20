import json
import re
from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile
from sqlalchemy.orm import Session
from typing import Optional
from app.schema import PortfolioResponse, UpdatePortfolio
from app.database import get_db
from app import models
from app.routes.admin import get_current_admin_dependence
from app.schema_markup import clean_schema_json
from app.uploads import IMAGE_EXTENSIONS, MAX_IMAGE_BYTES, delete_upload, has_file, require_alt, save_upload
from app.trash import move_to_trash
from app.sanitize import clean_html, slugify
from app import categories as cats

router = APIRouter()


def rich_text(value: str, label: str) -> str:
    """Challenge/Solution come from the rich text editor: sanitise, and refuse empty content."""
    html = clean_html(value) or ""
    if not re.search(r"<(img|video)", html) and not re.sub(r"<[^>]+>|&nbsp;|\s", "", html):
        raise HTTPException(status_code=400, detail=f"Please write the {label}.")
    return html

def _slug_taken(db: Session, slug: str, exclude_id: int | None = None) -> bool:
    query = db.query(models.Portfolio.id).filter(models.Portfolio.slug == slug)
    if exclude_id is not None:
        query = query.filter(models.Portfolio.id != exclude_id)
    return db.query(query.exists()).scalar()


def resolve_slug(db: Session, requested: str | None, title: str, exclude_id: int | None = None) -> str:
    """The slug is required: an explicit one must be unique; one made from the title gets a numeric suffix."""
    if requested is not None and requested.strip():
        slug = slugify(requested)
        if not slug:
            raise HTTPException(status_code=400, detail="The URL slug must contain letters or numbers.")
        if _slug_taken(db, slug, exclude_id):
            raise HTTPException(status_code=400, detail=f'The URL "/portfolio/{slug}" is already used by another project.')
        return slug
    base = slugify(title) or "project"
    slug, n = base, 2
    while _slug_taken(db, slug, exclude_id):
        slug, n = f"{base}-{n}", n + 1
    return slug


# Page texts (label, intro, section headings), sent together as one JSON object in the
# "page_texts" form field (a plain empty form field would arrive as "not sent"). Plain text,
# trimmed and length-capped; "" = cleared by the admin; a missing key = keep what's saved.
PAGE_TEXT_LIMITS = {"overview_label": 120, "overview_text": 2000, "challenge_heading": 200, "solution_heading": 200}


def page_texts(raw: Optional[str]) -> dict:
    if not raw:
        return {}
    try:
        data = json.loads(raw)
    except ValueError:
        raise HTTPException(status_code=400, detail="Page texts could not be read.")
    if not isinstance(data, dict):
        raise HTTPException(status_code=400, detail="Page texts could not be read.")
    return {k: str(data[k] or "").strip()[:limit] for k, limit in PAGE_TEXT_LIMITS.items() if k in data}


# Title design (JSON from the editor): only known choices are kept. "lines" (the title with the
# admin's own line breaks) must keep exactly the title's words, so the heading text never drifts
# from the title Google and the cards use. Returns JSON text, or None for the standard look.
TITLE_CHOICES = {"size": {"s", "m", "l", "xl"}, "weight": {"semibold", "bold", "black"}, "case": {"upper", "none"}}
TITLE_STANDARD = {"size": "l", "weight": "black", "case": "upper", "color": "white", "highlight_color": "blue"}  # = TITLE_DESIGN_DEFAULTS (src/lib/portfolio.js)
TITLE_COLOR = re.compile(r"^(white|blue|lavender|gradient|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})$")


def title_design(raw: Optional[str], title: str) -> Optional[str]:
    try:
        data = json.loads(raw) if raw else {}
    except ValueError:
        raise HTTPException(status_code=400, detail="Title design could not be read.")
    if not isinstance(data, dict):
        raise HTTPException(status_code=400, detail="Title design could not be read.")
    out = {k: data[k] for k, allowed in TITLE_CHOICES.items() if data.get(k) in allowed}
    for k in ("color", "highlight_color"):
        if isinstance(data.get(k), str) and TITLE_COLOR.match(data[k]):
            out[k] = data[k]
    if isinstance(data.get("highlight"), str) and data["highlight"].strip():
        out["highlight"] = data["highlight"].strip()[:200]
    lines = data.get("lines")
    if isinstance(lines, str) and lines.strip():
        if " ".join(lines.split()) != " ".join((title or "").split()):
            raise HTTPException(status_code=400, detail="Title line breaks: keep exactly the same words as the project title (only add line breaks).")
        out["lines"] = lines.strip()[:400]
    out = {k: v for k, v in out.items() if TITLE_STANDARD.get(k) != v}  # only what differs from the standard look
    return json.dumps(out) if out else None


# -------------------------------------------------------------
# CREATE PORTFOLIO
# -------------------------------------------------------------
@router.post("/create", response_model=PortfolioResponse)
def create_portfolio(
    project_title: str = Form(...),
    category_node: Optional[str] = Form(None),   # category name (older clients)
    category_id: Optional[str] = Form(None),     # managed category (Dashboard → Categories)
    slug: Optional[str] = Form(None),
    deployment_year: str = Form(...),

    business_challenge: str = Form(...),
    solution_node: str = Form(...),

    meta_title: Optional[str] = Form(None),
    meta_description: Optional[str] = Form(None),
    meta_keywords: Optional[str] = Form(None),

    image_file: UploadFile = File(...),
    primary_image_alt: str = Form(None),
    schema_json: Optional[str] = Form(None),
    page_texts_json: Optional[str] = Form(None, alias="page_texts"),
    title_design_json: Optional[str] = Form(None, alias="title_design"),

    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence)
):
    alt = require_alt(True, primary_image_alt)
    schema_json = clean_schema_json(schema_json)
    cat = cats.resolve(db, "portfolio", category_id=category_id, name=category_node, create=True)
    slug = resolve_slug(db, slug, project_title)
    image_url = save_upload(image_file, "portfolio", IMAGE_EXTENSIONS, MAX_IMAGE_BYTES)

    new_portfolio = models.Portfolio(
        project_title=project_title,
        slug=slug,
        category_node=cat.name,
        category_id=cat.id,
        deployment_year=deployment_year,
        primary_image=image_url,
        primary_image_alt=alt,
        business_challenge=rich_text(business_challenge, "business challenge"),
        solution_node=rich_text(solution_node, "solution"),
        meta_title=meta_title,
        meta_description=meta_description,
        meta_keywords=meta_keywords,
        schema_json=schema_json,
        **page_texts(page_texts_json),
        title_design=title_design(title_design_json, project_title),
    )

    db.add(new_portfolio)
    db.commit()
    db.refresh(new_portfolio)

    return new_portfolio

# -------------------------------------------------------------
# GET ALL PORTFOLIOS
# -------------------------------------------------------------
@router.get("/", response_model=list[PortfolioResponse])
def get_all(db: Session = Depends(get_db)):
    return db.query(models.Portfolio).order_by(models.Portfolio.id.desc()).all()

# -------------------------------------------------------------
# GET SINGLE PORTFOLIO
# -------------------------------------------------------------
@router.get("/slug/{slug}", response_model=PortfolioResponse)
def get_by_slug(slug: str, db: Session = Depends(get_db)):
    item = db.query(models.Portfolio).filter(models.Portfolio.slug == slug).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    return item


@router.get("/{id}", response_model=PortfolioResponse)
def get_one(id: int, db: Session = Depends(get_db)):
    item = db.query(models.Portfolio).filter(models.Portfolio.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    return item

# -------------------------------------------------------------
# UPDATE PORTFOLIO
# -------------------------------------------------------------
@router.patch("/update/{id}", response_model=PortfolioResponse)
def update_portfolio(
    id: int,
    project_title: str = Form(...),
    category_node: Optional[str] = Form(None),
    category_id: Optional[str] = Form(None),
    slug: Optional[str] = Form(None),
    deployment_year: str = Form(...),
    business_challenge: str = Form(...),
    solution_node: str = Form(...),
    meta_title: Optional[str] = Form(""),
    meta_description: Optional[str] = Form(""),
    meta_keywords: Optional[str] = Form(""),
    image_file: Optional[UploadFile] = File(None),  # 🔴 Sync with frontend and Create route name
    primary_image_alt: Optional[str] = Form(None),
    schema_json: Optional[str] = Form(None),  # full replace like the other fields: empty removes it
    page_texts_json: Optional[str] = Form(None, alias="page_texts"),
    title_design_json: Optional[str] = Form(None, alias="title_design"),
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin_dependence)
):
    item = db.query(models.Portfolio).filter(models.Portfolio.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")

    # Text fields ko update karna
    item.project_title = project_title
    if category_id not in (None, "") or category_node:
        cat = cats.resolve(db, "portfolio", category_id=category_id, name=category_node, create=True)
        item.category_node, item.category_id = cat.name, cat.id
    if slug is not None:   # sent by the editor; required
        if not slug.strip():
            raise HTTPException(status_code=400, detail="The URL slug is required.")
        item.slug = resolve_slug(db, slug, project_title, exclude_id=item.id)
    elif not item.slug:
        item.slug = resolve_slug(db, None, project_title, exclude_id=item.id)
    item.deployment_year = deployment_year
    item.business_challenge = rich_text(business_challenge, "business challenge")
    item.solution_node = rich_text(solution_node, "solution")
    item.meta_title = meta_title
    item.meta_description = meta_description
    item.meta_keywords = meta_keywords
    item.schema_json = clean_schema_json(schema_json)
    for field, value in page_texts(page_texts_json).items():  # older clients don't send them: keep what's saved
        setattr(item, field, value)
    if title_design_json is not None:  # "{}" = back to the standard look
        item.title_design = title_design(title_design_json, project_title)

    # Replace the image only when a new one is uploaded
    # Every portfolio item has an image, so alt text is always required
    item.primary_image_alt = require_alt(True, primary_image_alt if primary_image_alt is not None else item.primary_image_alt)

    if has_file(image_file):
        new_image = save_upload(image_file, "portfolio", IMAGE_EXTENSIONS, MAX_IMAGE_BYTES)
        delete_upload(item.primary_image)
        item.primary_image = new_image

    db.commit()
    db.refresh(item)
    return item

# -------------------------------------------------------------
# DELETE PORTFOLIO
# -------------------------------------------------------------
@router.delete("/delete/{id}")
def delete_portfolio(
    id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence)
):
    item = db.query(models.Portfolio).filter(models.Portfolio.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")

    move_to_trash(db, "portfolio", [item], admin)

    return {"message": "Deleted successfully"}