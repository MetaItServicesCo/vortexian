from fastapi import APIRouter, status, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Annotated
import shutil, os, uuid

from app.database import get_db
from app import models
from app.schema import CreateService, ServiceResponse, UpdateService
from app.routes.admin import get_current_admin_dependence

router = APIRouter()

@router.post("/create-service", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
def create_service(
    service_title: str = Form(...),
    url_slug: str = Form(...),
    category_stack: str = Form(...),
    lucide_icon: str = Form(...),
    image_source_type: str = Form(...),
    image_showcase_url: str = Form(None),
    short_description: str = Form(...),
    long_description: str = Form(...),
    feature_1: str = Form(None),
    feature_2: str = Form(None),
    feature_3: str = Form(None),
    feature_4: str = Form(None),
    why_choose_1: str = Form(None),
    why_choose_2: str = Form(None),
    why_choose_3: str = Form(None),
    meta_title: str = Form(...),
    keywords: str = Form(...),
    meta_description: str = Form(...),
    image_file: UploadFile = File(None),
    db: Session = Depends(get_db),
    admin: models.Admin = Depends(get_current_admin_dependence)
):
    existing_service = db.query(models.Service).filter(
        models.Service.url_slug == url_slug
    ).first()

    if existing_service:
        raise HTTPException(status_code=400, detail="Service slug already exists")

    image_path = None

    if image_source_type == "url":
        image_path = image_showcase_url

    elif image_source_type == "file":
        if not image_file:
            raise HTTPException(status_code=400, detail="Image file required")

        file_extension = image_file.filename.split(".")[-1]
        file_name = f"{uuid.uuid4()}.{file_extension}"
        file_location = f"uploads/services/{file_name}"

        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(image_file.file, buffer)

        image_path = f"/uploads/services/{file_name}"
    else:
        raise HTTPException(status_code=400, detail="Invalid image source type")

    new_service = models.Service(
        service_title=service_title,
        url_slug=url_slug,
        category_stack=category_stack,
        lucide_icon=lucide_icon,
        image_source_type=image_source_type,
        image_showcase_url=image_path,
        short_description=short_description,
        long_description=long_description,
        feature_1=feature_1,
        feature_2=feature_2,
        feature_3=feature_3,
        feature_4=feature_4,
        why_choose_1=why_choose_1,
        why_choose_2=why_choose_2,
        why_choose_3=why_choose_3,
        meta_title=meta_title,
        keywords=keywords,
        meta_description=meta_description
    )

    db.add(new_service)
    db.commit()
    db.refresh(new_service)
    return new_service


@router.get("/", response_model=list[ServiceResponse])
def get_all_services(db: Annotated[Session, Depends(get_db)]):
    return db.query(models.Service).all()


@router.get("/id/{service_id}", response_model=ServiceResponse)
def get_service_by_id(service_id: int, db: Annotated[Session, Depends(get_db)]):
    service = db.query(models.Service).filter(models.Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    return service


@router.get("/{slug}", response_model=ServiceResponse)
def get_single_service(slug: str, db: Annotated[Session, Depends(get_db)]):
    service = db.query(models.Service).filter(models.Service.url_slug == slug).first()
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    return service


@router.patch("/update-service/{service_id}", response_model=ServiceResponse)
def update_service(
    service_id: int,
    data: UpdateService,
    db: Annotated[Session, Depends(get_db)],
    admin: models.Admin = Depends(get_current_admin_dependence)
):
    service = db.query(models.Service).filter(models.Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")

    if data.url_slug:
        existing_slug = db.query(models.Service).filter(
            models.Service.url_slug == data.url_slug,
            models.Service.id != service_id
        ).first()
        if existing_slug:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Slug already exists")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(service, key, value)

    db.commit()
    db.refresh(service)
    return service


@router.delete("/delete-service/{service_id}")
def delete_service(
    service_id: int,
    db: Annotated[Session, Depends(get_db)],
    admin: models.Admin = Depends(get_current_admin_dependence)
):
    service = db.query(models.Service).filter(models.Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")

    db.delete(service)
    db.commit()
    return {"message": "Service deleted successfully"}