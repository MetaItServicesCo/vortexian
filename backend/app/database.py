from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase , sessionmaker

from sqlalchemy import create_engine
from app.config import settings

SQLALCHEMY_DB_URL = settings.database_url

engine = create_engine(SQLALCHEMY_DB_URL)

# SQLALCHEMY_DB_URL="sqlite:///./vortex.db"

# engine=create_engine(
#     SQLALCHEMY_DB_URL,
#     connect_args={"check_same_thread":False}
# )

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


        
