from sqlalchemy import Integer,String
from sqlalchemy.orm import mapped_column,Mapped
from app.database import Base

class Admin(Base):
    __tablename__="Admin"

    id:Mapped[int]=mapped_column(Integer,primary_key=True,index=True)
    username:Mapped[str]=mapped_column(String(25),unique=True,nullable=False)
    email:Mapped[str]=mapped_column(String(70),unique=True,nullable=False)
    hash_password:Mapped[str]=mapped_column(String(250),nullable=False)