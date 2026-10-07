// Public site origin, used for canonical URLs and Open Graph metadata.
export const SITE_URL = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://vortexiantech.com"
).replace(/\/+$/, "");

// Base URL for server-side fetches (Server Components, generateMetadata).
// Relative URLs don't work on the server, so this must be absolute. In Docker,
// set API_INTERNAL_URL=http://backend:8000 to skip the round trip through the
// public internet.
export const SERVER_API_URL = (
    process.env.API_INTERNAL_URL || SITE_URL
).replace(/\/+$/, "");

export function serverApiUrl(path) {
    return `${SERVER_API_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

// Normalise a stored media path (e.g. "/uploads/x.png", legacy "uploads/x.png"
// or a full URL) into something a browser can load from any page.
export function mediaUrl(path, fallback = "") {
    if (!path) return fallback;
    if (/^https?:\/\//i.test(path)) return path;
    return `/${path.replace(/^\/+/, "")}`;
}
