"use client";

// Small fetch wrapper for admin dashboard calls: adds the bearer token and
// turns FastAPI error payloads into readable messages.

export function getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
}

export function errorMessage(data, fallback = "Request failed") {
    const detail = data?.detail;
    if (Array.isArray(detail)) {
        return detail
            .map((d) => `${(d.loc || []).filter((p) => p !== "body").join(".")}: ${d.msg}`)
            .join(", ");
    }
    return detail || data?.message || fallback;
}

export async function adminFetch(path, { method = "GET", body, headers = {} } = {}) {
    const isForm = typeof FormData !== "undefined" && body instanceof FormData;

    const res = await fetch(path, {
        method,
        headers: {
            Authorization: `Bearer ${getToken()}`,
            ...(body && !isForm ? { "Content-Type": "application/json" } : {}),
            ...headers,
        },
        body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
    }
    if (!res.ok) throw new Error(errorMessage(data, `Request failed (${res.status})`));

    return data;
}

export async function uploadMedia(file) {
    const form = new FormData();
    form.append("file", file);
    const data = await adminFetch("/api/media/upload", { method: "POST", body: form });
    return data.url;
}
