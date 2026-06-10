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


router = APIRouter()


# CREATE TEAM

from typing import Annotated

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
    file_location = f"uploads/{image.filename}"

    with open(file_location, "wb+") as file_object:
        file_object.write(image.file.read())

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
@router.patch(
    "/update-team/{team_id}",
    response_model=TeamResponse
)
def update_team(
    team_id: int,
    data: UpdateTeam,
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

    update_data = data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(team, key, value)

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

    db.delete(team)

    db.commit()

    return {
        "message": "Team member deleted successfully"
    }