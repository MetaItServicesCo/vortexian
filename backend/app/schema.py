from pydantic import BaseModel,Field,EmailStr
from typing import Optional
from datetime import datetime

class BaseAdmin(BaseModel):
    username:str=Field(min_length=1,max_length=15)
    
class CreateAdmin(BaseAdmin):
    email:EmailStr
    password:str=Field(min_length=8,max_length=128)
    admin_secret_key:str

class Token(BaseModel):
    access_token:str
    token_type:str


class BaseService(BaseModel):

    service_title:str
    url_slug:str
    category_stack:str
    lucide_icon:str
    image_source_type:str
    image_showcase_url:str
    image_alt:Optional[str]=None
    short_description:str
    long_description:str
    feature_1:Optional[str]=None
    feature_2:Optional[str]=None
    feature_3:Optional[str]=None
    feature_4:Optional[str]=None
    why_choose_1:Optional[str]=None
    why_choose_2:Optional[str]=None
    why_choose_3:Optional[str]=None
    meta_title:str
    keywords:str
    meta_description:str


class CreateService(BaseService):
    pass


class ServiceResponse(BaseService):
    id:int

    class Config:
        from_attributes=True

class UpdateService(BaseModel):

    service_title: Optional[str] = None
    url_slug: Optional[str] = None
    category_stack: Optional[str] = None
    lucide_icon: Optional[str] = None

    image_source_type: Optional[str] = None
    image_showcase_url: Optional[str] = None
    image_alt: Optional[str] = None

    short_description: Optional[str] = None
    long_description: Optional[str] = None

    feature_1: Optional[str] = None
    feature_2: Optional[str] = None
    feature_3: Optional[str] = None
    feature_4: Optional[str] = None

    why_choose_1: Optional[str] = None
    why_choose_2: Optional[str] = None
    why_choose_3: Optional[str] = None

    meta_title: Optional[str] = None
    keywords: Optional[str] = None

    meta_description: Optional[str] = None



class BaseTeam(BaseModel):

    full_name: str
    designation: str
    bio_description: str
    profile_image: str
    profile_image_alt: Optional[str] = None
    facebook_link: Optional[str] = None
    instagram_link: Optional[str] = None
    linkedin_link: Optional[str] = None


class CreateTeam(BaseModel):
    full_name: str
    designation: str
    bio_description: str
    profile_image: Optional[str] = None # Make optional
    # ... rest of the fields


class TeamResponse(BaseTeam):
    id: int

    class Config:
        from_attributes=True


class UpdateTeam(BaseModel):

    full_name: Optional[str] = None
    designation: Optional[str] = None
    bio_description: Optional[str] = None
    profile_image: Optional[str] = None
    profile_image_alt: Optional[str] = None
    facebook_link: Optional[str] = None
    instagram_link: Optional[str] = None
    linkedin_link: Optional[str] = None

# ////portfolio/////

class BasePortfolio(BaseModel):
    project_title: str
    category_node: str
    deployment_year: str
    business_challenge: str
    solution_node: str
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[str] = None


class CreatePortfolio(BasePortfolio):
    pass

class PortfolioResponse(BasePortfolio):
    id: int
    primary_image: str
    primary_image_alt: Optional[str] = None

    class Config:
        from_attributes = True

class UpdatePortfolio(BaseModel):
    project_title: Optional[str] = None
    category_node: Optional[str] = None
    deployment_year: Optional[str] = None
    business_challenge: Optional[str] = None
    solution_node: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[str] = None

# //////////contact us /////////////

class CreateContact(BaseModel):
    first_name: str
    last_name: str
    phone: str
    email: EmailStr
    preferred_contact_method: str
    service: str
    website_url: Optional[str] = None
    completion_date: Optional[str] = None
    message: str


class ContactResponse(CreateContact):
    id: int
    project_file: Optional[str] = None

    class Config:
        from_attributes = True


# //////contact us staatic form //////////

class CreateContactUs(BaseModel):
    full_name: str
    company_name: str
    website_url: Optional[str] = None
    email: EmailStr
    phone_number: str
    designation: Optional[str] = None
    subject: str
    message: str


class ContactUsResponse(CreateContactUs):
    id: int

    class Config:
        from_attributes = True


#///////////////news letter ///////////

class CreateNewsletter(BaseModel):
    email: EmailStr


class NewsletterResponse(BaseModel):
    id: int
    email: EmailStr

    class Config:
        from_attributes = True 


# /////////blog/////////
class BlogBase(BaseModel):
    title: str
    slug: Optional[str] = None
    excerpt: str
    content: str
    category: str
    author: str

    meta_title: str
    meta_description: str


class CreateBlog(BlogBase):
    pass


class UpdateBlog(BaseModel):
    slug: Optional[str] = None
    featured_image_alt: Optional[str] = None
    title: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    author: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None


class BlogResponse(BlogBase):
    id: int
    featured_image: Optional[str] = None
    featured_image_alt: Optional[str] = None

    class Config:
        from_attributes = True


# //////////news feed //////////////////
class CreateNewsFeed(BaseModel):
    title: str
    feed_type: str
    description: str
    author: str
    event_date: Optional[str] = None


class NewsFeedResponse(CreateNewsFeed):
    id: int
    media_url: Optional[str] = None
    media_alt: Optional[str] = None
    is_published: bool

    class Config:
        from_attributes = True


# //////////career form //////////////////

class CareerApplicationResponse(BaseModel):
    id: int
    company_name: Optional[str] = None
    first_name: str
    last_name: str
    email: Optional[str] = None
    linkedin_url: str
    cv_url: str
    image_url: Optional[str] = None
    show_contact_public: bool
    created_at: datetime

    class Config:
        from_attributes = True

# //////////testimonials //////////////////

class TestimonialResponse(BaseModel):
    id: int
    client_name: str
    client_designation: Optional[str] = None
    company: Optional[str] = None
    testimonial_text: str
    rating: int
    profile_image: Optional[str] = None
    profile_image_alt: Optional[str] = None

    class Config:
        from_attributes = True


# //////////CMS pages //////////////////

SLUG_PATTERN = r"^[a-z0-9]+(?:-[a-z0-9]+)*$"


class PageBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    slug: str = Field(min_length=1, max_length=150, pattern=SLUG_PATTERN)
    content: str = ""
    meta_title: Optional[str] = Field(default=None, max_length=200)
    meta_description: Optional[str] = None
    is_published: bool = True
    show_in_footer: bool = True
    footer_order: int = 0


class CreatePage(PageBase):
    pass


class UpdatePage(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    slug: Optional[str] = Field(default=None, min_length=1, max_length=150, pattern=SLUG_PATTERN)
    content: Optional[str] = None
    meta_title: Optional[str] = Field(default=None, max_length=200)
    meta_description: Optional[str] = None
    is_published: Optional[bool] = None
    show_in_footer: Optional[bool] = None
    footer_order: Optional[int] = None


class PageResponse(PageBase):
    id: int
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PageLink(BaseModel):
    title: str
    slug: str
    footer_order: int

    class Config:
        from_attributes = True
