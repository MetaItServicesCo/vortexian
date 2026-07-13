from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime

from app.database import get_db
from app import models
from app import schema

from app.routes.admin import get_current_admin_dependence
from app.email_service import send_newsletter_email
from datetime import datetime, timezone


router = APIRouter(
)


# =====================================================
# PUBLIC SUBSCRIBE
# =====================================================

@router.post("/subscribe")
def subscribe_newsletter(
    data: schema.CreateNewsletter,
    db: Session = Depends(get_db)
):

    existing = (
        db.query(models.Newsletter)
        .filter(models.Newsletter.email == data.email)
        .first()
    )


    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already subscribed"
        )


    subscriber = models.Newsletter(
        name=data.name,
        email=data.email,
        status="ACTIVE"
    )


    db.add(subscriber)
    db.commit()
    db.refresh(subscriber)


    return {
        "message":"Successfully subscribed"
    }



# =====================================================
# GET SUBSCRIBERS
# =====================================================

@router.get(
    "/subscribers",
    response_model=list[schema.NewsletterResponse]
)
def get_subscribers(
    db:Session = Depends(get_db),
    admin=Depends(get_current_admin_dependence)
):

    return (
        db.query(models.Newsletter)
        .order_by(models.Newsletter.id.desc())
        .all()
    )

@router.get("/subscribers/search")
def search_subscribers(

    query:str,

    db:Session=Depends(get_db),

    admin=Depends(get_current_admin_dependence)

):


    return (
        db.query(models.Newsletter)
        .filter(
            (models.Newsletter.email.contains(query))
            |
            (models.Newsletter.name.contains(query))
        )
        .all()
    )

# =====================================================
# DELETE SUBSCRIBER
# =====================================================

@router.delete("/subscribers/{subscriber_id}")
def delete_subscriber(
    subscriber_id:int,
    db:Session=Depends(get_db),
    admin=Depends(get_current_admin_dependence)
):

    subscriber = (
        db.query(models.Newsletter)
        .filter(
            models.Newsletter.id==subscriber_id
        )
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
        "message":"Subscriber deleted"
    }




# =====================================================
# CREATE CAMPAIGN
# =====================================================


@router.post("/campaign")
def create_campaign(
    data:schema.CreateCampaign,
    db:Session=Depends(get_db),
    admin=Depends(get_current_admin_dependence)
):

    if data.scheduled_for:

        if data.scheduled_for <= datetime.now(timezone.utc):

            raise HTTPException(
                status_code=400,
                detail="Schedule time must be in future"
            )



    campaign=models.NewsletterCampaign(

        subject=data.subject,

        body=data.body,

        audience_type=data.audience_type,
        subscriber_ids=data.subscriber_ids,
        template_id=data.template_id,


        blog_url=data.blog_url,


        auto_send=data.auto_send,
        scheduled_for=data.scheduled_for,

        status=(
            "SCHEDULED"
            if data.scheduled_for
            else
            "DRAFT"
        )

    )


    db.add(campaign)
    db.commit()
    db.refresh(campaign)



    return campaign





# =====================================================
# SEND TEST EMAIL
# =====================================================


@router.post("/send-test")
async def send_test_email(
    data:schema.TestEmailRequest,
    admin=Depends(get_current_admin_dependence)
):


    await send_newsletter_email(

        email=data.email,

        subject=data.subject,

        body=data.body

    )


    return {
        "message":"Test email sent"
    }




# =====================================================
# SEND CAMPAIGN NOW
# =====================================================


@router.post("/campaign/{campaign_id}/send")
async def send_campaign_now(

    campaign_id:int,

    db:Session=Depends(get_db),

    admin=Depends(get_current_admin_dependence)

):


    campaign=(

        db.query(models.NewsletterCampaign)

        .filter(
            models.NewsletterCampaign.id==campaign_id
        )

        .first()

    )


    if not campaign:

        raise HTTPException(
            status_code=404,
            detail="Campaign not found"
        )



    if campaign.audience_type == "SELECTED":

        subscribers = (
            db.query(models.Newsletter)
            .filter(
                models.Newsletter.id.in_(
                    campaign.subscriber_ids
                )
            )
            .all()
        )

    else:

        subscribers = (
            db.query(models.Newsletter)
            .filter(
                models.Newsletter.status == "ACTIVE"
            )
            .all()
        )


    count=0


    for user in subscribers:


        try:

            await send_newsletter_email(

                email=user.email,

                subject=campaign.subject,

                body=campaign.body

            )

            recipient=models.NewsletterRecipient(

                campaign_id=campaign.id,

                subscriber_id=user.id,

                status="SENT"

            )


            db.add(recipient)


            count+=1



        except Exception as e:


            recipient=models.NewsletterRecipient(

                campaign_id=campaign.id,

                subscriber_id=user.id,

                status="FAILED"

            )


            db.add(recipient)



    campaign.status="SENT"

    campaign.sent_at=datetime.utcnow()

    campaign.recipient_count=count


    db.commit()



    return {

        "message":"Campaign sent",

        "recipients":count

    }





# =====================================================
# CAMPAIGN HISTORY
# =====================================================


@router.get(
    "/history",
    response_model=list[schema.CampaignResponse]
)
def campaign_history(

    db:Session=Depends(get_db),

    admin=Depends(get_current_admin_dependence)

):


    return (

        db.query(models.NewsletterCampaign)

        .order_by(
            models.NewsletterCampaign.id.desc()
        )

        .all()

    )





# =====================================================
# TEMPLATES
# =====================================================


@router.get(
    "/templates"
)
def get_templates(

    db:Session=Depends(get_db),

    admin=Depends(get_current_admin_dependence)

):

    return (

        db.query(models.NewsletterTemplate)

        .all()

    )




@router.post("/templates")
def create_template(

    data:schema.CreateTemplate,

    db:Session=Depends(get_db),

    admin=Depends(get_current_admin_dependence)

):


    template=models.NewsletterTemplate(

        title=data.title,

        subject=data.subject,

        body=data.body,

        category=data.category

    )


    db.add(template)

    db.commit()

    db.refresh(template)


    return template





# =====================================================
# SIGNUP FORM SETTINGS
# =====================================================


@router.get("/signup-form")
def signup_form(

    db:Session=Depends(get_db)

):


    return (

        db.query(models.NewsletterSignupSettings)

        .first()

    )




@router.put("/signup-form")
def update_signup_form(

    data:schema.SignupSettingsResponse,

    db:Session=Depends(get_db),

    admin=Depends(get_current_admin_dependence)

):


    settings=(

        db.query(models.NewsletterSignupSettings)

        .first()

    )


    if not settings:

        settings=models.NewsletterSignupSettings()

        db.add(settings)



    settings.heading=data.heading

    settings.intro=data.intro

    settings.bullets=data.bullets

    settings.button_text=data.button_text


    db.commit()

    db.refresh(settings)


    return settings

@router.get("/recipients-count")
def recipient_count(
    db:Session=Depends(get_db),
    admin=Depends(get_current_admin_dependence)
):

    count = (
        db.query(models.Newsletter)
        .filter(
            models.Newsletter.status=="ACTIVE"
        )
        .count()
    )

    return {
        "count":count
    }
# =====================================================
# BLog
# =====================================================
@router.get("/blog-preview")
def blog_preview(
    blog_url:str,
    db:Session=Depends(get_db),
    admin=Depends(get_current_admin_dependence)
):


    blog = (
        db.query(models.Blog)
        .filter(
            models.Blog.slug.contains(blog_url)
        )
        .first()
    )


    if not blog:
        raise HTTPException(
            status_code=404,
            detail="Blog not found"
        )


    return {

        "title":blog.title,

        "image":blog.featured_image,

        "url":blog_url,

        "excerpt":blog.excerpt

    }


@router.get("/blog-setting")
def get_blog_setting(
    db:Session=Depends(get_db)
):

    return (
        db.query(models.NewsletterBlogSetting)
        .first()
    )


@router.put("/blog-setting")
def update_blog_setting(

    data:schema.BlogSettingResponse,

    db:Session=Depends(get_db),

    admin=Depends(get_current_admin_dependence)

):


    setting = (
        db.query(models.NewsletterBlogSetting)
        .first()
    )


    if not setting:

        setting=models.NewsletterBlogSetting()

        db.add(setting)


    setting.enabled=data.enabled

    setting.template_id=data.template_id


    db.commit()


    return setting
#/////////////////////// CSV //////////////

from fastapi.responses import StreamingResponse
import csv
import io


@router.get("/export")
def export_subscribers(

    db:Session=Depends(get_db),

    admin=Depends(get_current_admin_dependence)

):

    subscribers = (
        db.query(models.Newsletter)
        .all()
    )


    stream=io.StringIO()

    writer=csv.writer(stream)


    writer.writerow(
        [
            "Name",
            "Email",
            "Status",
            "Subscribed Date"
        ]
    )


    for user in subscribers:

        writer.writerow(
            [
                user.name,
                user.email,
                user.status,
                user.subscribed_at
            ]
        )


    stream.seek(0)


    return StreamingResponse(

        stream,

        media_type="text/csv",

        headers={
            "Content-Disposition":
            "attachment; filename=subscribers.csv"
        }

    )