from pydantic import SecretStr
from pydantic_settings import BaseSettings,SettingsConfigDict
from dotenv import load_dotenv
import os 

load_dotenv()

ADMIN_SECRET_KEY=os.getenv("ADMIN_SECRET_KEY")

class Settings(BaseSettings):
    model_config=SettingsConfigDict(
        env_file='.env',
        env_file_encoding='utf8',
        extra="ignore"
    )
    database_url: str

    #jwt
    secret_key:SecretStr
    algorithm:str="HS256"
    access_token_time_expire:int=1440

    # Email
    mail_username: str
    mail_password: str
    mail_from: str
    mail_server: str
    mail_port: int

settings=Settings()

