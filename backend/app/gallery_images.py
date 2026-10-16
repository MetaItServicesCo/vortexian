"""Image optimisation for the Gallery.

Each upload is decoded, turned upright (phone photos store rotation in EXIF),
stripped of metadata (EXIF can contain the GPS location where a photo was taken)
and saved as WebP in four widths, never larger than the original and always
with the original proportions (nothing is cropped):

    path         longest side up to 2400 px   lightbox / "open full size"
    path_large   up to 1600 px wide
    path_medium  up to  960 px wide
    path_thumb   up to  480 px wide   grid on phones
"""
import io
import os

from fastapi import HTTPException, UploadFile
from PIL import Image, ImageOps, UnidentifiedImageError

from app.uploads import UPLOAD_ROOT, readable_name

SUBDIR = "gallery"
MAX_BYTES = 20 * 1024 * 1024
SIZES = (("path", 2400, 82), ("path_large", 1600, 80), ("path_medium", 960, 78), ("path_thumb", 480, 75))
ALLOWED = {"jpg", "jpeg", "png", "webp", "gif", "avif"}
Image.MAX_IMAGE_PIXELS = 80_000_000   # refuse "decompression bomb" files


def process_upload(file: UploadFile, name: str) -> dict:
    """Save an uploaded photo in all sizes; returns the paths and the full size's dimensions."""
    ext = os.path.splitext(file.filename or "")[1].lstrip(".").lower()
    if ext not in ALLOWED:
        raise HTTPException(status_code=400, detail="Please upload a photo (JPG, PNG, WEBP, GIF or AVIF).")
    data = file.file.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail=f"“{file.filename}” is larger than {MAX_BYTES // (1024 * 1024)} MB.")
    try:
        img = Image.open(io.BytesIO(data))
        img.load()
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError, ValueError):
        raise HTTPException(status_code=400, detail=f"“{file.filename}” could not be read as an image.")

    img = ImageOps.exif_transpose(img)                       # upright, as the photographer saw it
    has_alpha = img.mode in ("RGBA", "LA", "PA") or "transparency" in img.info
    img = img.convert("RGBA" if has_alpha else "RGB")        # drops EXIF/GPS and palettes

    directory = os.path.join(UPLOAD_ROOT, SUBDIR)
    os.makedirs(directory, exist_ok=True)
    base = readable_name(directory, name or os.path.splitext(file.filename or "")[0], "webp")[:-5]
    while any(os.path.exists(os.path.join(directory, f"{base}{suffix}.webp")) for suffix in ("", "-1600", "-960", "-480")):
        base = readable_name(directory, f"{base}-2", "webp")[:-5]

    out, written = {}, []
    try:
        for field, width, quality in SIZES:
            copy = img.copy()
            # fits inside, keeps proportions, never enlarges; the full size is limited on its longest side
            copy.thumbnail((width, width) if field == "path" else (width, width * 4), Image.LANCZOS)
            file_name = f"{base}.webp" if field == "path" else f"{base}-{width}.webp"
            target = os.path.join(directory, file_name)
            copy.save(target, "WEBP", quality=quality, method=4)
            written.append(target)
            out[field] = f"/{UPLOAD_ROOT}/{SUBDIR}/{file_name}"
            if field == "path":
                out["width"], out["height"] = copy.size
    except Exception:
        for target in written:
            if os.path.exists(target):
                os.remove(target)
        raise HTTPException(status_code=500, detail="The image could not be saved. Please try again.")
    out["file_size"] = sum(os.path.getsize(t) for t in written)
    return out
