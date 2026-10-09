from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Response, status
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from app import mailer, models
from app import newsletter as nl
from app.database import get_db
from app.routes.admin import get_current_admin_dependence
from app.sanitize import clean_html
from app.schema import CampaignInput, CampaignResponse, CreateNewsletter, NewsletterResponse, TestSendInput
from app.trash import move_to_trash

router = APIRouter()


# ---------------- PUBLIC: subscribe / unsubscribe ----------------
@router.post("/subscribe")
def subscribe_newsletter(data: CreateNewsletter, background: BackgroundTasks, db: Session = Depends(get_db)):
    email = data.email.strip().lower()
    existing = db.query(models.Newsletter).filter(models.Newsletter.email == email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already subscribed")

    subscriber = models.Newsletter(email=email)
    db.add(subscriber)
    db.commit()
    db.refresh(subscriber)
    background.add_task(nl.send_welcome, subscriber.id)  # never delays or fails the sign-up
    return {"message": "Successfully subscribed"}


def _unsubscribe(token: str, db: Session) -> bool:
    subscriber = db.query(models.Newsletter).filter(models.Newsletter.unsubscribe_token == token).first() if token else None
    if subscriber:
        db.delete(subscriber)  # the visitor's choice: removed for good, not kept in Recently deleted
        db.commit()
    return subscriber is not None


@router.post("/unsubscribe")
def unsubscribe(data: dict, db: Session = Depends(get_db)):
    """From the website's unsubscribe page (button press, so link scanners can't unsubscribe people)."""
    removed = _unsubscribe(str(data.get("token") or ""), db)
    return {"message": "You have been unsubscribed." if removed else "This address is already unsubscribed.", "removed": removed}


@router.post("/unsubscribe/{token}")
def unsubscribe_one_click(token: str, db: Session = Depends(get_db)):
    """RFC 8058 one-click unsubscribe, called by Gmail/Outlook from the List-Unsubscribe header."""
    _unsubscribe(token, db)
    return Response(status_code=200)


# ---------------- ADMIN: subscribers ----------------
@router.get("/subscribers", response_model=list[NewsletterResponse])
def get_subscribers(db: Session = Depends(get_db), admin: models.Admin = Depends(get_current_admin_dependence)):
    return db.query(models.Newsletter).order_by(models.Newsletter.id.desc()).all()


def delete_subscriber_by_id(subscriber_id: int, db: Session, admin=None):
    subscriber = db.query(models.Newsletter).filter(models.Newsletter.id == subscriber_id).first()
    if not subscriber:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscriber not found")
    move_to_trash(db, "newsletter", [subscriber], admin)
    return {"message": "Subscriber removed"}


@router.delete("/subscribers/{subscriber_id}")
def delete_subscriber_from_admin_page(subscriber_id: int, db: Session = Depends(get_db), admin: models.Admin = Depends(get_current_admin_dependence)):
    return delete_subscriber_by_id(subscriber_id, db, admin)


# ---------------- ADMIN: status ----------------
@router.get("/status")
def newsletter_status(db: Session = Depends(get_db), admin: models.Admin = Depends(get_current_admin_dependence)):
    cfg = nl.newsletter_settings(db)
    return {
        "configured": mailer.is_configured(),  # never returns the key itself
        "sender": nl.sender(cfg),
        "reply_to": cfg["reply_to"] or None,
        "welcome_enabled": cfg["welcome_enabled"],
        "subscribers": db.query(models.Newsletter).count(),
        "admin_email": admin.email,
    }


# ---------------- ADMIN: campaigns ----------------
def _campaign_or_404(campaign_id: int, db: Session) -> models.NewsletterCampaign:
    campaign = db.get(models.NewsletterCampaign, campaign_id)
    if not campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Newsletter not found")
    return campaign


def _editable(campaign: models.NewsletterCampaign) -> None:
    if campaign.status not in nl.SENDABLE:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This newsletter has already been sent and can't be changed. Duplicate it to send a new version.")


def _clean(data: CampaignInput) -> dict:
    subject = data.subject.strip()
    if not subject:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Subject is required.")
    return {"subject": subject, "preheader": (data.preheader or "").strip() or None, "body_html": clean_html(data.body_html) or ""}


@router.get("/campaigns", response_model=list[CampaignResponse])
def list_campaigns(db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    return db.query(models.NewsletterCampaign).order_by(models.NewsletterCampaign.id.desc()).all()


@router.post("/campaigns", response_model=CampaignResponse, status_code=201)
def create_campaign(data: CampaignInput, db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    campaign = models.NewsletterCampaign(**_clean(data), created_by=getattr(admin, "username", None))
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign


@router.get("/campaigns/{campaign_id}", response_model=CampaignResponse)
def get_campaign(campaign_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    return _campaign_or_404(campaign_id, db)


@router.put("/campaigns/{campaign_id}", response_model=CampaignResponse)
def update_campaign(campaign_id: int, data: CampaignInput, db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    campaign = _campaign_or_404(campaign_id, db)
    _editable(campaign)
    for key, value in _clean(data).items():
        setattr(campaign, key, value)
    db.commit()
    db.refresh(campaign)
    return campaign


@router.post("/campaigns/{campaign_id}/duplicate", response_model=CampaignResponse, status_code=201)
def duplicate_campaign(campaign_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    source = _campaign_or_404(campaign_id, db)
    copy = models.NewsletterCampaign(subject=source.subject, preheader=source.preheader, body_html=source.body_html, created_by=getattr(admin, "username", None))
    db.add(copy)
    db.commit()
    db.refresh(copy)
    return copy


@router.delete("/campaigns/{campaign_id}")
def delete_campaign(campaign_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    campaign = _campaign_or_404(campaign_id, db)
    if campaign.status == "sending":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This newsletter is being sent right now.")
    db.delete(campaign)
    db.commit()
    return {"message": "Newsletter deleted"}


@router.post("/campaigns/preview", response_class=HTMLResponse)
def preview_draft(data: CampaignInput, db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    """Exactly what subscribers will receive (unsaved changes included)."""
    cleaned = _clean(data)
    page, _ = nl.render_email(nl.newsletter_settings(db), subject=cleaned["subject"], body_html=cleaned["body_html"], preheader=cleaned["preheader"] or "")
    return HTMLResponse(page)


@router.post("/campaigns/{campaign_id}/test")
def send_test(campaign_id: int, data: TestSendInput, db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    campaign = _campaign_or_404(campaign_id, db)
    cfg = nl.newsletter_settings(db)
    to = str(data.email or admin.email)
    page, text = nl.render_email(cfg, subject=campaign.subject, body_html=campaign.body_html, preheader=campaign.preheader or "", token="test")
    try:
        mailer.send_email(sender=nl.sender(cfg), to=to, subject=f"[Test] {campaign.subject}", html=page, text=text, reply_to=cfg["reply_to"] or None)
    except mailer.MailError as err:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(err)) from err
    return {"message": f"Test email sent to {to}"}


@router.post("/campaigns/{campaign_id}/send", response_model=CampaignResponse)
def send_campaign(campaign_id: int, background: BackgroundTasks, db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    campaign = _campaign_or_404(campaign_id, db)
    if not mailer.is_configured():
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Email sending isn't set up: RESEND_API_KEY is missing on the server.")
    if not (campaign.body_html or "").strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The newsletter has no content yet.")
    if db.query(models.Newsletter).count() == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="There are no subscribers to send to.")
    if not nl.claim_for_sending(db, campaign_id):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This newsletter is already being sent or has been sent.")
    background.add_task(nl.send_campaign, campaign_id)
    db.refresh(campaign)
    return campaign
