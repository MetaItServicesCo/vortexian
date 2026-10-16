from fastapi import APIRouter, status, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Annotated

from app.database import get_db
from app import models
from app.schema import CreateService, ServiceMenuItem, ServiceResponse, UpdateService
from app.routes.admin import get_current_admin_dependence
from app.sanitize import clean_html, slugify
from app.schema_markup import clean_schema_json
from app import categories as cats
from app.uploads import IMAGE_EXTENSIONS, MAX_IMAGE_BYTES, delete_upload, has_file, require_alt, save_upload
from app.trash import move_to_trash
from app.pricing import clean_pricing
from app.service_layout import clean_layout

router = APIRouter()

@router.post("/create-service", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
def create_service(
    service_title: str = Form(...),
    url_slug: str = Form(...),
    category_stack: str = Form(None),  # legacy: category name
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
    image_alt: str = Form(None),
    show_in_menu: bool = Form(True),
    schema_json: str = Form(None),
    category_id: str = Form(None),
    pricing: str = Form(None),
    layout: str = Form(None),
    db: Session = Depends(get_db),
    admin: models.Admin = Depends(get_current_admin_dependence)
):
    image_alt = require_alt(True, image_alt)
    url_slug = slugify(url_slug)
    if not url_slug:
        raise HTTPException(status_code=400, detail="URL slug must contain letters or numbers")

    existing_service = db.query(models.Service).filter(
        models.Service.url_slug == url_slug
    ).first()

    if existing_service:
        raise HTTPException(status_code=400, detail="Service slug already exists")

    image_path = None

    if image_source_type == "url":
        if not image_showcase_url:
            raise HTTPException(status_code=400, detail="Image URL required")
        image_path = image_showcase_url

    elif image_source_type == "file":
        if not has_file(image_file):
            raise HTTPException(status_code=400, detail="Image file required")

        image_path = save_upload(image_file, "services", IMAGE_EXTENSIONS, MAX_IMAGE_BYTES)
    else:
        raise HTTPException(status_code=400, detail="Invalid image source type")

    category = cats.resolve(db, "service", category_id, name=category_stack, create=True)
    new_service = models.Service(
        service_title=service_title,
        url_slug=url_slug,
        category_stack=category.name,
        category_id=category.id,
        lucide_icon=lucide_icon,
        image_source_type=image_source_type,
        image_showcase_url=image_path,
        image_alt=image_alt,
        short_description=short_description,
        long_description=clean_html(long_description),
        feature_1=feature_1,
        feature_2=feature_2,
        feature_3=feature_3,
        feature_4=feature_4,
        why_choose_1=why_choose_1,
        why_choose_2=why_choose_2,
        why_choose_3=why_choose_3,
        meta_title=meta_title,
        keywords=keywords,
        meta_description=meta_description,
        show_in_menu=show_in_menu,
        schema_json=clean_schema_json(schema_json),
        pricing=clean_pricing(pricing),
        layout=clean_layout(layout),
    )

    db.add(new_service)
    db.commit()
    db.refresh(new_service)
    return new_service


@router.get("/", response_model=list[ServiceResponse])
def get_all_services(db: Annotated[Session, Depends(get_db)]):
    return db.query(models.Service).all()


# Services for the website's Services dropdown (title + address only).
# Declared before "/{slug}" so "menu" isn't read as a service slug.
@router.get("/menu", response_model=list[ServiceMenuItem])
def get_menu_services(db: Annotated[Session, Depends(get_db)]):
    return db.query(models.Service).filter(models.Service.show_in_menu.is_(True)).order_by(models.Service.id).all()


# Services dropdown grouped by category: categories switched on for the menu,
# in their order, each with its services that have "Show in Services menu" on.
# Services without a (known) category are listed under "Others".
@router.get("/menu-tree")
def get_menu_tree(db: Annotated[Session, Depends(get_db)]):
    others = cats.others(db, "service")
    db.commit()
    categories = cats.ordered(db, "service")
    known = {c.id for c in categories}
    groups = {c.id: [] for c in categories}
    for s in db.query(models.Service).filter(models.Service.show_in_menu.is_(True)).order_by(models.Service.id):
        groups[s.category_id if s.category_id in known else others.id].append({"id": s.id, "service_title": s.service_title, "url_slug": s.url_slug})
    return [
        {"id": c.id, "name": c.name, "services": groups[c.id]}
        for c in categories
        if c.show_in_menu and groups[c.id]
    ]


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

    if data.url_slug is not None:
        data.url_slug = slugify(data.url_slug)
        if not data.url_slug:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="URL slug must contain letters or numbers")
        existing_slug = db.query(models.Service).filter(
            models.Service.url_slug == data.url_slug,
            models.Service.id != service_id
        ).first()
        if existing_slug:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Slug already exists")

    update_data = data.model_dump(exclude_unset=True)
    if "show_in_menu" in update_data and update_data["show_in_menu"] is None:
        del update_data["show_in_menu"]  # never store NULL
    if "schema_json" in update_data:
        update_data["schema_json"] = clean_schema_json(update_data["schema_json"])
    if "pricing" in update_data:
        update_data["pricing"] = clean_pricing(update_data["pricing"])
    if "layout" in update_data:
        update_data["layout"] = clean_layout(update_data["layout"])
    if update_data.get("category_id") is not None or update_data.get("category_stack"):
        category = cats.resolve(db, "service", update_data.get("category_id"), name=update_data.get("category_stack"), create=True)
        update_data["category_id"], update_data["category_stack"] = category.id, category.name
    else:
        update_data.pop("category_id", None)
        update_data.pop("category_stack", None)
    if update_data.get("long_description") is not None:
        update_data["long_description"] = clean_html(update_data["long_description"])
    old_image = service.image_showcase_url
    for key, value in update_data.items():
        setattr(service, key, value)

    service.image_alt = require_alt(True, service.image_alt)

    db.commit()
    db.refresh(service)

    if service.image_showcase_url != old_image:
        delete_upload(old_image)

    return service


@router.post("/update-service-image/{service_id}", response_model=ServiceResponse)
def update_service_image(
    service_id: int,
    db: Annotated[Session, Depends(get_db)],
    image_file: UploadFile = File(...),
    image_alt: str = Form(None),
    admin: models.Admin = Depends(get_current_admin_dependence)
):
    service = db.query(models.Service).filter(models.Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")

    image_alt = require_alt(True, image_alt)
    new_image = save_upload(image_file, "services", IMAGE_EXTENSIONS, MAX_IMAGE_BYTES)
    old_image = service.image_showcase_url

    service.image_source_type = "file"
    service.image_showcase_url = new_image
    service.image_alt = image_alt
    db.commit()
    db.refresh(service)

    delete_upload(old_image)
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

    move_to_trash(db, "services", [service], admin)
    return {"message": "Service deleted successfully"}