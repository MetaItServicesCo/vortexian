from apscheduler.schedulers.background import BackgroundScheduler
from app.database import sessionlocal
from app import models
from app.email_service import send_newsletter_email
import asyncio
import logging
import os

scheduler = BackgroundScheduler()


def send_newsletter_job():
    print("Newsletter job started...")
    db = sessionlocal()

    try:
        subscribers = db.query(models.Newsletter).all()

        if not subscribers:
            print("No newsletter subscribers found.")
            return

        async def send_all():
            for user in subscribers:
                try:
                    await send_newsletter_email(
                        email=user.email,
                        subject="Vortexian Weekly Newsletter 🚀",
                        body="""
                        <h2>Welcome to Vortexian Newsletter</h2>
                        <p>Thanks for staying with us!</p>
                        """
                    )
                except Exception as e:
                    logging.error(f"Failed email {user.email}: {e}")

        asyncio.run(send_all())

    except Exception as e:
        logging.error(f"Newsletter job failed: {e}")

    finally:
        db.close()


def start_scheduler():
    # Opt-in: every uvicorn worker runs this, so enabling it with multiple
    # workers sends duplicate emails. Run with a single worker if enabled.
    if os.getenv("ENABLE_NEWSLETTER_SCHEDULER", "").lower() not in ("1", "true", "yes"):
        print("Newsletter scheduler disabled (set ENABLE_NEWSLETTER_SCHEDULER=true to enable)")
        return

    scheduler.add_job(
        send_newsletter_job,
        trigger="interval",
        days=7 
        # minutes=1
    )

    scheduler.start()

    print("📩 Newsletter scheduler started")