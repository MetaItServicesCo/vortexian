from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import os, uuid, shutil

from app.database import get_db
from app import models
from app.schema import CareerApplicationResponse
from app.routes.admin import get_current_admin_dependence

router = APIRouter()

UPLOAD_DIR = "uploads/career"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {"pdf", "doc", "docx"}


# ---------------- CREATE CAREER APPLICATION ----------------
@router.post("/", status_code=201)
def create_career_application(
    first_name: str = Form(...),
    last_name: str = Form(...),
    linkedin_url: str = Form(...),
    company_name: str = Form(None),
    email: str = Form(None),
    show_contact_public: bool = Form(False),
    cv: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    ext = cv.filename.split(".")[-1].lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOC, and DOCX files are allowed",
        )

    filename = f"{uuid.uuid4()}.{ext}"
    file_location = f"{UPLOAD_DIR}/{filename}"

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(cv.file, buffer)

    cv_path = f"/uploads/career/{filename}"

    application = models.CareerApplication(
        company_name=company_name,
        first_name=first_name,
        last_name=last_name,
        email=email,
        linkedin_url=linkedin_url,
        cv_url=cv_path,
        show_contact_public=show_contact_public,
    )

    db.add(application)
    db.commit()
    db.refresh(application)

    return {"message": "Application submitted successfully"}


# ---------------- GET ALL CAREER APPLICATIONS (ADMIN) ----------------
@router.get("/", response_model=list[CareerApplicationResponse])
def get_all_applications(
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence),
):
    applications = (
        db.query(models.CareerApplication)
        .order_by(models.CareerApplication.id.desc())
        .all()
    )

    return [CareerApplicationResponse.model_validate(a) for a in applications]


# ---------------- GET SINGLE CAREER APPLICATION (ADMIN) ----------------
@router.get("/{application_id}", response_model=CareerApplicationResponse)
def get_single_application(
    application_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence),
):
    application = (
        db.query(models.CareerApplication)
        .filter(models.CareerApplication.id == application_id)
        .first()
    )

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    return CareerApplicationResponse.model_validate(application)


# ---------------- DELETE CAREER APPLICATION (ADMIN) ----------------
@router.delete("/{application_id}")
def delete_application(
    application_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence),
):
    application = (
        db.query(models.CareerApplication)
        .filter(models.CareerApplication.id == application_id)
        .first()
    )

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    # CV file bhi server se delete karo
    if application.cv_url:
        file_path = application.cv_url.lstrip("/")
        if os.path.exists(file_path):
            os.remove(file_path)

    db.delete(application)
    db.commit()

    return {"message": "Application deleted successfully"}