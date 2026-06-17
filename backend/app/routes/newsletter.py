from fastapi import APIRouter, Depends, HTTPException, status
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
    db: Session = Depends(get_db),
):
    existing_email = (
        db.query(models.Newsletter)
        .filter(models.Newsletter.email == data.email)
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already subscribed",
        )

    subscriber = models.Newsletter(email=data.email)

    db.add(subscriber)
    db.commit()
    db.refresh(subscriber)

    return {"message": "Successfully subscribed"}


@router.get("/subscribers", response_model=list[NewsletterResponse])
def get_subscribers(
    db: Session = Depends(get_db),
    admin: models.Admin = Depends(get_current_admin_dependence),
):
    return (
        db.query(models.Newsletter)
        .order_by(models.Newsletter.id.desc())
        .all()
    )


def delete_subscriber_by_id(subscriber_id: int, db: Session):
    subscriber = (
        db.query(models.Newsletter)
        .filter(models.Newsletter.id == subscriber_id)
        .first()
    )

    if not subscriber:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscriber not found",
        )

    db.delete(subscriber)
    db.commit()

    return {"message": "Subscriber removed"}


@router.delete("/subscribers/{subscriber_id}")
def delete_subscriber_from_admin_page(
    subscriber_id: int,
    db: Session = Depends(get_db),
    admin: models.Admin = Depends(get_current_admin_dependence),
):
    return delete_subscriber_by_id(subscriber_id, db)


@router.delete("/{subscriber_id}")
def delete_subscriber(
    subscriber_id: int,
    db: Session = Depends(get_db),
    admin: models.Admin = Depends(get_current_admin_dependence),
):
    return delete_subscriber_by_id(subscriber_id, db)


@router.get("/test-email")
async def test_email():
    try:
        await send_newsletter_email(
            email="vortexian@gmail.com",
            subject="Test Email",
            body="<h1>Email Working Successfully</h1>",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Email service is not configured or reachable: {exc}",
        ) from exc

    return {"message": "Email sent successfully"}
