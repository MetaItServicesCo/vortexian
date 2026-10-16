from sqlalchemy.orm import DeclarativeBase , sessionmaker

from sqlalchemy import create_engine
from app.config import settings

SQLALCHEMY_DB_URL = settings.database_url

engine_args = {}
if SQLALCHEMY_DB_URL.startswith("sqlite"):
    engine_args["connect_args"] = {"check_same_thread": False}
else:
    # The database server is shared with other apps and releases run side by side
    # during a deploy, so each worker keeps a small pool (default 3 + 2 extra under
    # load, instead of SQLAlchemy's 5 + 10) and replaces dead or old connections.
    engine_args.update(
        pool_size=settings.db_pool_size,
        max_overflow=settings.db_max_overflow,
        pool_timeout=20,
        pool_recycle=1800,
        pool_pre_ping=True,
    )

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


        
