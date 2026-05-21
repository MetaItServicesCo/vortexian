from fastapi import FastAPI
from app.database import engine, Base
from app.routes import admin
from fastapi.middleware.cors import CORSMiddleware  # ✅ import karo

Base.metadata.create_all(bind=engine)

app = FastAPI()

# ✅ CORS Middleware add karo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js ka URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin.router, prefix="/api/admins", tags=["admins"])