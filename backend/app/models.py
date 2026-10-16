
from datetime import datetime, timezone

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
    category_stack:Mapped[str]=mapped_column(String(100),nullable=False)  # category name, kept in sync with category_id
    category_id:Mapped[int | None]=mapped_column(Integer,nullable=True,index=True)
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
    # Own schema markup (JSON-LD) for this item's page; replaces the automatic one
    schema_json:Mapped[str | None]=mapped_column(Text,nullable=True)
    # Pricing section for this service's page (JSON, see app/pricing.py)
    pricing:Mapped[str | None]=mapped_column(Text,nullable=True)
    # Page sections, in order (JSON, see app/service_layout.py); NULL = default layout
    layout:Mapped[str | None]=mapped_column(Text,nullable=True)
    # Listed in the website's Services dropdown (the page stays live either way)
    show_in_menu:Mapped[bool]=mapped_column(Boolean,nullable=False,default=True,server_default="true")

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
    # Public URL: /portfolio/<slug> (old /portfolio/<id> links redirect)
    slug = mapped_column(String(220), nullable=True, unique=True, index=True)
    category_node = mapped_column(String(100), nullable=False)
    category_id = mapped_column(Integer, nullable=True, index=True)   # Dashboard → Categories (kind "portfolio")
    deployment_year = mapped_column(String(10), nullable=False)
    primary_image = mapped_column(Text, nullable=False)
    primary_image_alt = mapped_column(String(255), nullable=True)
    business_challenge = mapped_column(Text, nullable=False)
    solution_node = mapped_column(Text, nullable=False)
    meta_title = mapped_column(String(200), nullable=True)
    meta_description = mapped_column(Text, nullable=True)
    meta_keywords = mapped_column(Text, nullable=True)
    # Own schema markup (JSON-LD) for this item's page; replaces the automatic one
    schema_json = mapped_column(Text, nullable=True)


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

    # When it was received (NULL for requests from before this was recorded)
    created_at = mapped_column(DateTime(timezone=True), nullable=True, default=lambda: datetime.now(timezone.utc))

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

    # When it was received (NULL for enquiries from before this was recorded)
    created_at = mapped_column(DateTime(timezone=True), nullable=True, default=lambda: datetime.now(timezone.utc))

#//////////////News letter//////////

def _unsubscribe_token() -> str:
    import secrets
    return secrets.token_urlsafe(24)


class Newsletter(Base):
    __tablename__ = "Newsletter"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False
    )
    # Secret in every email's unsubscribe link
    unsubscribe_token: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False, default=_unsubscribe_token)
    # NULL for subscribers from before this was recorded
    created_at = mapped_column(DateTime(timezone=True), nullable=True, default=lambda: datetime.now(timezone.utc))


class NewsletterIssue(Base):
    """A newsletter written in the dashboard and sent to all subscribers once.

    Not "NewsletterCampaign": that table name is already used in production by
    an older, unrelated schema (migration 2900e418b3e1), which is left untouched.
    """
    __tablename__ = "NewsletterIssue"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    subject: Mapped[str] = mapped_column(String(200), nullable=False)
    preheader: Mapped[str | None] = mapped_column(String(200), nullable=True)
    # Optional banner under the logo; the subject can be shown as the headline
    cover_image: Mapped[str | None] = mapped_column(Text, nullable=True)
    cover_image_alt: Mapped[str | None] = mapped_column(String(255), nullable=True)
    show_headline: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")
    body_html: Mapped[str] = mapped_column(Text, nullable=False, default="")
    # draft -> sending -> sent | partial | failed
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="draft")
    recipients_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    sent_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    failed_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    last_error: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = mapped_column(DateTime(timezone=True), nullable=True, onupdate=lambda: datetime.now(timezone.utc))
    sent_at = mapped_column(DateTime(timezone=True), nullable=True)

# /////////blog//////////

class Blog(Base):
    __tablename__ = "Blog"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    # Public URL: /blog/<slug>. Index name matches the existing migration.
    slug: Mapped[str | None] = mapped_column(String(220), nullable=True, unique=True, index=True)
    excerpt: Mapped[str] = mapped_column(Text, nullable=False)

    content: Mapped[str] = mapped_column(Text, nullable=False)  # HTML or Markdown

    category: Mapped[str] = mapped_column(String(100), nullable=False)  # category name, kept in sync with category_id
    category_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    author: Mapped[str] = mapped_column(String(100), nullable=False)

    featured_image: Mapped[str] = mapped_column(Text, nullable=True)
    featured_image_alt: Mapped[str | None] = mapped_column(String(255), nullable=True)

    meta_title: Mapped[str] = mapped_column(String(60), nullable=False)
    meta_description: Mapped[str] = mapped_column(String(160), nullable=False)
    # Own schema markup (JSON-LD) for this item's page; replaces the automatic one
    schema_json: Mapped[str | None] = mapped_column(Text, nullable=True)


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
    # Own schema markup (JSON-LD) for this item's page; replaces the automatic one
    schema_json: Mapped[str | None] = mapped_column(Text, nullable=True)

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


# ///////// Categories for services and blog posts //////////

class Category(Base):
    """Admin-managed categories. kind: "service" or "blog".

    Items keep the category *name* in their own text column (category_stack /
    category) so existing pages keep working; category_id links the record.
    No foreign key: items restored from Recently deleted may point to a
    category that is gone, and fall back to "Others".
    """
    __tablename__ = "Category"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    kind: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    # Services: list this category (with its services) in the header Services dropdown
    show_in_menu: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")
    # The built-in "Others" category: can't be deleted or renamed
    is_system: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    created_at = mapped_column(DateTime(timezone=True), nullable=True, default=lambda: datetime.now(timezone.utc))


# ///////// AI assistant (chat widget) //////////

class AIChatSession(Base):
    """One website visitor's conversation with the AI assistant.

    messages: JSON list of {"role": "user"|"assistant", "content", "agent", "at"}.
    state: JSON with the lead details collected so far and the lead status
    ("none", "collecting", "captured", "declined"), plus "nudged" once the
    idle (lead capture) message was shown.
    """
    __tablename__ = "AIChatSession"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)  # uuid4, kept by the browser
    created_at = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    last_seen_at = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), index=True)
    first_page: Mapped[str | None] = mapped_column(String(300), nullable=True)
    messages: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    state: Mapped[str] = mapped_column(Text, nullable=False, default="{}")
    user_messages: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    ip_hash: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)


class AIChatLead(Base):
    """A lead captured by the AI assistant (Dashboard → Chat Leads).

    Saved as soon as the visitor gives an email or phone number and updated as
    the conversation continues; transcript is a copy of the conversation.
    """
    __tablename__ = "AIChatLead"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    name: Mapped[str | None] = mapped_column(String(150), nullable=True)
    email: Mapped[str | None] = mapped_column(String(254), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    company: Mapped[str | None] = mapped_column(String(200), nullable=True)
    need: Mapped[str | None] = mapped_column(Text, nullable=True)
    page: Mapped[str | None] = mapped_column(String(300), nullable=True)
    transcript: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    created_at = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = mapped_column(DateTime(timezone=True), nullable=True, default=lambda: datetime.now(timezone.utc))


class AIKnowledgeState(Base):
    """Single row (id=1) describing the knowledge base. The vectors themselves
    live in the pgvector table ai_kb_chunks (see app/ai/knowledge.py)."""
    __tablename__ = "AIKnowledgeState"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="empty")  # empty|indexing|ready|error|unavailable
    message: Mapped[str | None] = mapped_column(Text, nullable=True)
    pages: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    chunks: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    embedding_model: Mapped[str | None] = mapped_column(String(200), nullable=True)
    changed_at = mapped_column(DateTime(timezone=True), nullable=True)   # website content changed
    indexed_at = mapped_column(DateTime(timezone=True), nullable=True)   # last successful refresh
    started_at = mapped_column(DateTime(timezone=True), nullable=True)   # current/last refresh started


# ///////// Media Library (Dashboard → Media Library) //////////

class MediaItem(Base):
    """An uploaded image with a permanent public link (/uploads/media/<readable-name>.<ext>).

    The file name never changes after upload, because the link may be shared
    on other websites; "Replace image" swaps the file behind the same link.
    """
    __tablename__ = "MediaItem"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    path: Mapped[str] = mapped_column(String(300), nullable=False, unique=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    alt: Mapped[str | None] = mapped_column(String(255), nullable=True)
    file_size: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    uploaded_by: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = mapped_column(DateTime(timezone=True), nullable=True)


# ///////// Gallery (Dashboard → Gallery; public /gallery) //////////

class GalleryAlbum(Base):
    """An event album, e.g. "Annual Company Event 2026" (public /gallery/<slug>)."""
    __tablename__ = "GalleryAlbum"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    slug: Mapped[str] = mapped_column(String(180), nullable=False, unique=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    event_date: Mapped[str | None] = mapped_column(String(10), nullable=True)      # YYYY-MM-DD
    cover_image_id: Mapped[int | None] = mapped_column(Integer, nullable=True)    # a GalleryImage; first photo if empty
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_published: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = mapped_column(DateTime(timezone=True), nullable=True)


class GalleryImage(Base):
    """A gallery photo, stored as WebP in four sizes (see app/gallery_images.py)."""
    __tablename__ = "GalleryImage"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    album_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    category_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)   # Category kind "gallery"
    category_name: Mapped[str] = mapped_column(String(100), nullable=False, default="Others")
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    caption: Mapped[str | None] = mapped_column(Text, nullable=True)
    event_name: Mapped[str | None] = mapped_column(String(150), nullable=True)
    event_date: Mapped[str | None] = mapped_column(String(10), nullable=True)      # YYYY-MM-DD
    alt: Mapped[str] = mapped_column(String(255), nullable=False)
    path: Mapped[str] = mapped_column(String(300), nullable=False)
    path_large: Mapped[str] = mapped_column(String(300), nullable=False)
    path_medium: Mapped[str] = mapped_column(String(300), nullable=False)
    path_thumb: Mapped[str] = mapped_column(String(300), nullable=False)
    width: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    height: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    file_size: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0, index=True)
    is_published: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = mapped_column(DateTime(timezone=True), nullable=True)
