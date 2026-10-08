// Shared by the admin news form and the public feed

export const NEWS_TYPES = [
    { value: "announcement", label: "Announcement", badge: "bg-emerald-50 text-emerald-700", icon: "Megaphone" },
    { value: "news", label: "News", badge: "bg-sky-50 text-sky-700", icon: "Newspaper" },
    { value: "event", label: "Event", badge: "bg-purple-50 text-purple-700", icon: "CalendarDays" },
    { value: "award", label: "Award", badge: "bg-amber-50 text-amber-700", icon: "Trophy" },
    { value: "new_hire", label: "New Hire", badge: "bg-blue-50 text-blue-700", icon: "UserPlus" },
    { value: "holiday", label: "Holiday", badge: "bg-rose-50 text-rose-700", icon: "PartyPopper" },
    { value: "general", label: "Update", badge: "bg-slate-100 text-slate-700", icon: "Bell" },
];

const FALLBACK = NEWS_TYPES[NEWS_TYPES.length - 1];

// Older posts may hold free-text types such as "Announcement" or "new hire"
export function newsType(value) {
    const key = (value || "").trim().toLowerCase().replace(/\s+/g, "_");
    return NEWS_TYPES.find((t) => t.value === key) || { ...FALLBACK, label: value ? value : FALLBACK.label };
}

// "2026-10-08" or an ISO timestamp -> "8 Oct 2026"; anything else is shown as written
export function formatNewsDate(value) {
    if (!value) return "";
    const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// Plain-text preview of rich text
export function newsExcerpt(html, length = 140) {
    const text = (html || "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, " ")
        .trim();
    return text.length > length ? `${text.slice(0, length).replace(/\s+\S*$/, "")}…` : text;
}

export const isVideo = (url) => /\.(mp4|webm|mov)$/i.test(url || "");
