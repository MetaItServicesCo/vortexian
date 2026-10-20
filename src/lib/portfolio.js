// Public URL of a portfolio project: /portfolio/<slug> (falls back to the id for old data)
export function portfolioPath(project) {
    return `/portfolio/${project?.slug || project?.id}`;
}

// Texts around a case study (portfolio editor → Page texts). A project that was never edited
// (null) shows this standard wording; a cleared label or intro is hidden; a cleared heading
// falls back to the standard one (every section keeps a heading). "\n" = line break.
export const PORTFOLIO_TEXT_DEFAULTS = {
    overview_label: "// Project overview case",
    overview_text: "An in-depth evaluation of how Vortexian Tech re-architected digital positioning to unlock enterprise-grade scalability, performance, and long-term operational excellence.",
    challenge_heading: "The Business\nChallenge Context",
    solution_heading: "Vortexian Strategy\nResolved",
};

export function portfolioTexts(project) {
    const pick = (key) => (project?.[key] == null ? PORTFOLIO_TEXT_DEFAULTS[key] : String(project[key]).trim());
    return {
        overview_label: pick("overview_label"),
        overview_text: pick("overview_text"),
        challenge_heading: pick("challenge_heading") || PORTFOLIO_TEXT_DEFAULTS.challenge_heading,
        solution_heading: pick("solution_heading") || PORTFOLIO_TEXT_DEFAULTS.solution_heading,
    };
}

// "Title design" of a project's big title (portfolio editor). Saved as JSON; anything not set
// keeps today's look: large, black weight, UPPERCASE, left-aligned, white.
export const TITLE_DESIGN_DEFAULTS = { size: "l", weight: "black", case: "upper", align: "left", color: "white", highlight: "", highlight_color: "blue", lines: "" };
const TITLE_CHOICES = { size: ["s", "m", "l", "xl"], weight: ["semibold", "bold", "black"], case: ["upper", "none"], align: ["left", "center", "right"] };
const TITLE_COLOR = /^(white|blue|lavender|gradient|#[0-9a-f]{6}|#[0-9a-f]{3})$/i;
export const sameWords = (a, b) => String(a || "").replace(/\s+/g, " ").trim() === String(b || "").replace(/\s+/g, " ").trim();

export function titleDesign(design, title) {
    let d = design;
    if (typeof d === "string") { try { d = JSON.parse(d); } catch { d = {}; } }
    d = d && typeof d === "object" ? d : {};
    const out = { ...TITLE_DESIGN_DEFAULTS };
    for (const [k, list] of Object.entries(TITLE_CHOICES)) if (list.includes(d[k])) out[k] = d[k];
    if (TITLE_COLOR.test(d.color || "")) out.color = d.color;
    if (TITLE_COLOR.test(d.highlight_color || "")) out.highlight_color = d.highlight_color;
    out.highlight = typeof d.highlight === "string" ? d.highlight.slice(0, 200) : "";
    // Own line breaks only while they keep exactly the title's words (the title stays the H1 text)
    out.lines = typeof d.lines === "string" && sameWords(d.lines, title) ? d.lines.trim() : "";
    out.text = out.lines || String(title || "");
    return out;
}
