from sqlalchemy.orm import DeclarativeBase , sessionmaker

from sqlalchemy import create_engine
from app.config import settings

SQLALCHEMY_DB_URL = settings.database_url

engine_args = {}
if SQLALCHEMY_DB_URL.startswith("sqlite"):
    engine_args["connect_args"] = {"check_same_thread": False}

engine = create_engine(SQLALCHEMY_DB_URL, **engine_args)

sessionlocal=sessionmaker(
    autoflush=False,
    autocommit=False,
    bind=engine
)


class Base(DeclarativeBase):
    pass

def get_db():
    with sessionlocal() as db:
        yield db


        
