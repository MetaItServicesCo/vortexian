import os
import uuid

from fastapi import HTTPException, UploadFile, status

UPLOAD_ROOT = "uploads"

IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp", "avif"}
VIDEO_EXTENSIONS = {"mp4", "webm", "mov"}
DOCUMENT_EXTENSIONS = {"pdf", "doc", "docx"}
# Files a client may attach to a quote request
ATTACHMENT_EXTENSIONS = DOCUMENT_EXTENSIONS | IMAGE_EXTENSIONS | {
    "txt", "rtf", "xls", "xlsx", "ppt", "pptx", "zip"
}

MAX_IMAGE_BYTES = 10 * 1024 * 1024
MAX_DOCUMENT_BYTES = 20 * 1024 * 1024
MAX_VIDEO_BYTES = 50 * 1024 * 1024

_CHUNK_SIZE = 1024 * 1024


def has_file(file: UploadFile | None) -> bool:
    return bool(file and file.filename)


def save_upload(
    file: UploadFile,
    subdir: str,
    allowed_extensions: set[str],
    max_bytes: int,
) -> str:
    """Validate and store an upload under uploads/<subdir>/ with a random name.

    Returns the public path, e.g. "/uploads/blogs/<uuid>.png".
    """
    ext = os.path.splitext(file.filename or "")[1].lstrip(".").lower()
    if ext not in allowed_extensions:
        allowed = ", ".join(sorted(allowed_extensions)).upper()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type. Allowed: {allowed}",
        )

    directory = os.path.join(UPLOAD_ROOT, subdir)
    os.makedirs(directory, exist_ok=True)

    file_name = f"{uuid.uuid4()}.{ext}"
    file_location = os.path.join(directory, file_name)

    written = 0
    try:
        with open(file_location, "wb") as buffer:
            while chunk := file.file.read(_CHUNK_SIZE):
                written += len(chunk)
                if written > max_bytes:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File too large. Max size is {max_bytes // (1024 * 1024)}MB",
                    )
                buffer.write(chunk)
    except BaseException:
        if os.path.exists(file_location):
            os.remove(file_location)
        raise

    return f"/{UPLOAD_ROOT}/{subdir}/{file_name}"


def delete_upload(public_path: str | None) -> None:
    """Remove a previously stored upload. Ignores external URLs and missing files."""
    if not public_path:
        return

    relative = public_path.lstrip("/")
    root = os.path.realpath(UPLOAD_ROOT)
    target = os.path.realpath(relative)

    # Only ever delete files inside the uploads directory
    if not target.startswith(root + os.sep):
        return

    if os.path.isfile(target):
        os.remove(target)


IMAGE_ALT_MAX = 255


def clean_alt(alt: str | None) -> str | None:
    alt = " ".join((alt or "").split())
    return alt[:IMAGE_ALT_MAX] or None


def require_alt(has_image: bool, alt: str | None) -> str | None:
    """Alt text is mandatory whenever an image is present (accessibility + SEO)."""
    alt = clean_alt(alt)
    if has_image and not alt:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Alt text is required for the image (describe what the image shows).",
        )
    return alt


def is_image(path_or_name: str | None) -> bool:
    ext = os.path.splitext(path_or_name or "")[1].lstrip(".").lower()
    return ext in IMAGE_EXTENSIONS
