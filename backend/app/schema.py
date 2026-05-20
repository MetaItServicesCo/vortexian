from pydantic import BaseModel,Field,EmailStr

class BaseAdmin(BaseModel):
    username:str=Field(min_length=1,max_length=15)
    email:EmailStr

class CreateAdmin(BaseAdmin):
    password:str=Field(max_length=8)
    admin_secret_key:str

class Token(BaseModel):
    access_token:str
    token_type:str