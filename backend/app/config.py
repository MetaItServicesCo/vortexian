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

    secret_key:SecretStr
    algorithm:str="HS256"
    access_token_time_expire:int=1

settings=Settings()

