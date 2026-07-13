from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import sessionlocal
from app import models
from app.email_service import send_newsletter_email

import asyncio
import logging


scheduler = BackgroundScheduler()



async def send_campaign(campaign_id:int):

    db:Session = sessionlocal()


    try:

        campaign = (
            db.query(models.NewsletterCampaign)
            .filter(
                models.NewsletterCampaign.id == campaign_id
            )
            .first()
        )


        if not campaign:
            return



        # already sent protection

        if campaign.status == "SENT":
            return



        # ===============================
        # GET AUDIENCE
        # ===============================


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
                    models.Newsletter.status=="ACTIVE"
                )
                .all()
            )



        sent_count=0



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


                sent_count +=1



            except Exception as e:


                logging.error(
                    f"Email failed {user.email}: {e}"
                )


                recipient=models.NewsletterRecipient(

                    campaign_id=campaign.id,

                    subscriber_id=user.id,

                    status="FAILED"

                )


                db.add(recipient)



        campaign.status="SENT"

        campaign.sent_at=datetime.utcnow()

        campaign.recipient_count=sent_count


        db.commit()



        print(
            f"Campaign {campaign.id} sent to {sent_count} users"
        )



    except Exception as e:


        logging.error(
            f"Campaign sending failed {e}"
        )


    finally:

        db.close()




def check_scheduled_campaigns():

    db= sessionlocal()


    try:


        campaigns=(

            db.query(
                models.NewsletterCampaign
            )

            .filter(

                models.NewsletterCampaign.status=="SCHEDULED"

            )

            .filter(

                models.NewsletterCampaign.scheduled_for <= datetime.now(timezone.utc)

            )

            .all()

        )



        for campaign in campaigns:


            asyncio.run(
                send_campaign(
                    campaign.id
                )
            )



    finally:

        db.close()




def start_scheduler():


    scheduler.add_job(

        check_scheduled_campaigns,

        trigger="interval",

        minutes=1

    )


    scheduler.start()


    print(
        "Newsletter scheduler started"
    )