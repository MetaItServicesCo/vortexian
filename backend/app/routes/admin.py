from fastapi import APIRouter,status,Depends,HTTPException
from app.database import get_db
from app import models
from datetime import timedelta
from app.config import settings
from app.auth import verify_password,hash_password,create_access_token,verify_access_token
from app.schema import CreateAdmin,Token
from typing import Annotated
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from app.config import ADMIN_SECRET_KEY
from sqlalchemy.orm import Session


router=APIRouter()

@router.post("/register-admin",
             status_code=status.HTTP_201_CREATED)
def create_admin(data:CreateAdmin,
                 db:Annotated[Session,Depends(get_db)]):
    
    if data.admin_secret_key != ADMIN_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid admin secret key"
        )

    result=db.execute(select(models.Admin).where(models.Admin.username==data.username))
     
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
        expire_delta=access_token_expire
    )

    return Token(access_token=access_token,
                 token_type='bearer')