"""Knowledge base for the chat agent: the public website, chunked and embedded in pgvector.

How it stays current
  * Every admin change to website content (services, blog, portfolio, pages,
    news, team, testimonials, site content, categories) marks the knowledge
    base as changed (SQLAlchemy events below).
  * A background thread in each backend worker refreshes it about 30 seconds
    after the last change (so a burst of edits is indexed once), once a day as
    a safety net, and when the dashboard's "Refresh now" button is pressed.
  * A Postgres advisory lock makes sure only one worker indexes at a time.
  * Refreshing is incremental: pages whose text didn't change keep their vectors.

Pages are read from the live website (the same HTML visitors get), so what the
assistant knows is exactly what the site shows, including built-in page text.
"""
from __future__ import annotations

import hashlib
import json
import re
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from html import unescape
from html.parser import HTMLParser
from itertools import chain
from urllib.parse import quote

import httpx
from sqlalchemy import event, text
from sqlalchemy.orm import Session

from app import models
from app.config import settings
from app.database import engine, sessionlocal
from app.ai.providers import ProviderError, embedder

TABLE = "ai_kb_chunks"
LOCK_ID = 734_200_117               # pg advisory lock for indexing
DEBOUNCE = timedelta(seconds=30)    # wait for a burst of edits to finish
DAILY = timedelta(hours=24)         # safety-net refresh
STALE_RUN = timedelta(minutes=30)   # an "indexing" status older than this was interrupted
CHUNK_CHARS, OVERLAP_CHARS = 1000, 200
MAX_PAGES = 400
BUILT_IN_PAGES = ["/", "/about", "/services", "/portfolio", "/blog", "/news", "/career", "/contact"]

INSTALL_HELP = (
    "The pgvector extension is not installed in the database. On the server run: "
    "apt install postgresql-18-pgvector, then as the postgres user: "
    "CREATE EXTENSION IF NOT EXISTS vector; in the website database. Then press Refresh now."
)


def now() -> datetime:
    return datetime.now(timezone.utc)


def aware(value: datetime | None) -> datetime | None:
    if value is None:
        return None
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)


def is_postgres() -> bool:
    return engine.dialect.name == "postgresql"


# ================================================================ state

def get_state(db: Session) -> models.AIKnowledgeState:
    state = db.get(models.AIKnowledgeState, 1)
    if state is None:
        state = models.AIKnowledgeState(id=1, status="empty", pages=0, chunks=0)
        db.add(state)
        db.commit()
        db.refresh(state)
    return state


def update_state(**fields) -> None:
    with sessionlocal() as db:
        state = get_state(db)
        for key, value in fields.items():
            setattr(state, key, value)
        db.commit()


def state_dict(state: models.AIKnowledgeState) -> dict:
    changed, indexed = aware(state.changed_at), aware(state.indexed_at)
    return {
        "status": state.status,
        "message": state.message,
        "pages": state.pages,
        "chunks": state.chunks,
        "embedding_model": state.embedding_model,
        "changed_at": changed.isoformat() if changed else None,
        "indexed_at": indexed.isoformat() if indexed else None,
        "pending_changes": bool(changed and (indexed is None or changed > indexed)),
    }


# ================================================================ change tracking

CONTENT_MODELS = (
    models.Service, models.Blog, models.Portfolio, models.Page, models.NewsFeed,
    models.Team, models.Testimonial, models.SiteContent, models.Category,
)


def _is_content(obj) -> bool:
    if isinstance(obj, models.SiteContent):
        return not obj.key.startswith(("ai.", "seo."))   # assistant/SEO settings don't change what pages say
    return isinstance(obj, CONTENT_MODELS)


@event.listens_for(Session, "after_flush")
def _note_content_change(session, _flush_context):
    if any(_is_content(obj) for obj in chain(session.new, session.dirty, session.deleted)):
        session.info["kb_changed"] = True


@event.listens_for(Session, "do_orm_execute")
def _note_bulk_change(state):
    if (state.is_update or state.is_delete) and any(m.class_ in CONTENT_MODELS for m in state.all_mappers):
        state.session.info["kb_changed"] = True


@event.listens_for(Session, "after_commit")
def _mark_changed(session):
    if session.info.pop("kb_changed", False):
        try:
            with engine.begin() as conn:
                updated = conn.execute(text('UPDATE "AIKnowledgeState" SET changed_at = :t WHERE id = 1'), {"t": now()}).rowcount
                if not updated:
                    conn.execute(text('INSERT INTO "AIKnowledgeState" (id, status, pages, chunks, changed_at) VALUES (1, \'empty\', 0, 0, :t)'), {"t": now()})
        except Exception as err:  # never break an admin save because of the assistant
            print(f"Knowledge base change not recorded: {err}")


@event.listens_for(Session, "after_rollback")
def _forget_change(session):
    session.info.pop("kb_changed", None)


# ================================================================ reading the website

class _TextExtractor(HTMLParser):
    """Visible text of <main> (or the whole body), without scripts, menus or footers."""
    SKIP = {"script", "style", "noscript", "svg", "template", "iframe", "button", "form", "select", "nav"}
    BLOCK = {"p", "div", "section", "article", "li", "ul", "ol", "h1", "h2", "h3", "h4", "h5", "h6",
             "br", "tr", "table", "blockquote", "header", "footer", "dd", "dt", "figcaption", "main"}

    def __init__(self, region: str):
        super().__init__(convert_charrefs=True)
        self.region, self.depth, self.skip, self.parts, self.title, self._in_title = region, 0, 0, [], "", False
        self.h1, self._h1_depth = "", 0

    def handle_starttag(self, tag, attrs):
        if tag == "title":
            self._in_title = True
        if tag == "h1" and not self.h1:
            self._h1_depth = 1
        if tag == self.region:
            self.depth += 1
        if self.depth and tag in self.SKIP:
            self.skip += 1
        if tag in self.BLOCK:
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        if tag == "h1":
            self._h1_depth = 0
        if self.depth and tag in self.SKIP and self.skip:
            self.skip -= 1
        if tag == self.region and self.depth:
            self.depth -= 1
        if tag in self.BLOCK:
            self.parts.append("\n")

    def handle_data(self, data):
        if self._in_title:
            self.title += data
            return
        if self._h1_depth and self.depth:
            self.h1 += data
        if self.depth and not self.skip:
            self.parts.append(data)

    def text(self) -> str:
        lines = (re.sub(r"[ \t ]+", " ", line).strip() for line in "".join(self.parts).split("\n"))
        return "\n".join(line for line in lines if line)


SITE_SUFFIX = re.compile(r"\s*[|\u2014\u2013-]\s*Vortexian Tech\s*$", re.I)


def extract(html: str, region: str = "main") -> tuple[str, str]:
    """(title, text): the page's <title> without the site name (else its main
    heading, in normal case if it's shown in capitals) and its visible text."""
    parser = _TextExtractor(region)
    parser.feed(html)
    clean = lambda value: re.sub(r"\s+", " ", unescape(value)).strip()
    title = SITE_SUFFIX.sub("", clean(parser.title))
    if len(title) < 4:
        heading = clean(parser.h1)
        title = heading.title() if heading.isupper() else heading or title
    return title[:200], parser.text()


@dataclass
class Doc:
    key: str      # url path (or "contact-details")
    url: str      # public path shown to visitors
    title: str
    text: str
    hash: str = ""


def page_paths(db: Session) -> list[str]:
    paths = list(BUILT_IN_PAGES)
    paths += [f"/services/{quote(s.url_slug, safe='')}" for s in db.query(models.Service).filter(models.Service.url_slug.isnot(None)).all() if s.url_slug]
    paths += [f"/blog/{quote(b.slug or str(b.id), safe='')}" for b in db.query(models.Blog).all()]
    paths += [f"/portfolio/{quote(p.slug or str(p.id), safe='')}" for p in db.query(models.Portfolio).all()]
    paths += [f"/{p.slug}" for p in db.query(models.Page).filter(models.Page.is_published.is_(True)).all()]
    return list(dict.fromkeys(paths))[:MAX_PAGES]


def base_url() -> str:
    return (settings.ai_crawl_base_url or settings.site_url).rstrip("/")


def collect_documents(db: Session) -> list[Doc]:
    base = base_url()
    headers = {"User-Agent": "VortexianAssistantIndexer/1.0 (+knowledge base refresh)"}
    with httpx.Client(timeout=25, follow_redirects=True, headers=headers) as client:
        def fetch(path: str):
            try:
                res = client.get(base + path)
            except httpx.HTTPError:
                return path, None
            ok = res.status_code == 200 and "text/html" in res.headers.get("content-type", "")
            return path, res.text if ok else None

        with ThreadPoolExecutor(max_workers=4) as pool:
            pages = list(pool.map(fetch, page_paths(db)))

    home = dict(pages).get("/")
    if home is None:
        raise RuntimeError(f"The website could not be read at {base}/ — the knowledge base was left as it was.")

    docs = []
    for path, html in pages:
        if not html:
            continue
        title, body = extract(html, "main")
        title = title or path
        if len(body) >= 40:
            docs.append(Doc(key=path, url=path, title=title, text=body))
    # Contact details live in the site footer
    _, footer = extract(home, "footer")
    if footer:
        docs.append(Doc(key="contact-details", url="/contact", title="Contact details", text=footer))
    return docs


def chunks_of(doc: Doc) -> list[str]:
    paragraphs = [p.strip() for p in doc.text.split("\n") if p.strip()]
    out, current = [], ""
    for para in paragraphs:
        while len(para) > CHUNK_CHARS:                      # very long paragraph: hard split
            out.append(f"{doc.title}\n{(current + ' ' + para[:CHUNK_CHARS]).strip()}")
            current, para = "", para[CHUNK_CHARS - OVERLAP_CHARS:]
        if current and len(current) + len(para) + 1 > CHUNK_CHARS:
            out.append(f"{doc.title}\n{current}")
            tail = current[-OVERLAP_CHARS:]
            current = tail[tail.find(" ") + 1:] if " " in tail else ""
        current = f"{current}\n{para}".strip()
    if current:
        out.append(f"{doc.title}\n{current}")
    return out


# ================================================================ vector store (pgvector)

def ensure_store() -> tuple[bool, str]:
    if not is_postgres():
        return False, "The knowledge base needs PostgreSQL with the pgvector extension."
    with engine.begin() as conn:
        installed = conn.execute(text("SELECT 1 FROM pg_extension WHERE extname = 'vector'")).scalar()
    if not installed:
        try:
            with engine.begin() as conn:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        except Exception:
            return False, INSTALL_HELP
    with engine.begin() as conn:
        conn.execute(text(f"""
            CREATE TABLE IF NOT EXISTS {TABLE} (
                id BIGSERIAL PRIMARY KEY,
                doc_key TEXT NOT NULL,
                doc_hash TEXT NOT NULL,
                url TEXT NOT NULL,
                title TEXT NOT NULL,
                chunk_index INTEGER NOT NULL,
                content TEXT NOT NULL,
                model TEXT NOT NULL,
                embedding vector NOT NULL,
                updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
            )"""))
        conn.execute(text(f"CREATE INDEX IF NOT EXISTS ix_{TABLE}_doc_key ON {TABLE} (doc_key)"))
    return True, ""


def _vec(values: list[float]) -> str:
    return "[" + ",".join(f"{v:.6f}" for v in values) + "]"


def store_ready() -> bool:
    if not is_postgres():
        return False
    try:
        with engine.connect() as conn:
            return bool(conn.execute(text("SELECT to_regclass(:t)"), {"t": TABLE}).scalar())
    except Exception:
        return False


def page_title(path: str) -> str | None:
    """The title of a website page, from the knowledge base (None if unknown)."""
    if not path or not store_ready():
        return None
    try:
        with engine.connect() as conn:
            return conn.execute(text(f"SELECT title FROM {TABLE} WHERE url = :u LIMIT 1"), {"u": path[:300]}).scalar()
    except Exception:
        return None


def search(query: str, k: int = 5) -> list[dict]:
    """Most relevant chunks for a question: [{title, url, content, score}]."""
    query = (query or "").strip()
    if not query or not store_ready():
        return []
    emb = embedder()
    q = _vec(emb.embed_query(query[:2000]))
    with engine.connect() as conn:
        rows = conn.execute(text(f"""
            SELECT title, url, content, 1 - (embedding <=> CAST(:q AS vector)) AS score
            FROM {TABLE} WHERE model = :m
            ORDER BY embedding <=> CAST(:q AS vector) LIMIT :k"""), {"q": q, "m": emb.name, "k": k}).mappings().all()
    return [{**row, "score": round(float(row["score"]), 3)} for row in rows]


# ================================================================ refresh

_local_lock = threading.Lock()


def refresh(reason: str = "manual") -> dict:
    """Re-read the website and update the vectors. Returns the new state."""
    if not _local_lock.acquire(blocking=False):
        return {"status": "busy"}
    lock_conn = None
    try:
        if is_postgres():
            lock_conn = engine.connect()
            if not lock_conn.execute(text("SELECT pg_try_advisory_lock(:id)"), {"id": LOCK_ID}).scalar():
                lock_conn.rollback()
                return {"status": "busy"}
            lock_conn.commit()
        started = now()
        update_state(status="indexing", started_at=started, message=f"Reading the website ({reason})…")
        try:
            message = _refresh(started)
        except ProviderError as err:
            update_state(status="error", message=f"Embedding model problem: {err}")
        except Exception as err:   # the previous vectors stay in place and keep answering
            update_state(status="error", message=str(err)[:500])
        else:
            update_state(**message)
        with sessionlocal() as db:
            return state_dict(get_state(db))
    finally:
        if lock_conn is not None:
            try:
                lock_conn.execute(text("SELECT pg_advisory_unlock(:id)"), {"id": LOCK_ID})
                lock_conn.commit()
            finally:
                lock_conn.close()
        _local_lock.release()


def _refresh(started: datetime) -> dict:
    ok, message = ensure_store()
    if not ok:
        return {"status": "unavailable", "message": message}
    emb = embedder()
    with sessionlocal() as db:
        docs = collect_documents(db)
    for doc in docs:
        doc.hash = hashlib.sha256(json.dumps([emb.name, doc.title, doc.url, doc.text]).encode()).hexdigest()

    with engine.begin() as conn:
        conn.execute(text(f"DELETE FROM {TABLE} WHERE model <> :m"), {"m": emb.name})   # embedding model changed
        existing = dict(conn.execute(text(f"SELECT doc_key, MIN(doc_hash) FROM {TABLE} GROUP BY doc_key")).all())

    changed = [d for d in docs if existing.get(d.key) != d.hash]
    removed = set(existing) - {d.key for d in docs}
    for doc in changed:
        pieces = chunks_of(doc)
        vectors = emb.embed_documents(pieces)
        with engine.begin() as conn:
            conn.execute(text(f"DELETE FROM {TABLE} WHERE doc_key = :k"), {"k": doc.key})
            conn.execute(
                text(f"""INSERT INTO {TABLE} (doc_key, doc_hash, url, title, chunk_index, content, model, embedding)
                         VALUES (:k, :h, :u, :t, :i, :c, :m, CAST(:e AS vector))"""),
                [{"k": doc.key, "h": doc.hash, "u": doc.url, "t": doc.title, "i": i, "c": piece, "m": emb.name, "e": _vec(vec)}
                 for i, (piece, vec) in enumerate(zip(pieces, vectors))],
            )
    if removed:
        with engine.begin() as conn:
            conn.execute(text(f"DELETE FROM {TABLE} WHERE doc_key = ANY(:keys)"), {"keys": list(removed)})
    with engine.connect() as conn:
        total = conn.execute(text(f"SELECT COUNT(*) FROM {TABLE}")).scalar() or 0

    return {
        "status": "ready",
        "pages": len(docs),
        "chunks": total,
        "embedding_model": emb.name,
        "indexed_at": started,   # edits made while indexing trigger another refresh
        "message": f"{len(docs)} pages indexed: {len(changed)} new or changed, {len(removed)} removed, {len(docs) - len(changed)} unchanged.",
    }


def due(state: models.AIKnowledgeState) -> str | None:
    """Why the knowledge base should be refreshed now, if it should."""
    t = now()
    started, changed, indexed = aware(state.started_at), aware(state.changed_at), aware(state.indexed_at)
    if state.status == "indexing" and started and t - started < STALE_RUN:
        return None
    if state.status == "unavailable" and started and t - started < timedelta(minutes=10):
        return None    # re-check for pgvector every 10 minutes, not every loop
    if state.status == "error" and started and t - started < timedelta(minutes=5):
        return None
    if indexed is None:
        return "first build"
    if changed and changed > indexed and t - changed >= DEBOUNCE:
        return "website content changed"
    if t - indexed >= DAILY:
        return "daily refresh"
    return None


_scheduler_started = False


def start_scheduler(interval: float = 15.0) -> None:
    """Background thread (one per worker) that keeps the knowledge base current."""
    global _scheduler_started
    if _scheduler_started:
        return
    _scheduler_started = True

    def loop():
        time.sleep(10)   # let the app finish starting
        while True:
            try:
                with sessionlocal() as db:
                    reason = due(get_state(db))
                if reason:
                    refresh(reason)
            except Exception as err:
                print(f"Knowledge base scheduler: {err}")
            time.sleep(interval)

    threading.Thread(target=loop, name="kb-refresh", daemon=True).start()
