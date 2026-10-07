# Vortexian Tech

Company website and admin dashboard for [vortexiantech.com](https://vortexiantech.com).

| Part | Stack | Location |
| --- | --- | --- |
| Frontend | Next.js 16 (App Router), React 19, Tailwind 4 | `src/` |
| Backend API | FastAPI, SQLAlchemy 2, PostgreSQL | `backend/` |
| Deployment | Docker Compose behind host nginx | `docker-compose.yml`, `deploy.sh`, `nginx-host.conf` |

The browser only ever talks to Next.js. Next proxies `/api/*` and `/uploads/*` to
FastAPI (see `next.config.mjs`). Server Components call the API directly using
`serverApiUrl()` from `src/lib/api.js`.

## Local development

**Backend** (Python 3.12):

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env        # fill in; DATABASE_URL can be sqlite:///./dev.db locally
uvicorn app.main:app --reload --port 8000
```

API docs: http://127.0.0.1:8000/docs

**Frontend:**

```bash
npm install
BACKEND_URL=http://127.0.0.1:8000 API_INTERNAL_URL=http://127.0.0.1:8000 npm run dev
```

Open http://localhost:3000. Create the first admin at `/register` using `ADMIN_SECRET_KEY`.

## Environment variables

All documented in [`.env.example`](.env.example). The non-obvious ones:

- `BACKEND_URL`: where Next proxies `/api` and `/uploads`. Read at **build time**
  (rewrites are compiled into the build). Defaults to `http://backend:8000`.
- `API_INTERNAL_URL`: base URL for server-side fetches. Defaults to
  `NEXT_PUBLIC_SITE_URL`. Docker sets it to `http://backend:8000`.
- `ENABLE_NEWSLETTER_SCHEDULER`: off by default. The job runs once per uvicorn
  worker, so only enable it with a single worker.

## Deployment

```bash
cp .env.example .env   # fill in real secrets
./deploy.sh
```

Then follow the nginx and certbot steps the script prints. The backend port is
bound to `127.0.0.1:8001` for debugging only. Public traffic goes nginx → frontend.

Uploaded files persist in `./uploads` on the host.

## Content management

Admins edit the site from the dashboard without code changes:

| Dashboard section | What it controls | Stored in |
| --- | --- | --- |
| **Basic Info** | Company name, logo, emails, phone, WhatsApp, address, office hours, social links, default SEO | `SiteContent` key `settings` |
| **Site Content** | Every text/image block on every page, header menu, footer, page banners, per-page SEO, show/hide per section | `SiteContent`, one key per section |
| **Pages** | Standalone pages (privacy policy, terms, …) served at `/<slug>`, optionally listed in the footer | `Page` table |

How it fits together:

- [`src/content/registry.js`](src/content/registry.js) declares every editable section: its form
  fields and its **default content**. The site shows the defaults until an admin saves changes,
  and saved values are merged over them, so adding a field is backwards-compatible.
- The public layout loads all content once per request (`src/lib/content.js`) and exposes it
  through `useContent(key)` / `useSettings()`.
- The admin form at `/dashboard/content/<key>` is generated from the registry. No per-section
  admin code needed.

**To make a new block editable:** add an entry (or field) to the registry with defaults, then
read it in the component with `useContent("<key>")`. Rich text field names must end in `_html`
(the API sanitises those).

### Rich text editor

`src/components/editor/RichTextEditor.jsx` (TipTap) is used for blog posts, news feed, service
descriptions, custom pages and rich text content fields. It supports headings, lists, links,
alignment, image/video upload and tables. Tables pasted from Word, Excel, Google Docs/Sheets or
web pages stay tables; tab-separated text is converted too.

Rich text HTML is sanitised server-side on save (`backend/app/sanitize.py`).

## Uploads

All file uploads go through `backend/app/uploads.py`, which enforces an extension
allowlist and size limits, stores files under random names, and cleans up
replaced/deleted files. Use it for any new upload field.

## Notes

- Tables are created at startup via `Base.metadata.create_all`. The single Alembic
  migration does not cover `NewsFeed`, `career_applications`, `Testimonial`, `SiteContent` or `Page`;
  generate a new migration before relying on Alembic for schema changes.
- Admin auth: JWT in `localStorage`, validated by `AdminGuard` on every
  dashboard page. The API enforces auth independently.
