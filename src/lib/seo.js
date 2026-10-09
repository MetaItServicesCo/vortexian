// Server-side builders for SEO & Tracking (settings live in Dashboard → SEO & Tracking).
import { SITE_URL } from "@/lib/api";
import { blogPath } from "@/lib/blog";
import { getFreshSiteContent, getJson } from "@/lib/content";

// ---------------------------------------------------------------- tracking
// IDs end up inside <script>, so only the documented formats are used.
export const safeGaId = (id) => (/^G-[A-Z0-9]{4,20}$/.test(String(id || "").trim().toUpperCase()) ? String(id).trim().toUpperCase() : null);
export const safeClarityId = (id) => (/^[a-z0-9]{6,20}$/.test(String(id || "").trim().toLowerCase()) ? String(id).trim().toLowerCase() : null);

// ---------------------------------------------------------------- schema
// Schema blocks may use {{placeholders}} filled from Basic Info, so contact
// details stay in sync when they change there. Values that end up empty are
// dropped (e.g. an unused social link in "sameAs").
export const SCHEMA_PLACEHOLDERS = ["site_name", "site_url", "logo", "email", "phone", "phone_secondary", "address", "facebook", "linkedin", "instagram", "twitter", "youtube", "pinterest"];

const absoluteUrl = (path) => (!path ? "" : /^https?:\/\//i.test(path) ? path : `${SITE_URL}/${String(path).replace(/^\/+/, "")}`);

function placeholderValues(settings = {}) {
    return {
        ...Object.fromEntries(SCHEMA_PLACEHOLDERS.map((k) => [k, settings[k] || ""])),
        site_url: SITE_URL,
        logo: absoluteUrl(settings.logo),
        email: settings.enquiries_email || settings.email || "",
    };
}

function fillPlaceholders(node, values) {
    if (typeof node === "string") return node.replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (match, key) => (key in values ? String(values[key]).trim() : match));
    if (Array.isArray(node)) return node.map((item) => fillPlaceholders(item, values)).filter((item) => item !== "");
    if (node && typeof node === "object") {
        const out = {};
        for (const [key, value] of Object.entries(node)) {
            const filled = fillPlaceholders(value, values);
            if (filled !== "" && !(Array.isArray(filled) && filled.length === 0 && Array.isArray(value) && value.length > 0)) out[key] = filled;
        }
        return out;
    }
    return node;
}

// Valid blocks only (a broken block is skipped, never breaks the page);
// "<" is escaped so the JSON can't close the <script> tag.
export function schemaScripts(seoSchema, settings) {
    if (!seoSchema?.enabled) return [];
    const values = placeholderValues(settings);
    return (seoSchema.blocks || [])
        .map((block) => {
            try {
                const parsed = JSON.parse(block?.json || "");
                if (!parsed || typeof parsed !== "object") return null;
                return JSON.stringify(fillPlaceholders(parsed, values)).replace(/</g, "\\u003c");
            } catch {
                return null;
            }
        })
        .filter(Boolean);
}

// ---------------------------------------------------------------- sitemap
const STATIC_PAGES = [
    { path: "/", priority: 1.0 },
    { path: "/services", priority: 0.9 },
    { path: "/about", priority: 0.8 },
    { path: "/portfolio", priority: 0.8 },
    { path: "/blog", priority: 0.8 },
    { path: "/career", priority: 0.7 },
    { path: "/contact", priority: 0.7 },
    { path: "/news", priority: 0.6 },
];

const lines = (text) => String(text || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
const absolute = (path) => `${SITE_URL}${path === "/" ? "/" : path}`;

function toSitePath(entry) {
    // Extra URLs may be paths or absolute URLs on this site; other domains are ignored
    if (entry.startsWith("/")) return entry;
    try {
        const url = new URL(entry);
        return url.origin === new URL(SITE_URL).origin ? url.pathname + url.search : null;
    } catch {
        return null;
    }
}

function excluded(path, rules) {
    return rules.some((rule) => (rule.endsWith("*") ? path.startsWith(rule.slice(0, -1)) : path === rule.replace(/\/+$/, "") || path === rule));
}

export async function sitemapEntries(settings) {
    const [services, blogs, projects, pages] = await Promise.all([
        settings.include_services ? getJson("/api/services/", []) : [],
        settings.include_blog ? getJson("/api/blog/public", []) : [],
        settings.include_portfolio ? getJson("/api/portfolio/", []) : [],
        settings.include_pages ? getJson("/api/pages/published", []) : [],
    ]);
    const list = (v) => (Array.isArray(v) ? v : []);

    const entries = [
        ...STATIC_PAGES,
        ...list(services).filter((s) => s.url_slug).map((s) => ({ path: `/services/${encodeURIComponent(s.url_slug)}`, priority: 0.8 })),
        ...list(blogs).map((b) => ({ path: blogPath(b), priority: 0.7 })),
        ...list(projects).map((p) => ({ path: `/portfolio/${p.id}`, priority: 0.6 })),
        ...list(pages).map((p) => ({ path: `/${p.slug}`, priority: 0.4, lastModified: p.updated_at })),
        ...lines(settings.extra_urls).map(toSitePath).filter(Boolean).map((path) => ({ path, priority: 0.5 })),
    ];

    const rules = lines(settings.exclude_paths).map((r) => toSitePath(r) || r);
    const seen = new Set();
    return entries.filter((e) => {
        if (seen.has(e.path) || excluded(e.path, rules)) return false;
        seen.add(e.path);
        return true;
    });
}

const xmlEscape = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export function sitemapXml(entries) {
    const urls = entries.map((e) => {
        const lastmod = e.lastModified ? `\n    <lastmod>${new Date(e.lastModified).toISOString()}</lastmod>` : "";
        return `  <url>\n    <loc>${xmlEscape(absolute(e.path))}</loc>${lastmod}\n    <priority>${e.priority.toFixed(1)}</priority>\n  </url>`;
    });
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

// ---------------------------------------------------------------- robots.txt
export function recommendedRobots(sitemapEnabled) {
    return [
        "User-agent: *",
        "Allow: /",
        "Disallow: /dashboard",
        "Disallow: /login",
        "Disallow: /register",
        "Disallow: /api/",
        ...(sitemapEnabled ? ["", `Sitemap: ${SITE_URL}/sitemap.xml`] : []),
        "",
    ].join("\n");
}

// ---------------------------------------------------------------- llms.txt
const oneLine = (text, max = 200) => {
    const clean = String(text || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
};

export async function recommendedLlms(content) {
    content = content || (await getFreshSiteContent());
    const s = content.settings;
    const [services, blogs] = await Promise.all([getJson("/api/services/", []), getJson("/api/blog/public", [])]);
    const page = (key) => content[key] || {};

    const link = (title, path, description) => `- [${title}](${absolute(path)})${description ? `: ${oneLine(description)}` : ""}`;
    const out = [
        `# ${s.site_name}`,
        "",
        `> ${oneLine(s.meta_description, 300)}`,
        "",
        "## Main pages",
        link("Home", "/", s.meta_title),
        link("Services", "/services", page("page.services").meta_description),
        link("About", "/about", page("page.about").meta_description),
        link("Portfolio", "/portfolio", page("page.portfolio").meta_description),
        link("Blog", "/blog", page("page.blog").meta_description),
        link("News & Updates", "/news", page("page.news").meta_description),
        link("Career", "/career", page("page.career").meta_description),
        link("Contact", "/contact", page("page.contact").meta_description),
    ];

    const serviceList = (Array.isArray(services) ? services : []).filter((x) => x.url_slug);
    if (serviceList.length) {
        out.push("", "## Services", ...serviceList.map((x) => link(x.service_title, `/services/${encodeURIComponent(x.url_slug)}`, x.short_description || x.meta_description)));
    }
    const blogList = (Array.isArray(blogs) ? blogs : []).slice(0, 20);
    if (blogList.length) {
        out.push("", "## Latest blog posts", ...blogList.map((b) => link(b.title, blogPath(b), b.excerpt || b.meta_description)));
    }

    const contact = [
        s.enquiries_email || s.email ? `- Email: ${s.enquiries_email || s.email}` : null,
        s.phone ? `- Phone: ${s.phone}` : null,
        s.address ? `- Address: ${oneLine(s.address)}` : null,
        s.office_hours ? `- Office hours: ${s.office_hours}` : null,
    ].filter(Boolean);
    if (contact.length) out.push("", "## Contact", ...contact);

    return out.join("\n") + "\n";
}

export const textResponse = (body, type = "text/plain; charset=utf-8") =>
    new Response(body, { headers: { "Content-Type": type, "Cache-Control": "public, max-age=60" } });
