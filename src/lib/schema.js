// Schema markup (JSON-LD) for the website: site-wide blocks, built-in pages and
// individual items (blog posts, services, custom pages, portfolio projects).
// Settings: Dashboard → SEO & Tracking → Schema markup, and each editor's
// "Schema markup" box.
import { SITE_URL } from "@/lib/api";

export const absoluteUrl = (path) => (!path ? "" : /^https?:\/\//i.test(path) ? path : `${SITE_URL}/${String(path).replace(/^\/+/, "")}`);

const SITE_KEYS = ["site_name", "site_url", "logo", "email", "phone", "phone_secondary", "address", "facebook", "linkedin", "instagram", "twitter", "youtube", "pinterest"];
const ITEM_KEYS = ["title", "description", "url", "image", "author", "category", "year"];
export const SCHEMA_PLACEHOLDERS = SITE_KEYS;
export const ITEM_PLACEHOLDERS = ITEM_KEYS;

export function siteValues(settings = {}) {
    return {
        ...Object.fromEntries(SITE_KEYS.map((k) => [k, settings[k] || ""])),
        site_url: SITE_URL,
        logo: absoluteUrl(settings.logo),
        email: settings.enquiries_email || settings.email || "",
    };
}

const plain = (text, max = 300) => {
    const t = String(text || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
};

// {{placeholders}} in string values; values that end up empty are dropped
export function fillPlaceholders(node, values) {
    if (typeof node === "string") return node.replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (match, key) => (key in values ? String(values[key] ?? "").trim() : match));
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

export function parseJson(text) {
    try {
        const parsed = JSON.parse(text || "");
        return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
        return null;
    }
}

// Safe for <script type="application/ld+json">: "<" can't close the tag
export const toJsonLd = (obj) => JSON.stringify(obj).replace(/</g, "\\u003c");

// ---------------------------------------------------------------- item values
export function itemValues(kind, item = {}, path = "") {
    switch (kind) {
        case "blog":
            return { title: item.title, description: item.meta_description || item.excerpt, url: absoluteUrl(path), image: absoluteUrl(item.featured_image), author: item.author, category: item.category };
        case "service":
            return { title: item.service_title, description: item.short_description || item.meta_description, url: absoluteUrl(path), image: absoluteUrl(item.image_showcase_url), category: item.category_stack };
        case "portfolio":
            return { title: item.project_title, description: item.meta_description || plain(item.business_challenge), url: absoluteUrl(path), image: absoluteUrl(item.primary_image), category: item.category_node, year: item.deployment_year };
        case "page":
        default:
            return { title: item.title || item.hero_title || item.meta_title, description: item.meta_description, url: absoluteUrl(path) };
    }
}

// ---------------------------------------------------------------- automatic markup
const organization = (site) => ({ "@type": "Organization", name: site.site_name, url: site.site_url, ...(site.logo ? { logo: site.logo } : {}) });

export function automaticSchema(kind, item, path, settings) {
    const site = siteValues(settings);
    const v = itemValues(kind, item, path);
    if (kind === "blog") {
        return {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: v.title,
            description: plain(v.description, 300),
            ...(v.image ? { image: [v.image] } : {}),
            ...(v.author ? { author: { "@type": "Person", name: v.author } } : {}),
            publisher: organization(site),
            ...(v.category ? { articleSection: v.category } : {}),
            mainEntityOfPage: { "@type": "WebPage", "@id": v.url },
            url: v.url,
        };
    }
    if (kind === "service") {
        return {
            "@context": "https://schema.org",
            "@type": "Service",
            name: v.title,
            description: plain(v.description, 300),
            ...(v.image ? { image: v.image } : {}),
            ...(v.category ? { serviceType: v.category } : {}),
            provider: organization(site),
            url: v.url,
        };
    }
    return null;
}

/**
 * JSON-LD strings for one page.
 * custom: the admin's own markup (replaces the automatic one when valid)
 * auto: whether automatic markup is on for this kind (SEO & Tracking switches)
 */
export function pageSchemas({ kind, item = {}, path, settings, custom, auto }) {
    const values = { ...siteValues(settings), ...itemValues(kind, item, path) };
    const own = parseJson(custom);
    if (own) return [toJsonLd(fillPlaceholders(own, values))];
    if (auto) {
        const generated = automaticSchema(kind, item, path, settings);
        if (generated) return [toJsonLd(fillPlaceholders(generated, values))];
    }
    return [];
}

// Site-wide blocks (every page)
export function siteSchemas(seoSchema, settings) {
    if (!seoSchema?.enabled) return [];
    const values = siteValues(settings);
    return (seoSchema.blocks || [])
        .map((block) => parseJson(block?.json))
        .filter(Boolean)
        .map((obj) => toJsonLd(fillPlaceholders(obj, values)));
}

// ---------------------------------------------------------------- editor templates
export const SCHEMA_TEMPLATES = {
    blog: { "@context": "https://schema.org", "@type": "BlogPosting", headline: "{{title}}", description: "{{description}}", image: "{{image}}", author: { "@type": "Person", name: "{{author}}" }, publisher: { "@type": "Organization", name: "{{site_name}}", logo: "{{logo}}" }, mainEntityOfPage: "{{url}}" },
    service: { "@context": "https://schema.org", "@type": "Service", name: "{{title}}", description: "{{description}}", image: "{{image}}", serviceType: "{{category}}", provider: { "@type": "Organization", name: "{{site_name}}", url: "{{site_url}}" }, areaServed: "Worldwide", url: "{{url}}" },
    page: { "@context": "https://schema.org", "@type": "WebPage", name: "{{title}}", description: "{{description}}", url: "{{url}}", isPartOf: { "@type": "WebSite", name: "{{site_name}}", url: "{{site_url}}" } },
    portfolio: { "@context": "https://schema.org", "@type": "CreativeWork", name: "{{title}}", description: "{{description}}", image: "{{image}}", genre: "{{category}}", dateCreated: "{{year}}", creator: { "@type": "Organization", name: "{{site_name}}" }, url: "{{url}}" },
};
export const templateText = (kind) => JSON.stringify(SCHEMA_TEMPLATES[kind] || SCHEMA_TEMPLATES.page, null, 2);
