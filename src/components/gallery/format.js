// "2026-03-14" -> "14 March 2026"
export function formatEventDate(value) {
    if (!value) return "";
    const d = new Date(`${value}T00:00:00Z`);
    return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
