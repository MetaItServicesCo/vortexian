"""Sending email through Resend's HTTP API (https://resend.com/docs/api-reference).

The API key comes from the RESEND_API_KEY environment variable and never
leaves the server. RESEND_API_URL can point tests at a local stub.
"""
import httpx

from app.config import settings

BATCH_SIZE = 100  # Resend's per-request limit for /emails/batch
TIMEOUT = httpx.Timeout(30.0)


class MailError(Exception):
    pass


def is_configured() -> bool:
    return bool(settings.resend_api_key and settings.resend_api_key.get_secret_value().strip())


def _post(path: str, payload, idempotency_key: str | None = None) -> dict:
    if not is_configured():
        raise MailError("Email sending isn't set up: RESEND_API_KEY is missing on the server.")
    headers = {"Authorization": f"Bearer {settings.resend_api_key.get_secret_value().strip()}"}
    if idempotency_key:
        headers["Idempotency-Key"] = idempotency_key  # a retried request is never delivered twice
    try:
        response = httpx.post(f"{settings.resend_api_url.rstrip('/')}{path}", json=payload, headers=headers, timeout=TIMEOUT)
    except httpx.HTTPError as err:
        raise MailError(f"Could not reach Resend: {err}") from err
    if response.status_code >= 400:
        try:
            body = response.json()
            message = body.get("message") or body.get("error") or response.text
        except ValueError:
            message = response.text
        raise MailError(f"Resend rejected the email ({response.status_code}): {message}")
    return response.json() if response.content else {}


def send_email(*, sender: str, to: str, subject: str, html: str, text: str, reply_to: str | None = None, headers: dict | None = None) -> str:
    """Send one email. Returns Resend's email id."""
    payload = {"from": sender, "to": [to], "subject": subject, "html": html, "text": text}
    if reply_to:
        payload["reply_to"] = reply_to
    if headers:
        payload["headers"] = headers
    return _post("/emails", payload).get("id", "")


def send_batch(emails: list[dict], idempotency_key: str | None = None) -> int:
    """Send up to BATCH_SIZE individual emails in one request. Returns how many were accepted."""
    if not emails:
        return 0
    if len(emails) > BATCH_SIZE:
        raise ValueError(f"At most {BATCH_SIZE} emails per batch")
    data = _post("/emails/batch", emails, idempotency_key).get("data") or []
    return len(data) if isinstance(data, list) and data else len(emails)
