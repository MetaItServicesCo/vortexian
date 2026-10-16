"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Eye, EyeOff, ImagePlus, LayoutTemplate, Loader2, Lock, Plus, Trash2, Wand2, X } from "lucide-react";
import toast from "react-hot-toast";
import { IconField } from "@/components/admin/content/SchemaForm";
import ColorPicker from "@/components/admin/ColorPicker";
import { Palette } from "lucide-react";
import ServiceSections from "@/components/services/ServiceSections";
import { uploadMedia } from "@/lib/adminApi";
import { BLOCK_TYPES, BUILT_IN, MAX_CUSTOM, parseLayout } from "@/lib/serviceLayout";

// Dashboard → Manage Services → Page sections. The service page is built from
// these blocks, in this order (stored in Service.layout; see backend/app/service_layout.py).

let counter = 0;
const newId = () => `s${Date.now().toString(36)}${(counter++).toString(36)}`;
const CUSTOM_TYPES = Object.keys(BLOCK_TYPES).filter((t) => !BLOCK_TYPES[t].builtIn);

const STARTERS = {
    cards: () => ({ eyebrow: "What we offer", heading: "", intro: "", items: [0, 1, 2].map(() => ({ icon: "CircleCheck", title: "", text: "", button_text: "", button_link: "/contact", color: "auto" })) }),
    steps: () => ({ eyebrow: "How it works", heading: "", intro: "", items: [0, 1, 2, 3].map(() => ({ title: "", text: "" })) }),
    stats: () => ({ eyebrow: "", heading: "", items: [0, 1, 2].map(() => ({ value: "", label: "" })) }),
    checklist: () => ({ eyebrow: "", heading: "", text: "", items: [], itemsText: "", image: "", image_alt: "", image_side: "right", button_text: "", button_link: "/contact" }),
    cta: () => ({ eyebrow: "Talk to us", heading: "", text: "", show_phone: true, phone: "", button_text: "Get A Free Quote", button_link: "/contact" }),
    faq: () => ({ eyebrow: "FAQ", heading: "Frequently asked questions", text: "", button_text: "", button_link: "/contact", items: [{ question: "", answer: "" }] }),
};

// Stored JSON -> editor blocks (each gets an id and an "open" flag; checklist points as text)
export function layoutFromStored(raw) {
    return parseLayout(raw).map((b) => ({ ...b, id: b.id || newId(), open: false, ...(b.type === "checklist" ? { itemsText: (b.items || []).join("\n") } : {}) }));
}

// Editor blocks -> JSON for the API
export function layoutToStored(blocks) {
    return JSON.stringify({
        blocks: blocks.map(({ open: _open, itemsText, ...b }) => (b.type === "checklist"
            ? { ...b, items: (itemsText || "").split("\n").map((p) => p.trim()).filter(Boolean) }
            : b)),
    });
}

const label = (b) => BLOCK_TYPES[b.type]?.label || b.type;

// The service as the page would show it, from the editor's form (for "Preview page")
export function previewFromForm(form, imageUrl, pricingJson) {
    const [f1, f2, f3, f4] = form.features || [];
    return {
        service_title: form.title || "Service name", short_description: form.shortDesc, category_stack: form.category,
        image_showcase_url: imageUrl || form.image, image_alt: form.image_alt, long_description: form.longDesc,
        feature_1: f1, feature_2: f2, feature_3: f3, feature_4: f4,
        why_choose_1: form.whyChoose?.expertise, why_choose_2: form.whyChoose?.scalability, why_choose_3: form.whyChoose?.quality,
        pricing: pricingJson,
    };
}

// The first problem that would stop saving, or ""
export function layoutError(blocks) {
    for (const [i, b] of blocks.entries()) {
        if (b.hidden || BLOCK_TYPES[b.type]?.builtIn) continue;
        const name = `${label(b)} section${b.heading ? ` “${b.heading}”` : ` ${i + 1}`}`;
        const items = (b.items || []).filter((it) => Object.values(it).some((v) => typeof v === "string" && v.trim() && v !== "/contact" && v !== "CircleCheck" && v !== "auto"));
        if (["cards", "steps", "stats", "faq"].includes(b.type) && !items.length) return `Page sections: the ${name} is empty. Fill it in, hide it or remove it.`;
        if (b.type === "faq" && (b.items || []).some((it) => it.question.trim() && !it.answer.trim())) return `Page sections: every question in the ${name} needs an answer.`;
        if (b.type === "checklist" && b.image && !b.image_alt.trim()) return `Page sections: the image in the ${name} needs alt text.`;
        if (["checklist", "cta"].includes(b.type) && !(b.heading.trim() || b.text.trim() || (b.itemsText || "").trim())) return `Page sections: the ${name} is empty. Add a heading or text, hide it or remove it.`;
    }
    return "";
}

// A useful starting layout for services that don't have one yet (all text editable)
function template(blocks) {
    const by = Object.fromEntries(blocks.filter((b) => BUILT_IN.includes(b.type)).map((b) => [b.type, b]));
    const make = (type, extra) => ({ id: newId(), type, hidden: false, open: false, ...STARTERS[type](), ...extra });
    return [
        by.intro, by.why,
        make("steps", { heading: "How we work with you", items: [
            { title: "Free consultation", text: "Tell us what you need. We listen, ask the right questions and suggest the best approach." },
            { title: "Plan & quote", text: "You get a clear plan, timeline and quote, with no surprise costs." },
            { title: "Delivery", text: "Our team gets to work and keeps you updated at every step." },
            { title: "Ongoing support", text: "We stay with you after launch to make sure everything keeps running smoothly." },
        ] }),
        by.overview, by.pricing,
        make("faq", { items: [
            { question: "How do I get started?", answer: "Contact us with a short description of what you need. We'll reply with a plan and a quote." },
            { question: "How long does it take?", answer: "It depends on the scope. We agree a timeline with you before any work starts." },
        ] }),
        make("cta", { eyebrow: "Need help fast?", heading: "We're just one call away", text: "Talk to our team today and get a free, no-obligation quote." }),
    ].filter(Boolean);
}

const input = "w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1D1D7E]/40 text-sm text-slate-800";
const lbl = "text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1";

function F({ text, hint, children, className = "" }) {
    return (
        <label className={`block ${className}`}>
            <span className={lbl}>{text}</span>
            {children}
            {hint && <span className="block mt-1 text-[11px] text-slate-400">{hint}</span>}
        </label>
    );
}

function Items({ items, onChange, max, render, blank, noun }) {
    const set = (i, patch) => onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
    const move = (i, d) => { const next = [...items]; [next[i], next[i + d]] = [next[i + d], next[i]]; onChange(next); };
    return (
        <div className="space-y-3">
            {items.map((it, i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                    <div className="flex items-center gap-1 mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{noun} {i + 1}</span>
                        <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${noun} ${i + 1} up`} className="ml-auto p-1 rounded text-slate-500 hover:bg-white disabled:opacity-30"><ArrowUp size={14} /></button>
                        <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`Move ${noun} ${i + 1} down`} className="p-1 rounded text-slate-500 hover:bg-white disabled:opacity-30"><ArrowDown size={14} /></button>
                        <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label={`Remove ${noun} ${i + 1}`} className="p-1 rounded text-red-500 hover:bg-red-50"><X size={14} /></button>
                    </div>
                    {render(it, (patch) => set(i, patch), i)}
                </div>
            ))}
            <button type="button" onClick={() => onChange([...items, blank()])} disabled={items.length >= max}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D1D7E] disabled:opacity-40">
                <Plus size={15} /> Add {noun.toLowerCase()} {items.length >= max ? `(max ${max})` : ""}
            </button>
        </div>
    );
}

function Heads({ b, set, intro = false, text = false }) {
    return (
        <>
            <div className="grid md:grid-cols-2 gap-3">
                <F text="Small label above the heading"><input className={input} value={b.eyebrow || ""} maxLength={60} onChange={(e) => set({ eyebrow: e.target.value })} aria-label={`${label(b)} label`} /></F>
                <F text="Heading"><input className={input} value={b.heading || ""} maxLength={140} onChange={(e) => set({ heading: e.target.value })} aria-label={`${label(b)} heading`} /></F>
            </div>
            {intro && <F text="Short introduction (optional)"><input className={input} value={b.intro || ""} maxLength={400} onChange={(e) => set({ intro: e.target.value })} aria-label={`${label(b)} introduction`} /></F>}
            {text && <F text="Text (optional)"><textarea className={`${input} resize-y`} rows={3} value={b.text || ""} maxLength={600} onChange={(e) => set({ text: e.target.value })} aria-label={`${label(b)} text`} /></F>}
        </>
    );
}

function ButtonFields({ b, set, hint = "Leave the text empty for no button." }) {
    return (
        <div className="grid md:grid-cols-2 gap-3">
            <F text="Button text" hint={hint}><input className={input} value={b.button_text || ""} maxLength={40} onChange={(e) => set({ button_text: e.target.value })} aria-label={`${label(b)} button text`} /></F>
            <F text="Button link" hint="A page on this site (/contact) or a full web address."><input className={input} value={b.button_link || ""} maxLength={300} onChange={(e) => set({ button_link: e.target.value })} aria-label={`${label(b)} button link`} /></F>
        </div>
    );
}

function ImageField({ b, set }) {
    const [busy, setBusy] = useState(false);
    const upload = async (file) => {
        if (!file) return;
        setBusy(true);
        try {
            set({ image: await uploadMedia(file) });
        } catch (err) {
            toast.error(err.message || "Upload failed");
        } finally {
            setBusy(false);
        }
    };
    return (
        <div className="grid md:grid-cols-[auto,1fr] gap-3 items-start">
            <div className="w-36 h-28 rounded-xl border border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
                {b.image ? <img src={b.image} alt="" className="max-w-full max-h-full object-contain" /> : <ImagePlus className="text-slate-300" />}
            </div>
            <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer bg-[#1D1D7E] text-white text-xs font-bold px-3 py-2 rounded-lg">
                        {busy ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />} {b.image ? "Change image" : "Upload image"}
                        <input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" className="hidden" aria-label={`${label(b)} image`} onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ""; }} />
                    </label>
                    {b.image && <button type="button" onClick={() => set({ image: "", image_alt: "" })} className="text-xs font-bold text-red-500 px-2">Remove image</button>}
                    <select value={b.image_side || "right"} onChange={(e) => set({ image_side: e.target.value })} className="text-xs border border-gray-200 rounded-lg px-2" aria-label="Image side">
                        <option value="right">Image on the right</option>
                        <option value="left">Image on the left</option>
                    </select>
                </div>
                {b.image && <input className={input} value={b.image_alt || ""} maxLength={255} placeholder="Alt text (required): what the image shows" onChange={(e) => set({ image_alt: e.target.value })} aria-label={`${label(b)} image alt text`} />}
            </div>
        </div>
    );
}

// Look of a section: background, spacing, alignment, card columns/style, accent colour
const HAS = {
    align: ["why", "cards", "steps", "stats"],
    cards: ["why", "cards"],
    accent: ["steps", "stats", "checklist", "cta"],
};
function DesignPanel({ b, set }) {
    const d = b.design || {};
    const setD = (patch) => set({ design: { ...d, ...patch } });
    const sel = "h-9 rounded-lg border border-gray-200 bg-white px-2 text-sm";
    const defaultBg = { intro: "Default (soft gradient)", cta: "Default (navy gradient)" }[b.type] || "Auto";
    return (
        <details className="group rounded-xl border border-violet-200 bg-violet-50/40" data-design-panel="">
            <summary className="flex items-center gap-2 cursor-pointer list-none px-3 py-2.5 text-sm font-bold text-[#1D1D7E] [&::-webkit-details-marker]:hidden">
                <Palette size={15} /> Design <span className="font-normal text-slate-500 text-xs">background, spacing{HAS.cards.includes(b.type) ? ", columns, card style" : ""}{HAS.accent.includes(b.type) ? ", accent colour" : ""}</span>
                <ChevronDown size={15} className="ml-auto transition group-open:rotate-180" />
            </summary>
            <div className="px-3 pb-3 space-y-3">
                <F text="Background"><ColorPicker value={d.background} onChange={(background) => setD({ background })} autoLabel={defaultBg} label={`${label(b)} background`} /></F>
                <div className="flex flex-wrap gap-3">
                    <F text="Spacing"><select className={sel} value={d.spacing || "normal"} onChange={(e) => setD({ spacing: e.target.value })} aria-label={`${label(b)} spacing`}>
                        <option value="compact">Compact</option><option value="normal">Normal</option><option value="spacious">Spacious</option></select></F>
                    {HAS.align.includes(b.type) && <F text="Heading alignment"><select className={sel} value={d.align || "center"} onChange={(e) => setD({ align: e.target.value })} aria-label={`${label(b)} alignment`}>
                        <option value="center">Centred</option><option value="left">Left</option></select></F>}
                    {HAS.cards.includes(b.type) && <F text="Columns"><select className={sel} value={d.columns || "auto"} onChange={(e) => setD({ columns: e.target.value })} aria-label={`${label(b)} columns`}>
                        <option value="auto">Auto</option><option value="2">2</option><option value="3">3</option><option value="4">4</option></select></F>}
                    {HAS.cards.includes(b.type) && <F text="Card style"><select className={sel} value={d.card_style || "tinted"} onChange={(e) => setD({ card_style: e.target.value })} aria-label={`${label(b)} card style`}>
                        <option value="tinted">Coloured</option><option value="white">White with shadow</option><option value="outline">Outline</option></select></F>}
                </div>
                {HAS.accent.includes(b.type) && <F text={b.type === "stats" ? "Number colour" : b.type === "cta" ? "Phone & label colour" : "Accent colour"}>
                    <ColorPicker value={d.accent} onChange={(accent) => setD({ accent })} label={`${label(b)} accent colour`} /></F>}
                {HAS.cards.includes(b.type) && <p className="text-[11px] text-slate-400">{b.type === "cards" ? "Each card can also have its own colour (in the card's settings)." : "Coloured cards rotate soft cyan, navy and lavender."}</p>}
            </div>
        </details>
    );
}

function BlockFields({ b, set }) {
    switch (b.type) {
        case "intro": case "pricing":
            return <p className="text-sm text-slate-500">{BLOCK_TYPES[b.type].help}</p>;
        case "why":
            return (<><p className="text-sm text-slate-500">{BLOCK_TYPES.why.help}</p>
                <F text="Heading (optional)"><input className={input} value={b.heading || ""} maxLength={140} placeholder="Why Choose Vortexian Tech?" onChange={(e) => set({ heading: e.target.value })} aria-label="Why choose heading" /></F></>);
        case "overview":
            return (<><p className="text-sm text-slate-500">{BLOCK_TYPES.overview.help}</p>
                <F text="Heading (optional)"><input className={input} value={b.heading || ""} maxLength={140} placeholder="About our <service>" onChange={(e) => set({ heading: e.target.value })} aria-label="Full description heading" /></F>
                <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-[#1D1D7E]" checked={b.collapsed !== false} onChange={(e) => set({ collapsed: e.target.checked })} aria-label="Shorten with Read more" />
                    Shorten with “Read more” (the full text stays on the page for Google)
                </label></>);
        case "cards":
            return (<><Heads b={b} set={set} intro />
                <Items items={b.items || []} max={9} noun="Card" onChange={(items) => set({ items })} blank={() => ({ icon: "CircleCheck", title: "", text: "", button_text: "", button_link: "/contact", color: "auto" })}
                    render={(it, s) => (<div className="space-y-2">
                        <div className="grid md:grid-cols-[180px,1fr] gap-2"><IconField value={it.icon} onChange={(icon) => s({ icon })} /><input className={input} placeholder="Title" value={it.title} maxLength={100} onChange={(e) => s({ title: e.target.value })} aria-label="Card title" /></div>
                        <div className="flex flex-wrap items-center gap-2"><span className={lbl + " mb-0"}>Card colour</span><ColorPicker value={it.color} onChange={(color) => s({ color })} autoLabel="Auto" label="Card colour" /></div>
                        <textarea className={`${input} resize-y`} rows={2} placeholder="Short text" value={it.text} maxLength={300} onChange={(e) => s({ text: e.target.value })} aria-label="Card text" />
                        <div className="grid md:grid-cols-2 gap-2"><input className={input} placeholder="Button text (optional), e.g. Get Started" value={it.button_text} maxLength={40} onChange={(e) => s({ button_text: e.target.value })} aria-label="Card button text" />
                            <input className={input} placeholder="Button link" value={it.button_link} maxLength={300} onChange={(e) => s({ button_link: e.target.value })} aria-label="Card button link" /></div>
                    </div>)} /></>);
        case "steps":
            return (<><Heads b={b} set={set} intro />
                <Items items={b.items || []} max={6} noun="Step" onChange={(items) => set({ items })} blank={() => ({ title: "", text: "" })}
                    render={(it, s) => (<div className="space-y-2">
                        <input className={input} placeholder="Step title" value={it.title} maxLength={100} onChange={(e) => s({ title: e.target.value })} aria-label="Step title" />
                        <textarea className={`${input} resize-y`} rows={2} placeholder="What happens in this step" value={it.text} maxLength={300} onChange={(e) => s({ text: e.target.value })} aria-label="Step text" />
                    </div>)} /></>);
        case "stats":
            return (<><Heads b={b} set={set} />
                <Items items={b.items || []} max={4} noun="Number" onChange={(items) => set({ items })} blank={() => ({ value: "", label: "" })}
                    render={(it, s) => (<div className="grid grid-cols-[140px,1fr] gap-2">
                        <input className={input} placeholder="e.g. 48h" value={it.value} maxLength={20} onChange={(e) => s({ value: e.target.value })} aria-label="Number value" />
                        <input className={input} placeholder="e.g. to first candidates" value={it.label} maxLength={60} onChange={(e) => s({ label: e.target.value })} aria-label="Number label" />
                    </div>)} /></>);
        case "checklist":
            return (<><Heads b={b} set={set} text />
                <F text="Points" hint="One per line, shown with a tick. Up to 12."><textarea className={`${input} resize-y`} rows={4} value={b.itemsText || ""} onChange={(e) => set({ itemsText: e.target.value })} aria-label="Checklist points" /></F>
                <ImageField b={b} set={set} />
                <ButtonFields b={b} set={set} /></>);
        case "cta":
            return (<><Heads b={b} set={set} text />
                <div className="grid md:grid-cols-2 gap-3 items-end">
                    <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 accent-[#1D1D7E]" checked={Boolean(b.show_phone)} onChange={(e) => set({ show_phone: e.target.checked })} aria-label="Show phone number" /> Show a phone number
                    </label>
                    {b.show_phone && <F text="Phone (optional)" hint="Leave empty to use the phone from Basic Info."><input className={input} value={b.phone || ""} maxLength={40} onChange={(e) => set({ phone: e.target.value })} aria-label="Call-to-action phone" /></F>}
                </div>
                <ButtonFields b={b} set={set} /></>);
        case "faq":
            return (<><Heads b={b} set={set} text />
                <ButtonFields b={b} set={set} hint="Shown under the heading. Leave empty for no button." />
                <Items items={b.items || []} max={15} noun="Question" onChange={(items) => set({ items })} blank={() => ({ question: "", answer: "" })}
                    render={(it, s) => (<div className="space-y-2">
                        <input className={input} placeholder="Question" value={it.question} maxLength={200} onChange={(e) => s({ question: e.target.value })} aria-label="FAQ question" />
                        <textarea className={`${input} resize-y`} rows={3} placeholder="Answer" value={it.answer} maxLength={1500} onChange={(e) => s({ answer: e.target.value })} aria-label="FAQ answer" />
                    </div>)} /></>);
        default:
            return null;
    }
}

export default function LayoutEditor({ value, onChange, previewService }) {
    const [adding, setAdding] = useState(false);
    const [preview, setPreview] = useState(false);
    const customCount = value.filter((b) => !BLOCK_TYPES[b.type]?.builtIn).length;
    const set = (i, patch) => onChange(value.map((b, j) => (j === i ? { ...b, ...patch } : b)));
    const move = (i, d) => { const next = [...value]; [next[i], next[i + d]] = [next[i + d], next[i]]; onChange(next); };
    const remove = (i) => {
        if (!confirm(`Remove the ${label(value[i])} section${value[i].heading ? ` “${value[i].heading}”` : ""}? You can still cancel the whole edit before saving.`)) return;
        onChange(value.filter((_, j) => j !== i));
    };
    const add = (type) => {
        onChange([...value, { id: newId(), type, hidden: false, open: true, ...STARTERS[type]() }]);
        setAdding(false);
    };

    return (
        <section className="border border-gray-200 rounded-2xl p-5 md:p-6 space-y-5 bg-slate-50/50" aria-labelledby="layout-editor-title" data-layout-editor="">
            <div className="flex flex-wrap items-start gap-3">
                <div className="flex-1 min-w-[240px]">
                    <h2 id="layout-editor-title" className="text-sm font-black uppercase tracking-wider text-[#1D1D7E]">Page sections</h2>
                    <p className="text-xs text-slate-500 mt-1">The service page is built from these blocks, top to bottom. Move, hide or edit any of them, and add 2–4 sections of your own: highlight cards, steps, key numbers, a checklist, a call-to-action band or FAQs.</p>
                </div>
                {customCount === 0 && (
                    <button type="button" onClick={() => onChange(template(value))} className="inline-flex items-center gap-2 border border-[#1D1D7E]/25 text-[#1D1D7E] px-3 py-2 rounded-xl text-sm font-semibold hover:bg-[#1D1D7E]/5" data-layout-template="">
                        <Wand2 size={15} /> Start from template
                    </button>
                )}
            </div>

            <ol className="space-y-3">
                {value.map((b, i) => {
                    const builtIn = BLOCK_TYPES[b.type]?.builtIn;
                    return (
                        <li key={b.id} className={`rounded-2xl border bg-white ${b.hidden ? "border-dashed border-slate-300 opacity-70" : "border-gray-200"}`} data-layout-block={b.type}>
                            <div className="flex items-center gap-2 p-3">
                                <span className="w-7 h-7 shrink-0 rounded-lg bg-[#EEEEFB] text-[#1D1D7E] text-xs font-black flex items-center justify-center">{i + 1}</span>
                                <button type="button" onClick={() => set(i, { open: !b.open })} aria-expanded={Boolean(b.open)} className="flex-1 min-w-0 text-left">
                                    <span className="font-bold text-slate-800">{label(b)}</span>
                                    {b.heading && !builtIn && <span className="text-slate-500"> · {b.heading}</span>}
                                    {builtIn && <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400"><Lock size={10} /> built in</span>}
                                    {b.hidden && <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-amber-600">hidden</span>}
                                </button>
                                <button type="button" onClick={() => set(i, { hidden: !b.hidden })} aria-label={`${b.hidden ? "Show" : "Hide"} ${label(b)}`} title={b.hidden ? "Show on the page" : "Hide from the page"} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100">{b.hidden ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${label(b)} up`} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowUp size={15} /></button>
                                <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label={`Move ${label(b)} down`} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowDown size={15} /></button>
                                {!builtIn && <button type="button" onClick={() => remove(i)} aria-label={`Remove ${label(b)}`} className="p-1.5 rounded-md text-red-500 hover:bg-red-50"><Trash2 size={15} /></button>}
                                <button type="button" onClick={() => set(i, { open: !b.open })} aria-label={b.open ? "Collapse" : "Edit"} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100"><ChevronDown size={16} className={`transition ${b.open ? "rotate-180" : ""}`} /></button>
                            </div>
                            {b.open && <div className="border-t border-slate-100 p-4 space-y-3"><BlockFields b={b} set={(patch) => set(i, patch)} /><DesignPanel b={b} set={(patch) => set(i, patch)} /></div>}
                        </li>
                    );
                })}
            </ol>

            <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => setAdding((v) => !v)} disabled={customCount >= MAX_CUSTOM} aria-expanded={adding}
                    className="inline-flex items-center gap-2 bg-[#1D1D7E] text-white px-4 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50" data-add-section="">
                    <Plus size={16} /> Add a section
                </button>
                <span className="text-xs text-slate-400">{customCount} of {MAX_CUSTOM} custom sections</span>
                {previewService && (
                    <button type="button" onClick={() => setPreview((v) => !v)} className="ml-auto inline-flex items-center gap-2 text-sm font-semibold text-[#1D1D7E]">
                        <LayoutTemplate size={16} /> {preview ? "Hide page preview" : "Preview page"}
                    </button>
                )}
            </div>
            {adding && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" role="group" aria-label="Section types">
                    {CUSTOM_TYPES.map((t) => (
                        <button key={t} type="button" onClick={() => add(t)} className="text-left rounded-xl border border-slate-200 bg-white p-4 hover:border-[#1D1D7E] hover:shadow-sm transition" data-section-type={t}>
                            <span className="font-bold text-slate-800">{BLOCK_TYPES[t].label}</span>
                            <span className="block text-xs text-slate-500 mt-1">{BLOCK_TYPES[t].help}</span>
                        </button>
                    ))}
                </div>
            )}

            {preview && previewService && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white" data-layout-preview="">
                    <ServiceSections service={previewService} phone={previewService.phone} layout={layoutToStored(value)} preview />
                </div>
            )}
        </section>
    );
}
