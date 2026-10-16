// Service page sections (stored in Service.layout, validated by backend/app/service_layout.py).

export const BUILT_IN = ["intro", "why", "overview", "pricing"];
export const MAX_CUSTOM = 8;

export const BLOCK_TYPES = {
    intro: { label: "Intro", builtIn: true, help: "Short description, the feature points, buttons and the service image (from the fields above)." },
    why: { label: "Why choose us", builtIn: true, help: "The three “Why choose” points (from the fields above), as cards." },
    overview: { label: "Full description", builtIn: true, help: "The long description, under “Read more” unless you choose to show it in full." },
    pricing: { label: "Pricing", builtIn: true, help: "Your pricing plans (edited in the Pricing section below)." },
    cards: { label: "Highlight cards", help: "3–6 cards with an icon, title, short text and an optional button. For what you offer, benefits or sub-services.", max: 9 },
    steps: { label: "Steps", help: "A numbered process: how it works, from first call to delivery.", max: 6 },
    stats: { label: "Key numbers", help: "2–4 big figures with a label, e.g. “48h — to first candidates”.", max: 4 },
    checklist: { label: "Checklist with image", help: "An image beside a heading, short text and ticked points. For what's included or who it's for.", max: 12 },
    cta: { label: "Call-to-action band", help: "A bold band with a headline, your phone number and a button.", },
    faq: { label: "FAQ", help: "Questions and answers in an accordion. Also adds FAQ results data for Google.", max: 15 },
};

export const DEFAULT_LAYOUT = BUILT_IN.map((type) => ({ id: `builtin-${type}`, type, hidden: false, ...(type === "overview" ? { collapsed: true } : {}) }));

export function parseLayout(raw) {
    try {
        const data = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (data && Array.isArray(data.blocks) && data.blocks.length) return data.blocks;
    } catch { /* fall back to the default */ }
    return DEFAULT_LAYOUT;
}

// FAQPage structured data for the visible FAQ sections (Google FAQ results)
export function faqSchema(blocks) {
    const items = blocks.filter((b) => b.type === "faq" && !b.hidden).flatMap((b) => b.items || []);
    if (!items.length) return null;
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((i) => ({ "@type": "Question", name: i.question, acceptedAnswer: { "@type": "Answer", text: i.answer } })),
    };
}
