from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form 
from sqlalchemy.orm import Session
import shutil, uuid, os

from app.database import get_db
from app import models
from app.schema import ContactResponse
from app.routes.admin import get_current_admin_dependence

router = APIRouter()

UPLOAD_DIR = "uploads/contacts"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/", status_code=201)
def create_contact(
    first_name: str = Form(...),
    last_name: str = Form(...),
    phone: str = Form(...),
    email: str = Form(...),
    preferred_contact_method: str = Form(...),
    service: str = Form(...),
    website_url: str = Form(None),
    completion_date: str = Form(None),
    message: str = Form(...),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
):

    file_path = None

    if file:
        file_ext = file.filename.split(".")[-1]
        file_name = f"{uuid.uuid4()}.{file_ext}"
        file_location = f"{UPLOAD_DIR}/{file_name}"

        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        file_path = f"/uploads/contacts/{file_name}"

    contact = models.Contact(
        first_name=first_name,
        last_name=last_name,
        phone=phone,
        email=email,
        preferred_contact_method=preferred_contact_method,
        service=service,
        website_url=website_url,
        completion_date=completion_date,
        message=message,
        project_file=file_path
    )

    db.add(contact)
    db.commit()
    db.refresh(contact)

    return {"message": "Contact request submitted successfully"}


@router.get("/", response_model=list[ContactResponse])
def get_all_contacts(db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):

    contacts = db.query(models.Contact).order_by(models.Contact.id.desc()).all()

    valid_contacts = []
    for c in contacts:
        try:
            valid_contacts.append(ContactResponse.model_validate(c))
        except ValidationError:
            continue  # skip bad DB rows

    return valid_contacts


@router.delete("/{contact_id}")
def delete_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    admin: models.Admin = Depends(get_current_admin_dependence)
):
    contact = db.query(models.Contact).filter(models.Contact.id == contact_id).first()

    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    db.delete(contact)
    db.commit()

    return {"message": "Contact deleted successfully"}