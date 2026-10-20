// The big project title on a portfolio page, styled with the project's "Title design"
// (portfolio editor). Also used for the editor's live preview, so both always match.
// design: { size, weight, case, color, highlight, highlight_color, lines } — see TITLE_DESIGN_DEFAULTS.
import { titleDesign } from "@/lib/portfolio";

const SIZE = {
    s: "text-3xl md:text-4xl lg:text-5xl",
    m: "text-4xl md:text-5xl lg:text-6xl",
    l: "text-4xl md:text-6xl lg:text-7xl",
    xl: "text-5xl md:text-7xl lg:text-8xl",
};
const WEIGHT = { semibold: "font-semibold", bold: "font-bold", black: "font-black" };
export const ALIGN = { left: "text-left", center: "text-center", right: "text-right" };
const GRADIENT = "linear-gradient(90deg, #5DB4D1 0%, #A5A5E1 55%, #ffffff 100%)";
const NAMED = { white: "#ffffff", blue: "#5DB4D1", lavender: "#A5A5E1" };

// Inline style for a colour choice: named colour, gradient text or a custom #hex
function colorStyle(value) {
    if (value === "gradient") return { backgroundImage: GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" };
    return { color: NAMED[value] || value || "#ffffff" };
}

// Split the text around the highlighted words (case-insensitive, every occurrence)
function withHighlight(text, phrase, style) {
    const p = (phrase || "").trim();
    if (!p) return text;
    const parts = text.split(new RegExp(`(${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    return parts.map((part, i) => (i % 2 ? <span key={i} style={style}>{part}</span> : part));
}

export default function PortfolioTitle({ title, design, as: Tag = "h1", className = "" }) {
    const d = titleDesign(design, title);
    return (
        <Tag
            className={`${SIZE[d.size]} ${WEIGHT[d.weight]} ${ALIGN[d.align]} ${d.case === "upper" ? "uppercase" : ""} tracking-tighter leading-[0.95] whitespace-pre-line ${className}`}
            style={colorStyle(d.color)}
        >
            {withHighlight(d.text, d.highlight, colorStyle(d.highlight_color))}
        </Tag>
    );
}
