const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

const authHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

// ───────────────────────────────────────────────
// Error handling
// ───────────────────────────────────────────────

/**
 * Carries the HTTP status + raw body so callers can react to specific
 * failures (404 = nothing published yet, 401 = token expired, etc.)
 * instead of only seeing a string.
 */
export class ApiError extends Error {
    constructor(message, status, payload, raw = "", url = "") {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.payload = payload;
        this.raw = raw; // exact bytes the server sent — nothing lost to serialization
        this.url = url;
    }
}

/**
 * FastAPI's `detail` arrives in three different shapes:
 *   422 -> detail: [{ loc: [...], msg: "field required", type: "..." }]  (array)
 *   4xx -> detail: "Not authenticated"                                   (string)
 *   5xx -> detail: { message: "..." }                                    (object)
 *
 * `new Error(someObject)` stringifies to "[object Object]" — that was the
 * original bug: the real message existed, it was just being flattened away.
 */
const parseDetail = (detail, fallback) => {
    if (detail === undefined || detail === null || detail === "") return fallback;

    if (typeof detail === "string") return detail;

    if (Array.isArray(detail)) {
        const parts = detail.map((item) => {
            if (typeof item === "string") return item;
            const field = Array.isArray(item?.loc)
                ? item.loc.filter((p) => p !== "body" && p !== "query").join(".")
                : "";
            const msg = item?.msg || item?.message || JSON.stringify(item);
            return field ? `${field}: ${msg}` : msg;
        });
        return parts.filter(Boolean).join(" | ") || fallback;
    }

    if (typeof detail === "object") {
        return detail.msg || detail.message || detail.error || JSON.stringify(detail);
    }

    return String(detail);
};

const handleRes = async (res) => {
    if (res.ok) {
        // 204 / empty bodies would throw "Unexpected end of JSON input" on res.json()
        if (res.status === 204) return null;
        return res.json().catch(() => null);
    }

    // The body isn't always JSON: HTML error pages, proxy errors, empty bodies.
    const raw = await res.text().catch(() => "");
    let body = null;

    if (raw) {
        try {
            body = JSON.parse(raw);
        } catch {
            body = { detail: raw.slice(0, 300) };
        }
    }

    const message = parseDetail(
        body?.detail,
        `Request failed: ${res.status} ${res.statusText || ""}`.trim()
    );

    if (process.env.NODE_ENV !== "production") {
        // Logged as ONE string on purpose: Next.js's dev overlay flattens object
        // arguments to "{}", which hides the payload the server actually sent.
        // console.warn also keeps this out of the red error overlay.
        console.warn(`[API ${res.status}] ${res.url}\n${raw || "(empty body)"}`);
    }

    throw new ApiError(message, res.status, body, raw, res.url);
};

// ───────────────────────────────────────────────
// Public endpoints
// ───────────────────────────────────────────────

export const subscribeToNewsletter = (email, name) =>
    fetch(`${API_URL}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
    }).then(handleRes);

export const getSignupForm = () =>
    fetch(`${API_URL}/api/newsletter/signup-form`).then(handleRes);

export const getBlogSetting = () =>
    fetch(`${API_URL}/api/newsletter/blog-setting`).then(handleRes);

// ───────────────────────────────────────────────
// Protected endpoints (require Bearer token)
// ───────────────────────────────────────────────

// -- Subscribers (Newsletter model: id, name, email, status, subscribed_at) --
export const getSubscribers = () =>
    fetch(`${API_URL}/api/newsletter/subscribers`, { headers: authHeaders() }).then(handleRes);

export const searchSubscribers = (query) =>
    fetch(`${API_URL}/api/newsletter/subscribers/search?q=${encodeURIComponent(query)}`, {
        headers: authHeaders(),
    }).then(handleRes);

export const deleteSubscriber = (subscriberId) =>
    fetch(`${API_URL}/api/newsletter/subscribers/${subscriberId}`, {
        method: "DELETE",
        headers: authHeaders(),
    }).then(handleRes);

export const exportSubscribersCsv = async () => {
    const res = await fetch(`${API_URL}/api/newsletter/export`, { headers: authHeaders() });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new ApiError(text || `Export failed (${res.status})`, res.status, null);
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscribers.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
};

// -- Campaign (NewsletterCampaign model: subject, body, audience_type,
//    subscriber_ids, template_id, status, scheduled_for, recipient_count,
//    sent_at, blog_url, auto_send) --
export const createCampaign = (payload) =>
    fetch(`${API_URL}/api/newsletter/campaign`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
    }).then(handleRes);

export const sendCampaignNow = (campaignId) =>
    fetch(`${API_URL}/api/newsletter/campaign/${campaignId}/send`, {
        method: "POST",
        headers: authHeaders(),
    }).then(handleRes);

// send-test requires `email` on the body (that was the 422)
export const sendTestEmail = (payload) =>
    fetch(`${API_URL}/api/newsletter/send-test`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
    }).then(handleRes);

export const getRecipientsCount = (audienceType, subscriberIds = []) => {
    const params = new URLSearchParams({ audience_type: audienceType });
    if (subscriberIds.length) params.append("subscriber_ids", subscriberIds.join(","));
    return fetch(`${API_URL}/api/newsletter/recipients-count?${params.toString()}`, {
        headers: authHeaders(),
    }).then(handleRes);
};

// -- History --
export const getHistory = () =>
    fetch(`${API_URL}/api/newsletter/history`, { headers: authHeaders() }).then(handleRes);

// -- Templates (NewsletterTemplate model: title, subject, body, category) --
export const getTemplates = () =>
    fetch(`${API_URL}/api/newsletter/templates`, { headers: authHeaders() }).then(handleRes);

export const createTemplate = (payload) =>
    fetch(`${API_URL}/api/newsletter/templates`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
    }).then(handleRes);

// -- Blog Integration (NewsletterBlogSetting model: enabled, template_id) --
export const getBlogPreview = () =>
    fetch(`${API_URL}/api/newsletter/blog-preview`, { headers: authHeaders() }).then(handleRes);

export const updateBlogSetting = (enabled) =>
    fetch(`${API_URL}/api/newsletter/blog-setting`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ enabled }),
    }).then(handleRes);

// NOTE: /parse-blog is NOT in your current Swagger. The store used to fetch it
// with undefined helpers (authHeaders/handleRes), which would ReferenceError.
// This keeps the call in the API layer so it fails gracefully (a 404) instead
// of crashing. Add the backend route if you actually need blog-URL parsing.
export const parseBlogUrl = (url) =>
    fetch(`${API_URL}/api/newsletter/parse-blog?url=${encodeURIComponent(url)}`, {
        headers: authHeaders(),
    }).then(handleRes);

// -- Signup Form (NewsletterSignupSettings model: heading, intro, bullets, button_text) --
export const updateSignupForm = (payload) =>
    fetch(`${API_URL}/api/newsletter/signup-form`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(payload),
    }).then(handleRes);