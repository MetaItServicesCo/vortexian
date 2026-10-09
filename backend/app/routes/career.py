from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from pydantic import EmailStr, TypeAdapter, ValidationError

from app.database import get_db
from app import models
from app.schema import CareerApplicationResponse
from app.routes.admin import get_current_admin_dependence
from app.uploads import DOCUMENT_EXTENSIONS, IMAGE_EXTENSIONS, MAX_DOCUMENT_BYTES, MAX_IMAGE_BYTES, delete_upload, has_file, save_upload
from app.trash import move_to_trash

router = APIRouter()

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
    first_name, last_name, linkedin_url = first_name.strip(), last_name.strip(), linkedin_url.strip()
    if not (first_name and last_name and linkedin_url):
        raise HTTPException(status_code=400, detail="First name, last name and LinkedIn URL are required")

    email = (email or "").strip() or None
    if email:
        try:
            email = TypeAdapter(EmailStr).validate_python(email)
        except ValidationError:
            raise HTTPException(status_code=400, detail="Invalid email address")

    cv_path = save_upload(cv, "career", DOCUMENT_EXTENSIONS, MAX_DOCUMENT_BYTES)
    image_path = None

    try:
        if has_file(image):
            image_path = save_upload(image, "career", IMAGE_EXTENSIONS, MAX_IMAGE_BYTES)

        application = models.CareerApplication(
            company_name=(company_name or "").strip() or None,
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
    except BaseException:
        # Don't leave orphaned files behind when validation or the insert fails
        db.rollback()
        delete_upload(cv_path)
        delete_upload(image_path)
        raise

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

    move_to_trash(db, "career", [application], admin)

    return {"message": "Application deleted successfully"}