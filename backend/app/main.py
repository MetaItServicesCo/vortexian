from fastapi import FastAPI
from app.database import engine , Base
from app.routes import admin

Base.metadata.create_all(bind=engine)


app=FastAPI()

app.include_router(admin.router,prefix="/api/admins",tags=["admins"])

