
from sqlalchemy import JSON, Column, Integer, String, Boolean, DateTime, Text, func
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
    image_alt:Mapped[str | None]=mapped_column(String(255),nullable=True)
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

    meta_description:Mapped[str]=mapped_column(Text,nullable=False)



class Team(Base):
    __tablename__ = "Team"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    designation: Mapped[str] = mapped_column(String(150), nullable=False)
    bio_description: Mapped[str] = mapped_column(Text, nullable=False)
    profile_image: Mapped[str] = mapped_column(Text, nullable=False)
    profile_image_alt: Mapped[str | None] = mapped_column(String(255), nullable=True)
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
    primary_image_alt = mapped_column(String(255), nullable=True)
    business_challenge = mapped_column(Text, nullable=False)
    solution_node = mapped_column(Text, nullable=False)
    meta_title = mapped_column(String(200), nullable=True)
    meta_description = mapped_column(Text, nullable=True)
    meta_keywords = mapped_column(Text, nullable=True)


# //////////////contact //////////////
class Contact(Base):
    __tablename__ = "Contact"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)

    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    email: Mapped[str] = mapped_column(String(100), nullable=False)

    preferred_contact_method: Mapped[str] = mapped_column(String(20), nullable=False)

    service: Mapped[str] = mapped_column(String(100), nullable=False)

    website_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    project_file: Mapped[str | None] = mapped_column(Text, nullable=True)

    completion_date: Mapped[str] = mapped_column(String(50), nullable=True)

    message: Mapped[str] = mapped_column(Text, nullable=False)

# ///////////contact us static form ////////////


class ContactUs(Base):
    __tablename__ = "ContactUs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    company_name: Mapped[str] = mapped_column(String(150), nullable=False)

    website_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    email: Mapped[str] = mapped_column(String(100), nullable=False)
    phone_number: Mapped[str] = mapped_column(String(30), nullable=False)

    designation: Mapped[str | None] = mapped_column(String(100), nullable=True)

    subject: Mapped[str] = mapped_column(String(200), nullable=False)

    message: Mapped[str] = mapped_column(Text, nullable=False)

#//////////////News letter//////////

class Newsletter(Base):
    __tablename__ = "Newsletter"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False
    ) 

# /////////blog//////////

class Blog(Base):
    __tablename__ = "Blog"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    # Public URL: /blog/<slug>. Index name matches the existing migration.
    slug: Mapped[str | None] = mapped_column(String(220), nullable=True, unique=True, index=True)
    excerpt: Mapped[str] = mapped_column(Text, nullable=False)

    content: Mapped[str] = mapped_column(Text, nullable=False)  # HTML or Markdown

    category: Mapped[str] = mapped_column(String(100), nullable=False)
    author: Mapped[str] = mapped_column(String(100), nullable=False)

    featured_image: Mapped[str] = mapped_column(Text, nullable=True)
    featured_image_alt: Mapped[str | None] = mapped_column(String(255), nullable=True)

    meta_title: Mapped[str] = mapped_column(String(60), nullable=False)
    meta_description: Mapped[str] = mapped_column(String(160), nullable=False)


# /////////News feeds ///////////

class NewsFeed(Base):
    __tablename__ = "NewsFeed"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    title: Mapped[str] = mapped_column(String(200), nullable=False)

    feed_type: Mapped[str] = mapped_column(String(50), nullable=False)  # announcement, event, etc.

    description: Mapped[str] = mapped_column(Text, nullable=False)

    author: Mapped[str] = mapped_column(String(100), nullable=False)

    event_date: Mapped[str | None] = mapped_column(String(100), nullable=True)

    media_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    media_alt: Mapped[str | None] = mapped_column(String(255), nullable=True)

    is_published: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())
    

# ///////// career form //////////

class CareerApplication(Base):
    __tablename__ = "career_applications"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, nullable=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=False)
    cv_url = Column(String, nullable=False)
    image_url = Column(String, nullable=True)
    show_contact_public = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ///////// testimonials //////////

class Testimonial(Base):
    __tablename__ = "Testimonial"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    client_name: Mapped[str] = mapped_column(String(100), nullable=False)
    client_designation: Mapped[str | None] = mapped_column(String(150), nullable=True)
    company: Mapped[str | None] = mapped_column(String(150), nullable=True)

    testimonial_text: Mapped[str] = mapped_column(Text, nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False, default=5)

    profile_image: Mapped[str | None] = mapped_column(Text, nullable=True)
    profile_image_alt: Mapped[str | None] = mapped_column(String(255), nullable=True)

    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())


# ///////// CMS: editable site content //////////

class SiteContent(Base):
    """One JSON document per key: "settings" for global site info, plus one
    per editable page section (e.g. "home.about")."""
    __tablename__ = "SiteContent"

    key: Mapped[str] = mapped_column(String(100), primary_key=True)
    data: Mapped[str] = mapped_column(Text, nullable=False, default="{}")
    updated_at = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


# ///////// CMS: custom pages (legal pages etc.) //////////

class Page(Base):
    __tablename__ = "Page"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(150), unique=True, nullable=False, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False, default="")

    meta_title: Mapped[str | None] = mapped_column(String(200), nullable=True)
    meta_description: Mapped[str | None] = mapped_column(Text, nullable=True)

    is_published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    show_in_footer: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    footer_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


# ///////// Recently deleted (restorable for 7 days) //////////

class DeletedItem(Base):
    """Snapshot of a deleted record; restoring re-creates it with the same id."""
    __tablename__ = "DeletedItem"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    resource: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    record_id: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    data = mapped_column(JSON, nullable=False)
    # [{"field": ..., "original": "/uploads/...", "trash": "/uploads/_trash/..."}]
    files = mapped_column(JSON, nullable=False, default=list)
    deleted_by: Mapped[str | None] = mapped_column(String(100), nullable=True)
    deleted_at = mapped_column(DateTime(timezone=True), nullable=False, index=True)
