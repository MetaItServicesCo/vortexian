from fastapi import FastAPI
from app.database import engine , Base
from app.routes.admin import router as admin_router
from app.routes.service import router as service_router

Base.metadata.create_all(bind=engine)


app=FastAPI()

app.include_router(admin_router,prefix="/api/admins",tags=["admins"])
app.include_router(service_router,prefix="/api",tags=["services"])

