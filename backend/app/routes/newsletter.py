import re
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone

from app.database import get_db
from app import models
from app import schema

from app.routes.admin import get_current_admin_dependence
from app.email_service import send_newsletter_email


router = APIRouter()


# =====================================================
# HELPERS
# =====================================================

# Matches {{name}} and {{ name }} — the placeholder authors type in the editor.
_NAME_PLACEHOLDER = re.compile(r"\{\{\s*name\s*\}\}", re.IGNORECASE)


def personalize(body: str, user) -> str:
    """Fill {{name}} with this subscriber's name for their copy of the email."""
    if not body:
        return ""
    return _NAME_PLACEHOLDER.sub(getattr(user, "name", None) or "there", body)


# =====================================================
# PUBLIC SUBSCRIBE
# =====================================================

@router.post("/subscribe")
def subscribe_newsletter(
    data: schema.CreateNewsletter,
    db: Session = Depends(get_db),
):
    existing = (
        db.query(models.Newsletter)
        .filter(models.Newsletter.email == data.email)
        .first()
    )

    if existing:
        raise HTTPException(status_code=400, detail="Email already subscribed")

    subscriber = models.Newsletter(
        name=data.name,
        email=data.email,
        status="ACTIVE",
    )

    db.add(subscriber)
    db.commit()
    db.refresh(subscriber)

    return {"message": "Successfully subscribed"}


# =====================================================
# GET SUBSCRIBERS
# =====================================================

@router.get("/subscribers", response_model=list[schema.NewsletterResponse])
def get_subscribers(
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence),
):
    return (
        db.query(models.Newsletter)
        .order_by(models.Newsletter.id.desc())
        .all()
    )


@router.get("/subscribers/search")
def search_subscribers(
    query: str,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence),
):
    return (
        db.query(models.Newsletter)
        .filter(
            (models.Newsletter.email.contains(query))
            | (models.Newsletter.name.contains(query))
        )
        .all()
    )


# =====================================================
# DELETE SUBSCRIBER
# =====================================================

@router.delete("/subscribers/{subscriber_id}")
def delete_subscriber(
    subscriber_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence),
):
    subscriber = (
        db.query(models.Newsletter)
        .filter(models.Newsletter.id == subscriber_id)
        .first()
    )

    if not subscriber:
        raise HTTPException(status_code=404, detail="Subscriber not found")

    db.delete(subscriber)
    db.commit()

    return {"message": "Subscriber deleted"}


# =====================================================
# CREATE CAMPAIGN
# =====================================================

@router.post("/campaign")
def create_campaign(
    data: schema.CreateCampaign,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence),
):
    if data.scheduled_for:
        if data.scheduled_for <= datetime.now(timezone.utc):
            raise HTTPException(
                status_code=400, detail="Schedule time must be in future"
            )

    campaign = models.NewsletterCampaign(
        subject=data.subject,
        body=data.body,
        audience_type=data.audience_type,
        subscriber_ids=data.subscriber_ids,
        template_id=data.template_id,
        blog_url=data.blog_url,
        auto_send=data.auto_send,
        scheduled_for=data.scheduled_for,
        status=("SCHEDULED" if data.scheduled_for else "DRAFT"),
    )

    db.add(campaign)
    db.commit()
    db.refresh(campaign)

    return campaign


# =====================================================
# SEND TEST EMAIL
# =====================================================
# Wrapped in try/except so an email failure returns a readable HTTPException
# (which carries CORS headers) instead of a raw 500 that the browser reports
# as a CORS block.

@router.post("/send-test")
async def send_test_email(
    data: schema.TestEmailRequest,
    admin=Depends(get_current_admin_dependence),
):
    # No subscriber record exists for a test send, so {{name}} becomes a
    # neutral greeting rather than being left visible in the email.
    body = _NAME_PLACEHOLDER.sub("there", data.body or "")

    try:
        await send_newsletter_email(
            email=data.email,
            subject=data.subject,
            body=body,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Email send failed: {type(e).__name__}: {e}",
        )

    return {"message": "Test email sent"}


# =====================================================
# SEND CAMPAIGN NOW
# =====================================================

@router.post("/campaign/{campaign_id}/send")
async def send_campaign_now(
    campaign_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence),
):
    campaign = (
        db.query(models.NewsletterCampaign)
        .filter(models.NewsletterCampaign.id == campaign_id)
        .first()
    )

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Resolve the recipient list
    if campaign.audience_type == "SELECTED":
        ids = campaign.subscriber_ids or []
        if not ids:
            raise HTTPException(
                status_code=400,
                detail="This campaign is SELECTED but has no subscriber_ids.",
            )
        subscribers = (
            db.query(models.Newsletter)
            .filter(models.Newsletter.id.in_(ids))
            .all()
        )
    else:
        subscribers = (
            db.query(models.Newsletter)
            .filter(models.Newsletter.status == "ACTIVE")
            .all()
        )

    if not subscribers:
        raise HTTPException(status_code=400, detail="No matching subscribers to send to.")

    count = 0
    errors = []  # collect real reasons instead of swallowing them

    for user in subscribers:
        try:
            await send_newsletter_email(
                email=user.email,
                subject=campaign.subject,
                # Each recipient gets their own name filled into {{name}}.
                body=personalize(campaign.body, user),
            )
            db.add(
                models.NewsletterRecipient(
                    campaign_id=campaign.id,
                    subscriber_id=user.id,
                    status="SENT",
                )
            )
            count += 1
        except Exception as e:
            db.add(
                models.NewsletterRecipient(
                    campaign_id=campaign.id,
                    subscriber_id=user.id,
                    status="FAILED",
                )
            )
            errors.append(f"{user.email}: {type(e).__name__}: {e}")

    # Status reflects reality: FAILED if nothing went out.
    campaign.status = "SENT" if count > 0 else "FAILED"
    campaign.sent_at = datetime.now(timezone.utc)
    campaign.recipient_count = count
    db.commit()

    # If EVERY send failed, don't pretend success — tell the caller why.
    if count == 0:
        raise HTTPException(
            status_code=502,
            detail=f"No emails were sent. First error → {errors[0] if errors else 'unknown'}",
        )

    return {
        "message": "Campaign sent",
        "recipients": count,
        "failed": len(errors),
        "errors": errors[:5],
    }


# =====================================================
# CAMPAIGN HISTORY
# =====================================================

@router.get("/history", response_model=list[schema.CampaignResponse])
def campaign_history(
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence),
):
    return (
        db.query(models.NewsletterCampaign)
        .order_by(models.NewsletterCampaign.id.desc())
        .all()
    )


# =====================================================
# TEMPLATES
# =====================================================

@router.get("/templates")
def get_templates(
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence),
):
    return db.query(models.NewsletterTemplate).all()


@router.post("/templates")
def create_template(
    data: schema.CreateTemplate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence),
):
    template = models.NewsletterTemplate(
        title=data.title,
        subject=data.subject,
        body=data.body,
        category=data.category,
    )

    db.add(template)
    db.commit()
    db.refresh(template)

    return template


# =====================================================
# SIGNUP FORM SETTINGS
# =====================================================

@router.get("/signup-form")
def signup_form(db: Session = Depends(get_db)):
    return db.query(models.NewsletterSignupSettings).first()


@router.put("/signup-form")
def update_signup_form(
    data: schema.SignupSettingsResponse,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence),
):
    settings = db.query(models.NewsletterSignupSettings).first()

    if not settings:
        settings = models.NewsletterSignupSettings()
        db.add(settings)

    settings.heading = data.heading
    settings.intro = data.intro
    settings.bullets = data.bullets
    settings.button_text = data.button_text

    db.commit()
    db.refresh(settings)

    return settings


@router.get("/recipients-count")
def recipient_count(
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence),
):
    count = (
        db.query(models.Newsletter)
        .filter(models.Newsletter.status == "ACTIVE")
        .count()
    )

    return {"count": count}


# =====================================================
# BLOG
# =====================================================

def _absolute_url(request: Request, path):
    """Turn a stored relative image path into a full URL the browser can load."""
    if not path:
        return None
    path = str(path)
    if path.startswith("http"):
        return path
    base = str(request.base_url).rstrip("/")
    return f"{base}/{path.lstrip('/')}"


# Paste a blog link -> get its title + image.
# 1) First look it up in OUR OWN DB by slug (your posts live here).
# 2) If not found, fetch the page and read OpenGraph / <title> tags
#    (works for any external URL; needs httpx -> pip install httpx).
@router.get("/parse-blog")
async def parse_blog(
    url: str,
    request: Request,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence),
):
    # --- 1) DB lookup by slug (last path segment of the URL) ---
    path = urlparse(url).path.rstrip("/")
    slug = path.split("/")[-1] if path else ""

    blog = None
    if slug:
        blog = db.query(models.Blog).filter(models.Blog.slug.contains(slug)).first()

    if blog:
        return {
            "title": blog.title,
            "image": _absolute_url(request, getattr(blog, "featured_image", None)),
            "url": url,
            "excerpt": getattr(blog, "excerpt", None),
        }

    # --- 2) Fallback: fetch the page and parse meta tags ---
    try:
        import httpx
    except ImportError:
        raise HTTPException(
            status_code=404,
            detail="Blog not found in the database. To support external URLs, run: pip install httpx",
        )

    try:
        async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
            resp = await client.get(url, headers={"User-Agent": "Mozilla/5.0"})
            html = resp.text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Couldn't fetch that URL: {e}")

    def meta(key):
        for tag in re.findall(r"<meta[^>]*>", html, re.IGNORECASE):
            if key.lower() in tag.lower():
                m = re.search(
                    r"content\s*=\s*[\x22\x27]([^\x22\x27]*)[\x22\x27]",
                    tag,
                    re.IGNORECASE,
                )
                if m:
                    return m.group(1)
        return None

    title = meta("og:title")
    if not title:
        t = re.search(r"<title[^>]*>(.*?)</title>", html, re.IGNORECASE | re.DOTALL)
        title = t.group(1).strip() if t else None

    image = meta("og:image")
    excerpt = meta("og:description")

    if not title and not image:
        raise HTTPException(status_code=404, detail="Couldn't read blog details from that URL.")

    return {"title": title, "image": image, "url": url, "excerpt": excerpt}


# blog_url is optional: no param -> return the most recent blog (loads the tab).
@router.get("/blog-preview")
def blog_preview(
    request: Request,
    blog_url: str | None = None,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence),
):
    query = db.query(models.Blog)

    if blog_url:
        blog = query.filter(models.Blog.slug.contains(blog_url)).first()
    else:
        blog = query.order_by(models.Blog.id.desc()).first()

    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    return {
        "title": blog.title,
        "image": _absolute_url(request, getattr(blog, "featured_image", None)),
        "url": blog.slug,
        "excerpt": getattr(blog, "excerpt", None),
    }


@router.get("/blog-setting")
def get_blog_setting(db: Session = Depends(get_db)):
    return db.query(models.NewsletterBlogSetting).first()


@router.put("/blog-setting")
def update_blog_setting(
    data: schema.BlogSettingResponse,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence),
):
    setting = db.query(models.NewsletterBlogSetting).first()

    if not setting:
        setting = models.NewsletterBlogSetting()
        db.add(setting)

    setting.enabled = data.enabled
    setting.template_id = data.template_id

    db.commit()

    return setting


# =====================================================
# CSV EXPORT
# =====================================================

from fastapi.responses import StreamingResponse
import csv
import io


@router.get("/export")
def export_subscribers(
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence),
):
    subscribers = db.query(models.Newsletter).all()

    stream = io.StringIO()
    writer = csv.writer(stream)

    writer.writerow(["Name", "Email", "Status", "Subscribed Date"])

    for user in subscribers:
        writer.writerow([user.name, user.email, user.status, user.subscribed_at])

    stream.seek(0)

    return StreamingResponse(
        stream,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=subscribers.csv"},
    )