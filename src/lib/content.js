import { cache } from "react";
import { serverApiUrl } from "@/lib/api";
import { resolveAll } from "@/content/registry";

export async function getJson(path, fallback) {
    try {
        const res = await fetch(serverApiUrl(path), { cache: "no-store" });
        if (!res.ok) return fallback;
        return await res.json();
    } catch {
        // API down: the site still renders with built-in defaults
        return fallback;
    }
}

// cache() dedupes these within one request (layout + page + generateMetadata)
export const getSiteContent = cache(async () => resolveAll(await getJson("/api/content/", {})));

export const getFooterPages = cache(async () => {
    const pages = await getJson("/api/pages/footer", []);
    return Array.isArray(pages) ? pages : [];
});

// Route handlers (sitemap.xml, robots.txt, llms.txt) must not use React's
// cache(): it is meant for one render and kept serving settings from an
// earlier request there. Always fetch fresh in route handlers.
export async function getFreshSiteContent() {
    return resolveAll(await getJson("/api/content/", {}));
}

export const getMenuServices = cache(async () => {
    const services = await getJson("/api/services/menu", []);
    return Array.isArray(services) ? services : [];
});

export async function getSection(key) {
    return (await getSiteContent())[key];
}

// generateMetadata helper for built-in pages with a "page.<name>" section
export async function pageMetadata(key, path) {
    const page = await getSection(key);
    return {
        title: page.meta_title,
        description: page.meta_description,
        alternates: { canonical: path },
        openGraph: { title: page.meta_title, description: page.meta_description, url: path },
    };
}
