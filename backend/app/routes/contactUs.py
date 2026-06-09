from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.database import get_db
from app import models 
from app.schema import CreateContactUs ,ContactUsResponse
from app.routes.admin import get_current_admin_dependence


router = APIRouter()

@router.post("/contact-us")
def create_contact_us(
    data: CreateContactUs,
    db: Session = Depends(get_db)
):
    contact = models.ContactUs(**data.model_dump())

    db.add(contact)
    db.commit()
    db.refresh(contact)

    return {
        "message": "Message sent successfully"
    }

@router.get(
    "/contact-us",
    response_model=list[ContactUsResponse]
)
def get_contact_messages(
    db: Session = Depends(get_db),
    admin: models.Admin = Depends(get_current_admin_dependence)
):
    return (
        db.query(models.ContactUs)
        .order_by(models.ContactUs.id.desc())
        .all()
    )


@router.delete("/contact-us/{message_id}")
def delete_contact_message(
    message_id: int,
    db: Session = Depends(get_db),
    admin: models.Admin = Depends(get_current_admin_dependence)
):
    message = (
        db.query(models.ContactUs)
        .filter(models.ContactUs.id == message_id)
        .first()
    )

    if not message:
        raise HTTPException(
            status_code=404,
            detail="Message not found"
        )

    db.delete(message)
    db.commit()

    return {
        "message": "Deleted successfully"
    }