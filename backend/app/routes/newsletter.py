from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.schema import CreateNewsletter, NewsletterResponse
from app.routes.admin import get_current_admin_dependence

from app.email_service import send_newsletter_email

router = APIRouter()


@router.post("/subscribe")
def subscribe_newsletter(
    data: CreateNewsletter,
    db: Session = Depends(get_db)
):
    existing_email = (
        db.query(models.Newsletter)
        .filter(models.Newsletter.email == data.email)
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already subscribed"
        )

    subscriber = models.Newsletter(
        email=data.email
    )

    db.add(subscriber)
    db.commit()
    db.refresh(subscriber)

    return {
        "message": "Successfully subscribed"
    }

@router.get(
    "/subscribers",
    response_model=list[NewsletterResponse]
)
def get_subscribers(
    db: Session = Depends(get_db),
    admin: models.Admin = Depends(get_current_admin_dependence)
):
    return (
        db.query(models.Newsletter)
        .order_by(models.Newsletter.id.desc())
        .all()
    )


@router.delete("/{subscriber_id}")
def delete_subscriber(
    subscriber_id: int,
    db: Session = Depends(get_db),
    admin: models.Admin = Depends(get_current_admin_dependence)
):
    subscriber = (
        db.query(models.Newsletter)
        .filter(models.Newsletter.id == subscriber_id)
        .first()
    )

    if not subscriber:
        raise HTTPException(
            status_code=404,
            detail="Subscriber not found"
        )

    db.delete(subscriber)
    db.commit()

    return {
        "message": "Subscriber removed"
    }


@router.get("/test-email")
async def test_email():

    await send_newsletter_email(
        email="your_email",  # your email
        subject="Test Email",
        body="<h1>Email Working Successfully 🚀</h1>"
    )

    return {"message": "Email sent successfully"}