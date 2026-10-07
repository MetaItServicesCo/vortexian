import { SITE_URL } from "@/lib/api";

const SITE_HOST = new URL(SITE_URL).hostname.replace(/^www\./, "");

// Internal: relative paths, anchors, and absolute URLs on our own domain.
// mailto:/tel: are treated as internal so they never open a blank tab.
export function isInternalHref(href = "") {
    const value = href.trim();
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
export function linkAttributes(href) {
    return isInternalHref(href)
        ? { href, target: null, rel: null }
        : { href, target: "_blank", rel: "noopener noreferrer" };
}

// Fixes links in content saved before this rule existed (the editor used to add
// target="_blank" and rel="nofollow" to every link).
export function normalizeLinks(html) {
    if (!html || !html.includes("<a")) return html;
    return html.replace(/<a\b([^>]*)>/gi, (tag, attrs) => {
        const href = (attrs.match(/\shref="([^"]*)"/i) || [])[1] || "";
        const cleaned = attrs.replace(/\s(target|rel)="[^"]*"/gi, "");
        return isInternalHref(href)
            ? `<a${cleaned}>`
            : `<a${cleaned} target="_blank" rel="noopener noreferrer">`;
    });
}
