"""AI assistant API.

Public (the chat widget):
    GET  /api/ai/config                 widget settings and a signed "visit" token, or {"enabled": false}
    GET  /api/ai/session/{id}           restore a conversation after a page reload
    POST /api/ai/chat                   a visitor message, or the idle event

The idle (lead capture) timing is decided here. The visit token records when
the visitor arrived (signed, so it can't be faked); the browser asks for the
idle message when the delay has passed and the server checks the token is old
enough, the visitor hasn't written yet and the message wasn't shown before.
A conversation is stored only once the visitor writes or the idle message shows.

Admin:
    GET  /api/ai/admin/status           models, API key, knowledge base state
    POST /api/ai/admin/knowledge/refresh
    GET  /api/ai/admin/knowledge/search?q=
    GET  /api/ai/admin/leads, GET/DELETE /api/ai/admin/leads/{id}
"""
from __future__ import annotations

import hashlib
import hmac
import json
import threading
import time
import uuid
from collections import defaultdict, deque
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app import models
from app.ai import assistant_settings, knowledge
from app.ai.agents import build_graph, last_error
from app.ai.providers import missing_key
from app.config import settings
from app.database import get_db
from app.routes.admin import get_current_admin_dependence
from app.trash import move_to_trash

router = APIRouter()

MAX_MESSAGE_CHARS = 1000
MAX_USER_MESSAGES = 60          # per conversation
MESSAGES_PER_MINUTE = 12        # per visitor IP
SESSIONS_PER_HOUR = 30          # per visitor IP
IDLE_TOLERANCE = 3              # seconds of clock/network slack


# ---------------------------------------------------------------- helpers

def now() -> datetime:
    return datetime.now(timezone.utc)


class _RateLimit:
    """Sliding-window counter per key (per backend worker; enough to stop abuse)."""

    def __init__(self, limit: int, window: float):
        self.limit, self.window, self.hits, self.lock = limit, window, defaultdict(deque), threading.Lock()

    def allow(self, key: str) -> bool:
        t = time.monotonic()
        with self.lock:
            hits = self.hits[key]
            while hits and t - hits[0] > self.window:
                hits.popleft()
            if len(hits) >= self.limit:
                return False
            hits.append(t)
            if len(self.hits) > 50_000:      # forget idle visitors
                for k in [k for k, v in self.hits.items() if not v][:10_000]:
                    del self.hits[k]
            return True


message_limit = _RateLimit(MESSAGES_PER_MINUTE, 60)
session_limit = _RateLimit(SESSIONS_PER_HOUR, 3600)


def ip_hash(request: Request) -> str:
    ip = (request.headers.get("x-real-ip") or request.headers.get("x-forwarded-for", "").split(",")[0]
          or (request.client.host if request.client else "")).strip()
    return hashlib.sha256(f"{ip}|{settings.secret_key.get_secret_value()}".encode()).hexdigest()[:32]


def _json(value: str, default):
    try:
        parsed = json.loads(value or "")
    except ValueError:
        return default
    return parsed if isinstance(parsed, type(default)) else default


def _aware(value: datetime) -> datetime:
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)


def company_info(db: Session) -> dict:
    row = db.get(models.SiteContent, "settings")
    data = _json(row.data, {}) if row else {}
    return {"company": data.get("site_name") or "Vortexian Tech", "site_url": settings.site_url}


def ai_ready() -> str | None:
    """Why the assistant can't answer, if it can't."""
    key = missing_key(settings.ai_chat_model)
    return f"{key} is not set on the server." if key else None


VISIT_MAX_AGE = 24 * 3600


def visit_token(arrived: float) -> str:
    stamp = str(int(arrived))
    sig = hmac.new(settings.secret_key.get_secret_value().encode(), f"ai-visit:{stamp}".encode(), hashlib.sha256).hexdigest()[:32]
    return f"{stamp}.{sig}"


def visit_arrived(token: str | None) -> float | None:
    """When the visitor arrived, from a valid visit token."""
    stamp, _, sig = (token or "").partition(".")
    if not stamp.isdigit() or not hmac.compare_digest(visit_token(int(stamp)), f"{stamp}.{sig}"):
        return None
    age = time.time() - int(stamp)
    return float(stamp) if -60 <= age <= VISIT_MAX_AGE else None


def idle_in(conf: dict, arrived: float | None, session: models.AIChatSession | None = None) -> int | None:
    """Seconds until the lead capture message may show (None: it won't)."""
    if not (conf["enabled"] and conf["idle_enabled"]) or arrived is None:
        return None
    if session is not None and (session.user_messages or _json(session.state, {}).get("nudged")):
        return None
    return max(0, int(conf["idle_seconds"] - (time.time() - arrived)))


def public_messages(session: models.AIChatSession) -> list[dict]:
    return [{"role": m["role"], "content": m["content"], **({"sources": m["sources"]} if m.get("sources") else {})}
            for m in _json(session.messages, [])]


_graph = None


def graph():
    global _graph
    if _graph is None:
        _graph = build_graph(knowledge.search)
    return _graph


# ---------------------------------------------------------------- public

@router.get("/config")
def config(db: Session = Depends(get_db)):
    conf = assistant_settings.load(db)
    if not conf["enabled"] or ai_ready():
        return {"enabled": False}
    return {
        "enabled": True,
        "assistant_name": conf["assistant_name"],
        "welcome_message": conf["welcome_message"],
        "idle_seconds": conf["idle_seconds"] if conf["idle_enabled"] else None,
        "visit": visit_token(time.time()),   # the browser keeps the first one for the whole visit
    }


@router.get("/session/{session_id}")
def get_session(session_id: str, visit: str | None = None, db: Session = Depends(get_db)):
    session = db.get(models.AIChatSession, session_id[:36])
    if not session:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    conf = assistant_settings.load(db)
    state = _json(session.state, {})
    return {"session_id": session.id, "messages": public_messages(session),
            "idle_in": idle_in(conf, visit_arrived(visit), session), "lead_status": state.get("lead_status", "none")}


class ChatIn(BaseModel):
    session_id: str | None = Field(default=None, max_length=36)
    visit: str | None = Field(default=None, max_length=80)
    event: str = Field(default="message", pattern="^(message|idle)$")
    message: str | None = Field(default=None, max_length=MAX_MESSAGE_CHARS)
    page: str | None = Field(default=None, max_length=300)


@router.post("/chat")
def chat(body: ChatIn, request: Request, db: Session = Depends(get_db)):
    conf = assistant_settings.load(db)
    if not conf["enabled"] or ai_ready():
        raise HTTPException(status_code=503, detail="The assistant is not available right now.")
    session = db.get(models.AIChatSession, body.session_id) if body.session_id else None
    if body.session_id and not session:
        raise HTTPException(status_code=404, detail="Conversation not found. Please reload the page.")
    arrived = visit_arrived(body.visit)

    if body.event == "idle":
        wait = idle_in(conf, arrived, session)
        if wait is None:
            return {"reply": None, "skipped": True, "session_id": session.id if session else None}
        if wait > IDLE_TOLERANCE:
            raise HTTPException(status_code=409, detail={"message": "Too early.", "idle_in": wait})
        message = ""
    else:
        message = (body.message or "").strip()
        if not message:
            raise HTTPException(status_code=400, detail="Please type a message.")
        if session and session.user_messages >= MAX_USER_MESSAGES:
            raise HTTPException(status_code=429, detail="This conversation has reached its limit. Please use the Contact page and our team will help you.")
        if not message_limit.allow(ip_hash(request)):
            raise HTTPException(status_code=429, detail="You're sending messages too quickly. Please wait a moment.")

    if session is None:   # first message (or idle message) of this visit
        who = ip_hash(request)
        if not session_limit.allow(who):
            raise HTTPException(status_code=429, detail="Too many conversations started. Please try again later.")
        session = models.AIChatSession(id=str(uuid.uuid4()), first_page=(body.page or "")[:300], ip_hash=who,
                                       created_at=now(), last_seen_at=now(), messages="[]", state="{}", user_messages=0)
        db.add(session)
    state = _json(session.state, {})
    history = _json(session.messages, [])

    result = graph().invoke({
        "event": body.event,
        "message": message,
        "history": [{"role": m["role"], "content": m["content"]} for m in history],
        "page": (body.page or session.first_page or "")[:300],
        "lead": state.get("lead", {}),
        "lead_status": state.get("lead_status", "none"),
        "ctx": {**conf, **company_info(db)},
    })

    stamp = now().isoformat()
    if body.event == "message":
        history.append({"role": "user", "content": message, "at": stamp})
        session.user_messages += 1
    history.append({"role": "assistant", "content": result["reply"], "agent": result["agent"], "at": stamp,
                    **({"sources": result["sources"]} if result.get("sources") else {})})
    state["lead"] = result.get("lead", state.get("lead", {}))
    state["lead_status"] = result.get("lead_status", state.get("lead_status", "none"))
    if body.event == "idle":
        state["nudged"] = True
    session.messages = json.dumps(history, ensure_ascii=False)
    session.state = json.dumps(state, ensure_ascii=False)
    session.last_seen_at = now()
    _save_lead(db, session, state, body.page)
    db.commit()

    return {"session_id": session.id, "reply": result["reply"], "agent": result["agent"],
            "sources": result.get("sources", []), "lead_status": state["lead_status"]}


def _save_lead(db: Session, session: models.AIChatSession, state: dict, page: str | None) -> None:
    """Create or update the session's lead once there is a way to contact the visitor."""
    lead = state.get("lead") or {}
    if not (lead.get("email") or lead.get("phone")):
        return
    row = db.query(models.AIChatLead).filter(models.AIChatLead.session_id == session.id).first()
    if row is None:
        row = models.AIChatLead(session_id=session.id, created_at=now(), page=(page or session.first_page or "")[:300])
        db.add(row)
    for field in ("name", "email", "phone", "company", "need"):
        if lead.get(field):
            setattr(row, field, lead[field])
    row.transcript = session.messages
    row.updated_at = now()


# ---------------------------------------------------------------- admin

def _lead_dict(row: models.AIChatLead, transcript: bool = False) -> dict:
    data = {
        "id": row.id, "name": row.name, "email": row.email, "phone": row.phone, "company": row.company,
        "need": row.need, "page": row.page,
        "complete": bool(row.name and (row.email or row.phone) and row.need),
        "created_at": _aware(row.created_at).isoformat() if row.created_at else None,
        "updated_at": _aware(row.updated_at).isoformat() if row.updated_at else None,
    }
    if transcript:
        data["transcript"] = [{"role": m.get("role"), "content": m.get("content"), "at": m.get("at")} for m in _json(row.transcript, [])]
    return data


@router.get("/admin/status")
def admin_status(db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    conf = assistant_settings.load(db)
    problem = ai_ready()
    embed_key = missing_key(settings.ai_embedding_model, "embeddings")
    return {
        "enabled": conf["enabled"],
        "ready": not problem and conf["enabled"],
        "problem": problem,
        "chat_model": settings.ai_chat_model,
        "fast_model": settings.ai_fast_model,
        "embedding_model": settings.ai_embedding_model,
        "embedding_problem": f"{embed_key} is not set on the server." if embed_key else None,
        "crawl_url": knowledge.base_url(),
        "idle_seconds": conf["idle_seconds"],
        "idle_enabled": conf["idle_enabled"],
        "knowledge": knowledge.state_dict(knowledge.get_state(db)),
        "last_model_error": dict(last_error) or None,
        "leads": db.query(models.AIChatLead).count(),
        "conversations": db.query(models.AIChatSession).filter(models.AIChatSession.user_messages > 0).count(),
    }


@router.post("/admin/knowledge/refresh", status_code=202)
def admin_refresh(db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    state = knowledge.get_state(db)
    if state.status == "indexing" and state.started_at and now() - _aware(state.started_at) < knowledge.STALE_RUN:
        return {"started": False, "message": "The knowledge base is already being refreshed."}
    threading.Thread(target=knowledge.refresh, args=("refresh requested in the dashboard",), daemon=True).start()
    return {"started": True, "message": "Refresh started. It usually takes under a minute."}


@router.get("/admin/knowledge/search")
def admin_search(q: str, db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    try:
        return {"results": knowledge.search(q[:500], k=5)}
    except Exception as err:
        raise HTTPException(status_code=503, detail=f"Search failed: {err}")


@router.get("/admin/leads")
def admin_leads(db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    rows = db.query(models.AIChatLead).order_by(models.AIChatLead.created_at.desc()).all()
    return [_lead_dict(r) for r in rows]


@router.get("/admin/leads/{lead_id}")
def admin_lead(lead_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    row = db.get(models.AIChatLead, lead_id)
    if not row:
        raise HTTPException(status_code=404, detail="Lead not found.")
    return _lead_dict(row, transcript=True)


@router.delete("/admin/leads/{lead_id}")
def admin_delete_lead(lead_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin_dependence)):
    row = db.get(models.AIChatLead, lead_id)
    if not row:
        raise HTTPException(status_code=404, detail="Lead not found.")
    move_to_trash(db, "chat-leads", [row], admin)
    return {"message": "Lead deleted. It can be restored from Recently deleted for 7 days."}
