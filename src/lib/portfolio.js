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
