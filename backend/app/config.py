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

    # Email is sent through Resend (https://resend.com). Without a key the
    # newsletter dashboard explains that sending isn't set up.
    resend_api_key: SecretStr | None = None
    resend_api_url: str = "https://api.resend.com"
    # Public website address, used for links and images inside emails
    site_url: str = "https://vortexiantech.com"

    # Old SMTP settings (no longer used; kept optional so existing env files still load)
    mail_username: str | None = None
    mail_password: str | None = None
    mail_from: str | None = None
    mail_server: str | None = None
    mail_port: int | None = None

settings=Settings()

