from fastapi import APIRouter,status,Depends,HTTPException
from sqlalchemy.orm import Session
from typing import Annotated

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
@router.post(
    "/create-team",
    response_model=TeamResponse,
    status_code=status.HTTP_201_CREATED
)
def create_team(
    data: CreateTeam,
    db: Annotated[Session, Depends(get_db)],
    admin: models.Admin = Depends(get_current_admin_dependence)
):

    new_team = models.Team(
        full_name=data.full_name,
        designation=data.designation,
        bio_description=data.bio_description,
        profile_image=data.profile_image,
        facebook_link=data.facebook_link,
        instagram_link=data.instagram_link,
        linkedin_link=data.linkedin_link
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