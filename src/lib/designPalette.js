// Colours the admin can give to cards and page sections (Dashboard → services → Page sections,
// and cards inside rich text). Named colours are the site's palette; any custom #hex works too.
// Text on a colour is chosen automatically (white on dark colours), so content stays readable.
// Keep names in sync with backend/app/service_layout.py (COLOR_NAMES) and globals.css (.rc-c-*).

export const PALETTE = [
    { name: "cyan", label: "Soft cyan", bg: "#EAF6FB" },
    { name: "indigo", label: "Soft navy", bg: "#EEEEFB" },
    { name: "lavender", label: "Lavender", bg: "#F3EDFB" },
    { name: "mint", label: "Mint", bg: "#E8F7EF" },
    { name: "peach", label: "Peach", bg: "#FFF1E6" },
    { name: "rose", label: "Rose", bg: "#FDECEF" },
    { name: "sand", label: "Sand", bg: "#FBF6E9" },
    { name: "slate", label: "Light grey", bg: "#F1F5F9" },
    { name: "white", label: "White", bg: "#FFFFFF" },
    { name: "sky", label: "Cyan", bg: "#5DB4D1" },
    { name: "navy", label: "Navy", bg: "#1D1D7E", dark: true },
    { name: "purple", label: "Purple", bg: "#43165b", dark: true },
    { name: "midnight", label: "Midnight", bg: "#0b0b2e", dark: true },
    { name: "gradient", label: "Navy → purple", bg: "linear-gradient(135deg, #1D1D7E 0%, #2b2b9e 45%, #43165b 100%)", dark: true },
];

export const BY_NAME = Object.fromEntries(PALETTE.map((c) => [c.name, c]));
export const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

// True when white text reads better than dark text on this colour (higher WCAG contrast)
export function isDarkHex(hex) {
    let h = hex.replace("#", "");
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
        .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return 1.05 / (L + 0.05) > (L + 0.05) / 0.054;   // contrast with white vs with #0b0b2e
}

// "cyan" | "#ff8800" | "" -> { background, dark } (null when not set / "auto")
export function resolveColor(value) {
    if (!value || value === "auto") return null;
    if (BY_NAME[value]) return { background: BY_NAME[value].bg, dark: Boolean(BY_NAME[value].dark) };
    if (HEX.test(value)) return { background: value, dark: isDarkHex(value) };
    return null;
}

export function colorStyle(value) {
    const c = resolveColor(value);
    return c ? { background: c.background, color: c.dark ? "#ffffff" : "#0b0b2e" } : undefined;
}
