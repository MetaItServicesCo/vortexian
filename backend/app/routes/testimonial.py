from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app import models
from app.schema import TestimonialResponse
from app.routes.admin import get_current_admin_dependence
from app.uploads import IMAGE_EXTENSIONS, MAX_IMAGE_BYTES, delete_upload, has_file, require_alt, save_upload
from app.trash import move_to_trash

router = APIRouter()


# ---------------- CREATE TESTIMONIAL (ADMIN) ----------------
@router.post("/create", response_model=TestimonialResponse, status_code=201)
def create_testimonial(
    client_name: str = Form(...),
    testimonial_text: str = Form(...),
    client_designation: Optional[str] = Form(None),
    company: Optional[str] = Form(None),
    rating: int = Form(5),
    profile_image: UploadFile = File(None),
    profile_image_alt: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence),
):
    if not 1 <= rating <= 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    image_path = None
    alt = require_alt(has_file(profile_image), profile_image_alt)
    if has_file(profile_image):
        image_path = save_upload(profile_image, "testimonials", IMAGE_EXTENSIONS, MAX_IMAGE_BYTES)

    testimonial = models.Testimonial(
        client_name=client_name.strip(),
        client_designation=client_designation or None,
        company=company or None,
        testimonial_text=testimonial_text.strip(),
        rating=rating,
        profile_image=image_path,
        profile_image_alt=alt,
    )

    db.add(testimonial)
    db.commit()
    db.refresh(testimonial)

    return testimonial


# ---------------- GET ALL TESTIMONIALS (PUBLIC) ----------------
@router.get("/", response_model=list[TestimonialResponse])
def get_all_testimonials(db: Session = Depends(get_db)):
    return db.query(models.Testimonial).order_by(models.Testimonial.id.desc()).all()


# ---------------- DELETE TESTIMONIAL (ADMIN) ----------------
@router.delete("/delete/{testimonial_id}")
def delete_testimonial(
    testimonial_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence),
):
    testimonial = (
        db.query(models.Testimonial)
        .filter(models.Testimonial.id == testimonial_id)
        .first()
    )

    if not testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found")

    move_to_trash(db, "testimonials", [testimonial], admin)

    return {"message": "Testimonial deleted successfully"}
