from fastapi import FastAPI
from app.database import engine , Base
from app.routes.admin import router as admin_router
from app.routes.service import router as service_router
from fastapi.middleware.cors import CORSMiddleware

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

app.include_router(admin_router,prefix="/api/admins",tags=["admins"])
app.include_router(service_router,prefix="/api/admins",tags=["admins"])

