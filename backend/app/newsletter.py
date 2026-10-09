"""Newsletter emails: settings, branded template, welcome email and sending campaigns.

Editable settings live in Site Content under "newsletter.settings"
(Dashboard → Newsletter → Settings). NEWSLETTER_DEFAULTS must match the
defaults in src/content/registry.js.
"""
import html
import json
import logging
import re
import time
from datetime import datetime, timezone
from email.utils import formataddr

from sqlalchemy import update
from sqlalchemy.orm import Session

from app import mailer, models
from app.config import settings as app_settings
from app.database import sessionlocal

log = logging.getLogger(__name__)

NEWSLETTER_DEFAULTS = {
    "from_name": "Vortexian Tech",
    "from_email": "newsletter@vortexiantech.com",
    "reply_to": "",
    "welcome_enabled": True,
    "welcome_subject": "Welcome to the Vortexian Tech newsletter",
    "welcome_html": (
        "<p>Hi there,</p>"
        "<p>Thanks for subscribing to the Vortexian Tech newsletter. We'll share our latest insights on software, "
        "digital marketing and IT hiring. No spam, and you can unsubscribe at any time.</p>"
        "<p>The Vortexian Tech team</p>"
    ),
    "footer_note": "You're receiving this email because you subscribed to the newsletter on vortexiantech.com.",
}
COMPANY_DEFAULTS = {"site_name": "Vortexian Tech", "logo": "/assets/images/logo-f.png", "address": ""}

SENDABLE = ("draft", "failed")  # a campaign that reached anyone is never sent again
PAUSE_BETWEEN_BATCHES = 0.6  # stay under Resend's default 2 requests/second


# ---------------------------------------------------------------- settings
def _content(db: Session, key: str) -> dict:
    row = db.get(models.SiteContent, key)
    if not row:
        return {}
    try:
        data = json.loads(row.data)
    except ValueError:
        return {}
    return data if isinstance(data, dict) else {}


def newsletter_settings(db: Session) -> dict:
    saved = {k: v for k, v in _content(db, "newsletter.settings").items() if v not in (None, "")}
    merged = {**NEWSLETTER_DEFAULTS, **saved}
    if "welcome_enabled" in saved:
        merged["welcome_enabled"] = bool(saved["welcome_enabled"])
    company = {**COMPANY_DEFAULTS, **{k: v for k, v in _content(db, "settings").items() if v}}
    merged["company"] = company
    return merged


def sender(cfg: dict) -> str:
    return formataddr((cfg["from_name"], cfg["from_email"]))


# ---------------------------------------------------------------- template
def site_url() -> str:
    return app_settings.site_url.rstrip("/")


def absolute(path: str | None) -> str:
    if not path:
        return ""
    return path if re.match(r"^https?://", path, re.I) else f"{site_url()}/{path.lstrip('/')}"


def absolutize_html(body: str) -> str:
    """Emails have no 'current site': make /uploads/… and /blog/… absolute."""
    return re.sub(r'(\s(?:src|href))="/(?!/)([^"]*)"', lambda m: f'{m.group(1)}="{site_url()}/{m.group(2)}"', body or "")


def _style_body(body: str) -> str:
    body = re.sub(r"<img\b(?![^>]*\bstyle=)", '<img style="max-width:100%;height:auto;border:0;"', body)
    body = re.sub(r"<a\b(?![^>]*\bstyle=)", '<a style="color:#1D1D7E;"', body)
    body = re.sub(r"<table\b(?![^>]*\bstyle=)", '<table style="border-collapse:collapse;width:100%;"', body)
    body = re.sub(r"<(td|th)\b(?![^>]*\bstyle=)", r'<\1 style="border:1px solid #e2e8f0;padding:6px 8px;"', body)
    return body


def html_to_text(body: str) -> str:
    text = re.sub(r'<a\b[^>]*href="([^"]+)"[^>]*>(.*?)</a>', lambda m: f"{m.group(2)} ({m.group(1)})" if m.group(1) not in m.group(2) else m.group(2), body or "", flags=re.S | re.I)
    text = re.sub(r"<(br|/p|/h[1-6]|/li|/tr|/blockquote|/div)\b[^>]*>", "\n", text, flags=re.I)
    text = re.sub(r"<li\b[^>]*>", "- ", text, flags=re.I)
    text = re.sub(r"<[^>]+>", "", text)
    text = html.unescape(text)
    return re.sub(r"\n{3,}", "\n\n", "\n".join(line.strip() for line in text.splitlines())).strip()


def unsubscribe_page(token: str) -> str:
    return f"{site_url()}/newsletter/unsubscribe?token={token}"


def unsubscribe_one_click(token: str) -> str:
    return f"{site_url()}/api/newsletter/unsubscribe/{token}"


def unsubscribe_headers(token: str) -> dict:
    # RFC 8058 one-click unsubscribe (Gmail / Yahoo bulk sender requirement)
    return {"List-Unsubscribe": f"<{unsubscribe_one_click(token)}>", "List-Unsubscribe-Post": "List-Unsubscribe=One-Click"}


def render_email(cfg: dict, *, subject: str, body_html: str, preheader: str = "", token: str = "preview") -> tuple[str, str]:
    """Returns (html, text) for one recipient."""
    company = cfg["company"]
    name = html.escape(company.get("site_name") or "Vortexian Tech")
    address = html.escape(company.get("address") or "").replace("\n", ", ")
    unsubscribe = unsubscribe_page(token)
    body = _style_body(absolutize_html(body_html))
    logo = absolute(company.get("logo"))
    logo_html = (
        f'<img src="{html.escape(logo)}" alt="{name}" height="40" style="height:40px;max-width:220px;border:0;display:block;">'
        if logo else f'<span style="font-size:20px;font-weight:bold;color:#1D1D7E;">{name}</span>'
    )
    page = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(subject)}</title></head>
<body style="margin:0;padding:0;background:#f4f5fb;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">{html.escape(preheader or "")}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5fb;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;">
<tr><td style="padding:24px 32px;border-bottom:3px solid #1D1D7E;"><a href="{site_url()}" style="text-decoration:none;">{logo_html}</a></td></tr>
<tr><td style="padding:32px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#1f2937;">{body}</td></tr>
<tr><td style="padding:20px 32px;background:#f8fafc;border-radius:0 0 12px 12px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#64748b;">
{html.escape(cfg.get("footer_note") or "")}<br>
{name}{f" · {address}" if address else ""}<br>
<a href="{html.escape(unsubscribe)}" style="color:#1D1D7E;">Unsubscribe</a> · <a href="{site_url()}" style="color:#1D1D7E;">{html.escape(site_url().split("://")[-1])}</a>
</td></tr></table></td></tr></table></body></html>"""
    text = "\n\n".join(filter(None, [
        html_to_text(absolutize_html(body_html)),
        "--",
        cfg.get("footer_note") or "",
        f"{company.get('site_name') or 'Vortexian Tech'}{', ' + company.get('address') if company.get('address') else ''}",
        f"Unsubscribe: {unsubscribe}",
    ]))
    return page, text


# ---------------------------------------------------------------- welcome
def send_welcome(subscriber_id: int) -> None:
    """Background task after sign-up; failures are logged, never shown to the visitor."""
    if not mailer.is_configured():
        return
    db = sessionlocal()
    try:
        subscriber = db.get(models.Newsletter, subscriber_id)
        cfg = newsletter_settings(db)
        if not subscriber or not cfg["welcome_enabled"]:
            return
        page, text = render_email(cfg, subject=cfg["welcome_subject"], body_html=cfg["welcome_html"], token=subscriber.unsubscribe_token)
        mailer.send_email(sender=sender(cfg), to=subscriber.email, subject=cfg["welcome_subject"], html=page, text=text,
                          reply_to=cfg["reply_to"] or None, headers=unsubscribe_headers(subscriber.unsubscribe_token))
    except Exception as err:  # noqa: BLE001 - logged for the admin, the visitor is already subscribed
        log.error("Welcome email to subscriber %s failed: %s", subscriber_id, err)
    finally:
        db.close()


# ---------------------------------------------------------------- campaigns
def claim_for_sending(db: Session, campaign_id: int) -> bool:
    """Atomically move draft/failed -> sending, so a campaign can't be sent twice."""
    result = db.execute(
        update(models.NewsletterCampaign)
        .where(models.NewsletterCampaign.id == campaign_id, models.NewsletterCampaign.status.in_(SENDABLE))
        .values(status="sending", sent_count=0, failed_count=0, last_error=None)
    )
    db.commit()
    return result.rowcount == 1


def send_campaign(campaign_id: int) -> None:
    """Background task: send to every subscriber in batches and record the result."""
    db = sessionlocal()
    try:
        campaign = db.get(models.NewsletterCampaign, campaign_id)
        cfg = newsletter_settings(db)
        subscribers = db.query(models.Newsletter).order_by(models.Newsletter.id).all()
        campaign.recipients_count = len(subscribers)
        db.commit()

        sent = failed = 0
        errors = []
        for start in range(0, len(subscribers), mailer.BATCH_SIZE):
            chunk = subscribers[start:start + mailer.BATCH_SIZE]
            emails = []
            for sub in chunk:
                page, text = render_email(cfg, subject=campaign.subject, body_html=campaign.body_html, preheader=campaign.preheader or "", token=sub.unsubscribe_token)
                email = {"from": sender(cfg), "to": [sub.email], "subject": campaign.subject, "html": page, "text": text,
                         "headers": unsubscribe_headers(sub.unsubscribe_token)}
                if cfg["reply_to"]:
                    email["reply_to"] = cfg["reply_to"]
                emails.append(email)
            try:
                sent += mailer.send_batch(emails, idempotency_key=f"campaign-{campaign.id}-batch-{start // mailer.BATCH_SIZE}")
            except mailer.MailError as err:
                failed += len(chunk)
                errors.append(str(err))
            campaign.sent_count, campaign.failed_count = sent, failed
            db.commit()
            if start + mailer.BATCH_SIZE < len(subscribers):
                time.sleep(PAUSE_BETWEEN_BATCHES)

        campaign.status = "sent" if failed == 0 else ("failed" if sent == 0 else "partial")
        campaign.last_error = errors[0] if errors else None
        campaign.sent_at = datetime.now(timezone.utc)
        db.commit()
    except Exception as err:  # noqa: BLE001
        log.exception("Newsletter %s failed", campaign_id)
        db.rollback()
        campaign = db.get(models.NewsletterCampaign, campaign_id)
        if campaign:
            campaign.status = "partial" if campaign.sent_count else "failed"
            campaign.last_error = str(err)
            db.commit()
    finally:
        db.close()
