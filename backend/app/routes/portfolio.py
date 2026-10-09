from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile
from sqlalchemy.orm import Session
from typing import Optional
from app.schema import PortfolioResponse, UpdatePortfolio
from app.database import get_db
from app import models
from app.routes.admin import get_current_admin_dependence
from app.uploads import IMAGE_EXTENSIONS, MAX_IMAGE_BYTES, delete_upload, has_file, require_alt, save_upload
from app.trash import move_to_trash

router = APIRouter()

# -------------------------------------------------------------
# CREATE PORTFOLIO
# -------------------------------------------------------------
@router.post("/create", response_model=PortfolioResponse)
def create_portfolio(
    project_title: str = Form(...),
    category_node: str = Form(...),
    deployment_year: str = Form(...),

    business_challenge: str = Form(...),
    solution_node: str = Form(...),

    meta_title: Optional[str] = Form(None),
    meta_description: Optional[str] = Form(None),
    meta_keywords: Optional[str] = Form(None),

    image_file: UploadFile = File(...),
    primary_image_alt: str = Form(None),

    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence)
):
    alt = require_alt(True, primary_image_alt)
    image_url = save_upload(image_file, "portfolio", IMAGE_EXTENSIONS, MAX_IMAGE_BYTES)

    new_portfolio = models.Portfolio(
        project_title=project_title,
        category_node=category_node,
        deployment_year=deployment_year,
        primary_image=image_url,
        primary_image_alt=alt,
        business_challenge=business_challenge,
        solution_node=solution_node,
        meta_title=meta_title,
        meta_description=meta_description,
        meta_keywords=meta_keywords
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
    category_node: str = Form("Web Development"),
    deployment_year: str = Form(...),
    business_challenge: str = Form(...),
    solution_node: str = Form(...),
    meta_title: Optional[str] = Form(""),
    meta_description: Optional[str] = Form(""),
    meta_keywords: Optional[str] = Form(""),
    image_file: Optional[UploadFile] = File(None),  # 🔴 Sync with frontend and Create route name
    primary_image_alt: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin_dependence)
):
    item = db.query(models.Portfolio).filter(models.Portfolio.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")

    # Text fields ko update karna
    item.project_title = project_title
    item.category_node = category_node
    item.deployment_year = deployment_year
    item.business_challenge = business_challenge
    item.solution_node = solution_node
    item.meta_title = meta_title
    item.meta_description = meta_description
    item.meta_keywords = meta_keywords

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