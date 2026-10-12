"""Assistant settings edited in Dashboard → AI Assistant (SiteContent key "ai.assistant").

Defaults here match the dashboard form (src/content/registry.js).
"""
import json

from sqlalchemy.orm import Session

from app import models

KEY = "ai.assistant"
MIN_IDLE_SECONDS, MAX_IDLE_SECONDS = 10, 600

DEFAULTS = {
    "enabled": True,
    "assistant_name": "Vortexian Assistant",
    "welcome_message": "Hi! I'm the Vortexian Tech assistant. Ask me anything about our services, projects or company.",
    "idle_enabled": True,
    "idle_seconds": 60,
    # Fallback when the AI can't write the personal opening message
    "idle_message": "Hi there 👋 Looking for help with a project? Leave your name and email and our team will get back to you, or ask me anything.",
    "lead_thanks": "Thank you! Our team will get back to you shortly. Is there anything else I can help you with?",
    "extra_instructions": "",
    "quick_questions": "What services do you offer?\nHow much does a project cost?\nCan I see your previous work?",
    "voice_enabled": True,
}

MAX_QUICK_QUESTIONS, MAX_QUESTION_CHARS = 6, 80


def quick_questions(conf: dict) -> list[str]:
    lines = [line.strip() for line in str(conf.get("quick_questions") or "").splitlines()]
    return [line[:MAX_QUESTION_CHARS] for line in lines if line][:MAX_QUICK_QUESTIONS]


def load(db: Session) -> dict:
    row = db.get(models.SiteContent, KEY)
    data = {}
    if row:
        try:
            data = json.loads(row.data) or {}
        except ValueError:
            data = {}
    merged = {**DEFAULTS, **{k: v for k, v in data.items() if v not in (None, "")}}
    if "quick_questions" in data:   # an emptied list means "no suggested questions"
        merged["quick_questions"] = data["quick_questions"] or ""
    try:
        merged["idle_seconds"] = min(MAX_IDLE_SECONDS, max(MIN_IDLE_SECONDS, int(merged["idle_seconds"])))
    except (TypeError, ValueError):
        merged["idle_seconds"] = DEFAULTS["idle_seconds"]
    return merged


def validate(data: dict) -> dict:
    """Called when the dashboard saves the settings."""
    if "idle_seconds" in data and data["idle_seconds"] not in (None, ""):
        try:
            seconds = int(data["idle_seconds"])
        except (TypeError, ValueError):
            seconds = -1
        if not MIN_IDLE_SECONDS <= seconds <= MAX_IDLE_SECONDS:
            raise ValueError(f"The lead capture delay must be between {MIN_IDLE_SECONDS} and {MAX_IDLE_SECONDS} seconds.")
        data = {**data, "idle_seconds": seconds}
    if len(str(data.get("extra_instructions") or "")) > 2000:
        raise ValueError("Extra instructions are limited to 2,000 characters.")
    questions = [q.strip() for q in str(data.get("quick_questions") or "").splitlines() if q.strip()]
    if len(questions) > MAX_QUICK_QUESTIONS:
        raise ValueError(f"Up to {MAX_QUICK_QUESTIONS} suggested questions, one per line.")
    if any(len(q) > MAX_QUESTION_CHARS for q in questions):
        raise ValueError(f"Keep each suggested question under {MAX_QUESTION_CHARS} characters.")
    return data
