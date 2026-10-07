from fastapi import APIRouter,status,Depends,HTTPException
from app.database import get_db
from app import models
from datetime import timedelta
from app.config import settings
from app.auth import verify_password,hash_password,create_access_token,verify_access_token
from app.schema import CreateAdmin,Token,BaseAdmin
from typing import Annotated
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from app.auth import admin_oauth2_scheme
from app.config import ADMIN_SECRET_KEY
from sqlalchemy.orm import Session
import secrets


router=APIRouter()

@router.post("/register-admin",
             response_model=BaseAdmin,
             status_code=status.HTTP_201_CREATED)
def create_admin(data:CreateAdmin,
                 db:Annotated[Session,Depends(get_db)]):
    
    if not ADMIN_SECRET_KEY or not secrets.compare_digest(data.admin_secret_key, ADMIN_SECRET_KEY):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid admin secret key"
        )

    result=db.execute(select(models.Admin).where(
        (models.Admin.username==data.username) | (models.Admin.email==data.email)
    ))

    existing_admin=result.scalars().first()

    if existing_admin:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Admin already exist")
    new_admin=models.Admin(
        username=data.username,
        email=data.email,
        hash_password=hash_password(data.password)
    )
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    return new_admin

@router.post("/token",response_model=Token)
def login_for_access_token(from_data:Annotated[OAuth2PasswordRequestForm,Depends()],db:Annotated[Session,Depends(get_db)]):

    result=db.execute(select(models.Admin).where(models.Admin.email==from_data.username))

    admin=result.scalars().first()

    if not admin or not verify_password(from_data.password,admin.hash_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password or Email")
    
    access_token_expire=timedelta(minutes=settings.access_token_time_expire)

    access_token=create_access_token(
        data={'sub':str(admin.id),
              "role":'admin'},
        expire_delta=access_token_expire,
    )

    return Token(access_token=access_token,
                 token_type='bearer')

def get_current_admin_dependence(
        token:str=Depends(admin_oauth2_scheme),
        db:Session=Depends(get_db)
):
    payload=verify_access_token(token)

    if not payload or payload.get('role') != 'admin':
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    admin_id=int(payload.get('sub'))
    admin=db.query(models.Admin).filter(models.Admin.id==admin_id).first()

    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )
    return admin

@router.get("/login",response_model=BaseAdmin)
def get_current_admin(
    admin:models.Admin=Depends(get_current_admin_dependence)
):
    return admin