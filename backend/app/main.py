from fastapi import FastAPI
from app.database import engine , Base
from app.routes.admin import router as admin_router
from app.routes.service import router as service_router
from app.routes.team import router as team_router
from app.routes.portfolio import router as portfolio_router
from app.routes.contact import router as contact_router
from app.routes.contactUs import router as contactUs_router
from app.routes.news_feed import router as newsfeed_router
from app.routes.newsletter import router as newsletter_router
from app.routes.blog import router as blog_router
from fastapi.middleware.cors import CORSMiddleware
from app.scheduler import start_scheduler

from fastapi.staticfiles import StaticFiles


Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.on_event("startup")
def startup():
    start_scheduler()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Backend Running Successfully"}

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(admin_router,prefix="/api/admins",tags=["Admins"])
app.include_router(service_router,prefix="/api/services",tags=["Services"])
app.include_router(team_router,prefix="/api/team",tags=["Team"])
app.include_router(portfolio_router,prefix="/api/portfolio",tags=["Portfolio"])
app.include_router(contact_router, prefix="/api/contact", tags=["Contact"])
app.include_router(contactUs_router, prefix="/api/contact-us", tags=["ContactUs"])
app.include_router(newsletter_router, prefix="/api/newsletter", tags=["Newsletter"])
app.include_router(blog_router, prefix="/api/blog", tags=["Blog"])
app.include_router(newsfeed_router,prefix='/api/newsfeed',tags=['Newsfeed'])