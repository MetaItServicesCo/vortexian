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

ALLOWED_CV_EXTENSIONS = {"pdf", "doc", "docx"}
ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}


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
    image: UploadFile = File(None),

    db: Session = Depends(get_db),
):
    # ---------------- CV VALIDATION ----------------
    if not cv.filename or "." not in cv.filename:
        raise HTTPException(status_code=400, detail="Invalid CV file")

    cv_ext = cv.filename.split(".")[-1].lower()

    if cv_ext not in ALLOWED_CV_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOC, and DOCX files are allowed",
        )

    cv_filename = f"{uuid.uuid4()}.{cv_ext}"
    cv_location = f"{UPLOAD_DIR}/{cv_filename}"

    with open(cv_location, "wb") as buffer:
        shutil.copyfileobj(cv.file, buffer)

    cv_path = f"/uploads/career/{cv_filename}"

    # ---------------- IMAGE UPLOAD (OPTIONAL) ----------------
    image_path = None

    if image:
        if not image.filename or "." not in image.filename:
            raise HTTPException(status_code=400, detail="Invalid image file")

        img_ext = image.filename.split(".")[-1].lower()

        if img_ext not in ALLOWED_IMAGE_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail="Only png, jpg, jpeg, webp images allowed",
            )

        img_filename = f"{uuid.uuid4()}.{img_ext}"
        img_location = f"{UPLOAD_DIR}/{img_filename}"

        with open(img_location, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        image_path = f"/uploads/career/{img_filename}"

    # ---------------- SAVE TO DATABASE ----------------
    application = models.CareerApplication(
        company_name=company_name,
        first_name=first_name,
        last_name=last_name,
        email=email,
        linkedin_url=linkedin_url,
        cv_url=cv_path,
        image_url=image_path,
        show_contact_public=show_contact_public,
    )

    db.add(application)
    db.commit()
    db.refresh(application)

    return {"message": "Application submitted successfully"}


# ---------------- GET ALL (ADMIN) ----------------
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


# ---------------- GET SINGLE (ADMIN) ----------------
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


# ---------------- DELETE (ADMIN) ----------------
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

    # Delete CV file
    if application.cv_url:
        file_path = application.cv_url.lstrip("/")
        if os.path.exists(file_path):
            os.remove(file_path)

    # Delete image file
    if application.image_url:
        img_path = application.image_url.lstrip("/")
        if os.path.exists(img_path):
            os.remove(img_path)

    db.delete(application)
    db.commit()

    return {"message": "Application deleted successfully"}