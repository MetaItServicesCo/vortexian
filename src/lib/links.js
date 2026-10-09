import { SITE_URL } from "@/lib/api";

const SITE_HOST = new URL(SITE_URL).hostname.replace(/^www\./, "");

// A bare domain such as "www.mbmts.com" or "mbmts.com/about" (optional port/path)
const BARE_DOMAIN = /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}(?::\d+)?(?:[/?#].*)?$/i;
const EMAIL = /^[^\s@/:]+@[^\s@/]+\.[a-z]{2,}$/i;
const SCHEME = /^[a-z][a-z0-9+.-]*:/i;
const SAFE_SCHEME = /^(https?|mailto|tel):/i;

// Turns what an editor typed into a working link. Without this, "www.mbmts.com"
// is a *relative* link and opens /blog/www.mbmts.com. Mirrors
// normalize_href() in backend/app/sanitize.py.
//   www.mbmts.com          -> https://www.mbmts.com
//   info@company.com       -> mailto:info@company.com
//   services/web           -> /services/web
//   https://<our domain>/x -> /x   (stays an internal link)
//   javascript:…           -> ""   (rejected)
export function normalizeHref(input = "") {
    const value = String(input).trim();
    if (!value) return "";
    if (/^(#|\?)/.test(value)) return value;
    if (value.startsWith("//")) return toRelativeIfOurs(`https:${value}`);
    if (value.startsWith("/")) return value;
    if (BARE_DOMAIN.test(value)) return toRelativeIfOurs(`https://${value}`);
    if (EMAIL.test(value)) return `mailto:${value}`;
    if (SCHEME.test(value)) return SAFE_SCHEME.test(value) ? toRelativeIfOurs(value) : "";
    return `/${value.replace(/^\.?\/+/, "")}`; // "services/web" is a page on this site
}

function toRelativeIfOurs(url) {
    if (!/^https?:/i.test(url)) return url;
    try {
        const parsed = new URL(url);
        return parsed.hostname.replace(/^www\./, "") === SITE_HOST ? `${parsed.pathname}${parsed.search}${parsed.hash}` || "/" : url;
    } catch {
        return url;
    }
}

// Internal: relative paths, anchors, and absolute URLs on our own domain.
// mailto:/tel: are treated as internal so they never open a blank tab.
export function isInternalHref(href = "") {
    const value = normalizeHref(href);
    if (!value) return true;
    if (value.startsWith("//")) return hostIsOurs(`https:${value}`);
    if (/^(\/|#|\?|mailto:|tel:)/i.test(value)) return true;
    if (!/^[a-z][a-z0-9+.-]*:/i.test(value)) return true; // e.g. "services/web"
    return hostIsOurs(value);
}

function hostIsOurs(url) {
    try {
        return new URL(url).hostname.replace(/^www\./, "") === SITE_HOST;
    } catch {
        return false;
    }
}

// Link attributes for the editor: internal links stay in the same tab and are
// followed by search engines; external links open safely in a new tab.
export function linkAttributes(rawHref) {
    const href = normalizeHref(rawHref);
    return isInternalHref(href)
        ? { href, target: null, rel: null }
        : { href, target: "_blank", rel: "noopener noreferrer" };
}

// Fixes links in content saved before these rules existed: the editor used to
// add target="_blank" and rel="nofollow" to every link, and stored bare
// domains ("www.mbmts.com") as relative links. Already-published posts are
// repaired when shown, without re-saving them.
export function normalizeLinks(html) {
    if (!html || !html.includes("<a")) return html;
    return html.replace(/<a\b([^>]*)>/gi, (tag, attrs) => {
        const rawHref = (attrs.match(/\shref="([^"]*)"/i) || [])[1];
        const href = rawHref === undefined ? "" : normalizeHref(rawHref.replace(/&amp;/g, "&"));
        let cleaned = attrs.replace(/\s(target|rel)="[^"]*"/gi, "");
        if (rawHref !== undefined) cleaned = cleaned.replace(/\shref="[^"]*"/i, href ? ` href="${href.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"` : "");
        return isInternalHref(href)
            ? `<a${cleaned}>`
            : `<a${cleaned} target="_blank" rel="noopener noreferrer">`;
    });
}
