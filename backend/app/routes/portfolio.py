from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile
from sqlalchemy.orm import Session
import uuid
import shutil
import os
from typing import Optional
from app.schema import PortfolioResponse, UpdatePortfolio
from app.database import get_db
from app import models
from app.routes.admin import get_current_admin_dependence

router = APIRouter()

# -------------------------------------------------------------
# CREATE PORTFOLIO
# -------------------------------------------------------------
@router.post("/create", response_model=PortfolioResponse)
def create_portfolio(
    project_title: str = Form(...),
    category_node: str = Form(...),
    deployment_year: int = Form(...),  # Changed to int for consistency

    business_challenge: str = Form(...),
    solution_node: str = Form(...),

    meta_title: Optional[str] = Form(None),
    meta_description: Optional[str] = Form(None),
    meta_keywords: Optional[str] = Form(None),

    image_file: UploadFile = File(...),

    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence)
):
    file_ext = image_file.filename.split(".")[-1]
    file_name = f"{uuid.uuid4()}.{file_ext}"
    file_path = f"uploads/portfolio/{file_name}"

    os.makedirs("uploads/portfolio", exist_ok=True)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image_file.file, buffer)

    image_url = f"/uploads/portfolio/{file_name}"

    new_portfolio = models.Portfolio(
        project_title=project_title,
        category_node=category_node,
        deployment_year=deployment_year,
        primary_image=image_url,
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
    return db.query(models.Portfolio).all()

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
    deployment_year: int = Form(...),
    business_challenge: str = Form(...),
    solution_node: str = Form(...),
    meta_title: Optional[str] = Form(""),
    meta_description: Optional[str] = Form(""),
    meta_keywords: Optional[str] = Form(""),
    image_file: Optional[UploadFile] = File(None),  # 🔴 Sync with frontend and Create route name
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

    # Agar user ne nai image select ki hai to purani replace ya nai unique file save hogi
    if image_file and image_file.filename:
        UPLOAD_DIR = "uploads/portfolio"
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        file_ext = image_file.filename.split(".")[-1]
        file_name = f"{uuid.uuid4()}.{file_ext}"  # Generates unique file name like create route
        file_path = f"{UPLOAD_DIR}/{file_name}"
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image_file.file, buffer)
            
        item.primary_image = f"/uploads/portfolio/{file_name}"

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

    db.delete(item)
    db.commit()

    return {"message": "Deleted successfully"}