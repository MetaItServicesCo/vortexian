from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile
from sqlalchemy.orm import Session
import uuid, shutil, os
from app.schema import PortfolioResponse ,UpdatePortfolio
from app.database import get_db
from app import models
from app.routes.admin import get_current_admin_dependence

router = APIRouter()

@router.post("/create", response_model=PortfolioResponse)
def create_portfolio(
    project_title: str = Form(...),
    category_node: str = Form(...),
    deployment_year: str = Form(...),

    business_challenge: str = Form(...),
    solution_node: str = Form(...),

    meta_title: str = Form(None),
    meta_description: str = Form(None),
    meta_keywords: str = Form(None),

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

@router.get("/", response_model=list[PortfolioResponse])
def get_all(db: Session = Depends(get_db)):
    return db.query(models.Portfolio).all()

@router.get("/{id}", response_model=PortfolioResponse)
def get_one(id: int, db: Session = Depends(get_db)):
    item = db.query(models.Portfolio).filter(models.Portfolio.id == id).first()

    if not item:
        raise HTTPException(status_code=404, detail="Not found")

    return item
    

@router.patch("/update/{id}", response_model=PortfolioResponse)
def update_portfolio(
    id: int,
    data: UpdatePortfolio,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence)
):

    item = db.query(models.Portfolio).filter(models.Portfolio.id == id).first()

    if not item:
        raise HTTPException(status_code=404, detail="Not found")

    update_data = data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(item, key, value)

    db.commit()
    db.refresh(item)

    return item


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