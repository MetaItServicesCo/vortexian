from fastapi import APIRouter,status,Depends,HTTPException,File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import Annotated,Optional

from app.database import get_db
from app import models
from app.schema import (
    CreateTeam,
    TeamResponse,
    UpdateTeam
)

from app.routes.admin import get_current_admin_dependence
from app.uploads import IMAGE_EXTENSIONS, MAX_IMAGE_BYTES, delete_upload, has_file, save_upload


router = APIRouter()


# CREATE TEAM
@router.post("/create-team")
def create_team(
    db: Annotated[Session, Depends(get_db)],
    admin: Annotated[models.Admin, Depends(get_current_admin_dependence)],
    full_name: str = Form(...),
    designation: str = Form(...),
    bio_description: str = Form(...),
    facebook_link: Optional[str] = Form(None),
    instagram_link: Optional[str] = Form(None),
    linkedin_link: Optional[str] = Form(None),
    image: UploadFile = File(...)
):
    file_location = save_upload(image, "team", IMAGE_EXTENSIONS, MAX_IMAGE_BYTES)

    new_team = models.Team(
        full_name=full_name,
        designation=designation,
        bio_description=bio_description,
        profile_image=file_location,
        facebook_link=facebook_link,
        instagram_link=instagram_link,
        linkedin_link=linkedin_link
    )

    db.add(new_team)
    db.commit()
    db.refresh(new_team)

    return new_team


# GET ALL TEAM MEMBERS
@router.get(
    "/teams",
    response_model=list[TeamResponse]
)
def get_all_teams(
    db: Annotated[Session, Depends(get_db)]
):

    teams = db.query(models.Team).all()

    return teams


# GET SINGLE TEAM MEMBER
@router.get(
    "/teams/{team_id}",
    response_model=TeamResponse
)
def get_single_team(
    team_id: int,
    db: Annotated[Session, Depends(get_db)]
):

    team = db.query(models.Team).filter(
        models.Team.id == team_id
    ).first()

    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team member not found"
        )

    return team


# UPDATE TEAM MEMBER

@router.patch("/update-team/{team_id}")
def update_team(
    team_id: int,
    db: Annotated[Session, Depends(get_db)],
    admin: models.Admin = Depends(get_current_admin_dependence),
    full_name: str = Form(...),
    designation: str = Form(...),
    bio_description: str = Form(...),
    facebook_link: Optional[str] = Form(None),
    instagram_link: Optional[str] = Form(None),
    linkedin_link: Optional[str] = Form(None),
    profile_image: Optional[UploadFile] = File(None)
):
    team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team member not found")

    # Fields update karein
    team.full_name = full_name
    team.designation = designation
    team.bio_description = bio_description
    team.facebook_link = facebook_link
    team.instagram_link = instagram_link
    team.linkedin_link = linkedin_link

    # Replace the image only when a new one is uploaded
    if has_file(profile_image):
        new_image = save_upload(profile_image, "team", IMAGE_EXTENSIONS, MAX_IMAGE_BYTES)
        delete_upload(team.profile_image)
        team.profile_image = new_image

    db.commit()
    db.refresh(team)
    return team


# DELETE TEAM MEMBER
@router.delete("/delete-team/{team_id}")
def delete_team(
    team_id: int,
    db: Annotated[Session, Depends(get_db)],
    admin: models.Admin = Depends(get_current_admin_dependence)
):

    team = db.query(models.Team).filter(
        models.Team.id == team_id
    ).first()

    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team member not found"
        )

    image_path = team.profile_image
    db.delete(team)
    db.commit()
    delete_upload(image_path)

    return {
        "message": "Team member deleted successfully"
    }