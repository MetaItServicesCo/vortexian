// "Other Services" page (/other-services). It shows:
//   1. every service in the "Others" category (Dashboard → Manage Services), automatically;
//   2. the categories and service cards added in Dashboard → Other Services Page, saved as the
//      "other_services" site-content section:
//      { categories: [{ id, name, intro, color, quote_label, visible,
//                       services: [{ id, title, description, icon, image, image_alt, link, visible }] }] }
// In the Services menu, "Others" is one "Other Services" link to this page.
import { ICONS } from "@/components/content/DynamicIcon";

export const OTHER_SERVICES_PATH = "/other-services";

// Card tints in the site's palette. Keys are stored, so only ever add to this list.
export const CARD_COLORS = {
    sky: { label: "Sky", card: "#EAF6FB", border: "#CBE8F3", icon: "#2B7FA0" },
    lavender: { label: "Lavender", card: "#EEEEFB", border: "#D9D9F5", icon: "#1D1D7E" },
    mint: { label: "Mint", card: "#E7F6F0", border: "#C8EBDD", icon: "#1F7A5C" },
    sand: { label: "Sand", card: "#FDF5E3", border: "#F3E3BC", icon: "#8A6416" },
    rose: { label: "Rose", card: "#FCEDEF", border: "#F4D3D8", icon: "#A33A4C" },
    white: { label: "White", card: "#FFFFFF", border: "#E5EAF0", icon: "#1D1D7E" },
};
const AUTO_ORDER = ["sky", "lavender", "mint", "sand", "rose"];

// "auto" (or unknown) cycles through the tints by section position
export const colorFor = (category, index) => CARD_COLORS[category?.color] || CARD_COLORS[AUTO_ORDER[index % AUTO_ORDER.length]];

export const newId = () => Math.random().toString(36).slice(2, 10);

// Learn More links: a page on this site ("/services/x") or a full web address
export function safeLink(link) {
    const v = (link || "").trim();
    if (/^\/(?!\/)\S*$/.test(v) || /^https?:\/\/\S+$/i.test(v)) return v;
    return "";
}
export const isExternal = (link) => /^https?:\/\//i.test(link || "");

export function slugify(text) {
    return (text || "").toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "") || "category";
}

// Visible categories with at least one visible, titled service; unique anchor ids
export function visibleCategories(categories) {
    const used = new Set();
    return (Array.isArray(categories) ? categories : [])
        .filter((c) => c && c.visible !== false && (c.name || "").trim())
        .map((c) => {
            let anchor = slugify(c.name), n = 2;
            while (used.has(anchor)) anchor = `${slugify(c.name)}-${n++}`;
            used.add(anchor);
            const services = (Array.isArray(c.services) ? c.services : []).filter((s) => s && s.visible !== false && (s.title || "").trim());
            return { ...c, anchor, services };
        })
        .filter((c) => c.services.length);
}

export const hasOwnCards = (content) => visibleCategories(content?.categories).length > 0;

// A service (Manage Services) as a card linking to its page
export function serviceCard(s) {
    return {
        id: `service-${s.id}`,
        title: s.service_title,
        description: (s.short_description || "").trim(),
        icon: ICONS[s.lucide_icon] ? s.lucide_icon : "Layers",
        image: "",
        image_alt: "",
        link: `/services/${encodeURIComponent(s.url_slug)}`,
        visible: true,
    };
}

// Services whose category is "Others", or whose category no longer exists (the menu treats both as Others)
export function othersServices(services, categories) {
    const list = Array.isArray(categories) ? categories : [];
    const others = list.find((c) => c.is_system);
    if (!others) return []; // categories unavailable: don't guess
    const known = new Set(list.map((c) => c.id));
    return (Array.isArray(services) ? services : [])
        .filter((s) => (others && s.category_id === others.id) || !known.has(s.category_id))
        .sort((a, b) => a.id - b.id);
}
