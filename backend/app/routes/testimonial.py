from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import shutil, uuid, os

from app.database import get_db
from app import models
from app.schema import (
    CreateTestimonial,
    UpdateTestimonial,
    TestimonialResponse
)
from app.routes.admin import get_current_admin_dependence

router = APIRouter()

UPLOAD_DIR = "uploads/testimonials"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/create")
def create_testimonial(
    full_name: str = Form(...),
    designation: str = Form(None),
    company: str = Form(None),
    testimonial_text: str = Form(...),
    rating: int = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    admin: models.Admin = Depends(get_current_admin_dependence)
):

    image_path = None

    # upload image
    if image:
        file_ext = image.filename.split(".")[-1]
        file_name = f"{uuid.uuid4()}.{file_ext}"
        file_location = f"{UPLOAD_DIR}/{file_name}"

        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        image_path = f"/uploads/testimonials/{file_name}"

    testimonial = models.Testimonial(
        full_name=full_name,
        designation=designation,
        company=company,
        testimonial_text=testimonial_text,
        rating=rating,
        profile_image=image_path
    )

    db.add(testimonial)
    db.commit()
    db.refresh(testimonial)

    return testimonial

@router.get("/public", response_model=list[TestimonialResponse])
def get_testimonials(db: Session = Depends(get_db)):
    return db.query(models.Testimonial).order_by(models.Testimonial.id.desc()).all()

@router.get("/admin", response_model=list[TestimonialResponse])
def get_testimonials_admin(
    db: Session = Depends(get_db),
    admin: models.Admin = Depends(get_current_admin_dependence)
):
    return db.query(models.Testimonial).order_by(models.Testimonial.id.desc()).all()


@router.patch("/update/{testimonial_id}")
def update_testimonial(
    testimonial_id: int,
    data: UpdateTestimonial,
    db: Session = Depends(get_db),
    admin: models.Admin = Depends(get_current_admin_dependence)
):

    testimonial = db.query(models.Testimonial).filter(
        models.Testimonial.id == testimonial_id
    ).first()

    if not testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(testimonial, key, value)

    db.commit()
    db.refresh(testimonial)

    return testimonial

@router.delete("/delete/{testimonial_id}")
def delete_testimonial(
    testimonial_id: int,
    db: Session = Depends(get_db),
    admin: models.Admin = Depends(get_current_admin_dependence)
):

    testimonial = db.query(models.Testimonial).filter(
        models.Testimonial.id == testimonial_id
    ).first()

    if not testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found")

    db.delete(testimonial)
    db.commit()

    return {"message": "Testimonial deleted successfully"}