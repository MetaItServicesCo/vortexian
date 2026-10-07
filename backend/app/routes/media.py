from fastapi import APIRouter, Depends, File, UploadFile

from app.routes.admin import get_current_admin_dependence
from app.uploads import IMAGE_EXTENSIONS, MAX_VIDEO_BYTES, VIDEO_EXTENSIONS, save_upload

router = APIRouter()

# SVG is deliberately excluded: it can carry script and is served same-origin
MEDIA_EXTENSIONS = IMAGE_EXTENSIONS | VIDEO_EXTENSIONS


# ---------------- UPLOAD (ADMIN) ----------------
# Used by the rich text editor and image/video fields in Site Content.
@router.post("/upload", status_code=201)
def upload_media(
    file: UploadFile = File(...),
    admin=Depends(get_current_admin_dependence),
):
    url = save_upload(file, "media", MEDIA_EXTENSIONS, MAX_VIDEO_BYTES)
    return {"url": url}
