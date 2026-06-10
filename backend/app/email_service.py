from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from app.config import settings
from typing import List

# -----------------------------
# MAIL CONFIG
# -----------------------------
conf = ConnectionConfig(
    MAIL_USERNAME=settings.mail_username,
    MAIL_PASSWORD=settings.mail_password,
    MAIL_FROM=settings.mail_from,
    MAIL_PORT=settings.mail_port,
    MAIL_SERVER=settings.mail_server,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True
)

mail = FastMail(conf)


# -----------------------------
# SEND NEWSLETTER EMAIL
# -----------------------------
async def send_newsletter_email(email: str, subject: str, body: str):

    message = MessageSchema(
        subject=subject,
        recipients=[email],   # list required
        body=body,
        subtype="html"        # IMPORTANT for HTML email
    )

    await mail.send_message(message)