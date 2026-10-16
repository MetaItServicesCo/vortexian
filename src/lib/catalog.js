// "Our Services" page (/our-services): categories of service cards.
// Edited in Dashboard → Our Services Page and saved as the "catalog" site-content section:
//   { categories: [{ id, name, intro, color, quote_label, visible,
//                    services: [{ id, title, description, icon, image, image_alt, link, visible }] }] }
// Until categories are saved, the page lists the live services (Manage Services) by category.
import { ICONS } from "@/components/content/DynamicIcon";

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

// "auto" (or unknown) cycles through the tints by category position
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
export function visibleCategories(catalog) {
    const used = new Set();
    return (Array.isArray(catalog?.categories) ? catalog.categories : [])
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

const iconName = (name) => (ICONS[name] ? name : "Layers");

// Categories built from the live services: the Services menu groups (order and visibility from
// Dashboard → Categories), with each service's icon and short description, linking to its page.
export function catalogFromServices(menuTree, services) {
    const byId = new Map((Array.isArray(services) ? services : []).map((s) => [s.id, s]));
    return {
        categories: (Array.isArray(menuTree) ? menuTree : []).map((group) => ({
            id: newId(),
            name: group.name,
            intro: "",
            color: "auto",
            quote_label: "",
            visible: true,
            services: (group.services || []).map((item) => {
                const s = byId.get(item.id) || item;
                return {
                    id: newId(),
                    title: s.service_title || item.service_title,
                    description: (s.short_description || "").trim(),
                    icon: iconName(s.lucide_icon),
                    image: "",
                    image_alt: "",
                    link: `/services/${encodeURIComponent(item.url_slug)}`,
                    visible: true,
                };
            }),
        })),
    };
}
