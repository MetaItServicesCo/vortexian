from sqlalchemy import Integer,String,Text
from sqlalchemy.orm import mapped_column,Mapped
from app.database import Base

class Admin(Base):
    __tablename__="Admin"

    id:Mapped[int]=mapped_column(Integer,primary_key=True,index=True)
    username:Mapped[str]=mapped_column(String(25),unique=True,nullable=False)
    email:Mapped[str]=mapped_column(String(70),unique=True,nullable=False)
    hash_password:Mapped[str]=mapped_column(String(250),nullable=False)


class Service(Base):
    __tablename__="Service"

    id:Mapped[int]=mapped_column(Integer,primary_key=True,index=True)
    service_title:Mapped[str]=mapped_column(String(100),nullable=False)
    url_slug:Mapped[str]=mapped_column(String(150),unique=True,nullable=False)
    category_stack:Mapped[str]=mapped_column(String(100),nullable=False)
    lucide_icon:Mapped[str]=mapped_column(String(100),nullable=False)
    image_source_type:Mapped[str]=mapped_column(String(50),nullable=False)
    image_showcase_url:Mapped[str]=mapped_column(Text,nullable=False)
    short_description:Mapped[str]=mapped_column(Text,nullable=False)
    long_description:Mapped[str]=mapped_column(Text,nullable=False)
    feature_1:Mapped[str | None]=mapped_column(Text,nullable=True)
    feature_2:Mapped[str| None]=mapped_column(Text,nullable=True)
    feature_3:Mapped[str| None]=mapped_column(Text,nullable=True)
    feature_4:Mapped[str| None]=mapped_column(Text,nullable=True)
    why_choose_1:Mapped[str| None]=mapped_column(Text,nullable=True)
    why_choose_2:Mapped[str| None]=mapped_column(Text,nullable=True)
    why_choose_3:Mapped[str| None]=mapped_column(Text,nullable=True)
    meta_title:Mapped[str]=mapped_column(String(200),nullable=False)
    keywords:Mapped[str]=mapped_column(Text,nullable=False)
<<<<<<< HEAD
    meta_description:Mapped[str]=mapped_column(Text,nullable=False)
=======
    meta_description:Mapped[str]=mapped_column(Text,nullable=False)


class Team(Base):
    __tablename__ = "Team"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    designation: Mapped[str] = mapped_column(String(150), nullable=False)
    bio_description: Mapped[str] = mapped_column(Text, nullable=False)
    profile_image: Mapped[str] = mapped_column(Text, nullable=False)
    facebook_link: Mapped[str] = mapped_column(Text, nullable=True)
    instagram_link: Mapped[str] = mapped_column(Text, nullable=True)
    linkedin_link: Mapped[str] = mapped_column(Text, nullable=True)



class Portfolio(Base):
    __tablename__ = "Portfolio"

    id = mapped_column(Integer, primary_key=True, index=True)
    project_title = mapped_column(String(200), nullable=False)
    category_node = mapped_column(String(100), nullable=False)
    deployment_year = mapped_column(String(10), nullable=False)
    primary_image = mapped_column(Text, nullable=False)
    business_challenge = mapped_column(Text, nullable=False)
    solution_node = mapped_column(Text, nullable=False)
    meta_title = mapped_column(String(200), nullable=True)
    meta_description = mapped_column(Text, nullable=True)
    meta_keywords = mapped_column(Text, nullable=True)
>>>>>>> c6c635392c4137ba4a81ae6f3ecad13538d4b004
