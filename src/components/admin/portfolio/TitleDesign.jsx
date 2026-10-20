"use client";

import { RotateCcw } from "lucide-react";
import PortfolioTitle from "@/components/portfolio/PortfolioTitle";
import { TITLE_DESIGN_DEFAULTS, sameWords } from "@/lib/portfolio";

// Portfolio editor → Title design: size, weight, letter case, colour, highlighted words and
// line breaks for the big title, with a live preview on the page's dark background.
const SIZES = [["s", "Small"], ["m", "Medium"], ["l", "Large"], ["xl", "Extra large"]];
const WEIGHTS = [["semibold", "Semi-bold"], ["bold", "Bold"], ["black", "Extra bold"]];
const CASES = [["upper", "UPPERCASE"], ["none", "As typed"]];
const COLORS = [
    ["white", "White", "#ffffff"],
    ["blue", "Site blue", "#5DB4D1"],
    ["lavender", "Lavender", "#A5A5E1"],
    ["gradient", "Gradient", "linear-gradient(90deg, #5DB4D1, #A5A5E1, #ffffff)"],
];
const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const labelClass = "block text-xs font-black uppercase tracking-wider text-slate-500 mb-2";

function Choice({ options, value, onChange, label }) {
    return (
        <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
            {options.map(([key, text]) => (
                <button key={key} type="button" role="radio" aria-checked={value === key} onClick={() => onChange(key)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition ${value === key ? "bg-[#1D1D7E] text-white border-[#1D1D7E]" : "bg-white text-slate-600 border-gray-200 hover:border-slate-400"}`}>
                    {text}
                </button>
            ))}
        </div>
    );
}

function ColorChoice({ value, onChange, label }) {
    const custom = HEX.test(value || "") ? value : "";
    return (
        <div role="radiogroup" aria-label={label} className="flex flex-wrap items-center gap-2">
            {COLORS.map(([key, text, bg]) => (
                <button key={key} type="button" role="radio" aria-checked={value === key} onClick={() => onChange(key)} title={text}
                    className={`flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-lg border text-xs font-bold transition ${value === key ? "border-[#1D1D7E] ring-2 ring-[#1D1D7E]/20 text-[#1D1D7E]" : "border-gray-200 text-slate-600 hover:border-slate-400"}`}>
                    <span className="w-5 h-5 rounded-md border border-slate-300" style={{ background: bg }} />{text}
                </button>
            ))}
            <label className={`relative flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer ${custom ? "border-[#1D1D7E] ring-2 ring-[#1D1D7E]/20 text-[#1D1D7E]" : "border-gray-200 text-slate-600 hover:border-slate-400"}`}>
                <span className="w-5 h-5 rounded-md border border-slate-300" style={{ background: custom || "conic-gradient(#f43f5e, #f59e0b, #22c55e, #06b6d4, #6366f1, #d946ef, #f43f5e)" }} />
                {custom || "Any colour"}
                <input type="color" value={custom || "#5db4d1"} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" aria-label={`${label}: any colour`} />
            </label>
        </div>
    );
}

export default function TitleDesign({ title, value, onChange }) {
    const d = { ...TITLE_DESIGN_DEFAULTS, ...(value || {}) };
    const set = (patch) => onChange({ ...d, ...patch });
    const linesOk = !d.lines.trim() || sameWords(d.lines, title);
    const highlightFound = !d.highlight.trim() || (title || "").toLowerCase().includes(d.highlight.trim().toLowerCase());
    const changed = JSON.stringify(d) !== JSON.stringify(TITLE_DESIGN_DEFAULTS);

    return (
        <div className="rounded-2xl border border-gray-100 bg-slate-50/60 p-5 md:p-6 space-y-5" data-title-design>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[#1D1D7E] font-black text-xs uppercase tracking-widest">Title design</p>
                    <p className="text-xs text-slate-500 mt-1">How the big title looks on the project page. The title text itself stays the same for Google, the breadcrumb and the portfolio cards.</p>
                </div>
                {changed && (
                    <button type="button" onClick={() => onChange({ ...TITLE_DESIGN_DEFAULTS })} className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-[#1D1D7E]">
                        <RotateCcw size={12} /> Standard look
                    </button>
                )}
            </div>

            <div className="grid gap-5 md:grid-cols-3">
                <div><span className={labelClass}>Size</span><Choice label="Title size" options={SIZES} value={d.size} onChange={(size) => set({ size })} /></div>
                <div><span className={labelClass}>Weight</span><Choice label="Title weight" options={WEIGHTS} value={d.weight} onChange={(weight) => set({ weight })} /></div>
                <div><span className={labelClass}>Letters</span><Choice label="Title letter case" options={CASES} value={d.case} onChange={(c) => set({ case: c })} /></div>
            </div>

            <div><span className={labelClass}>Colour</span><ColorChoice label="Title colour" value={d.color} onChange={(color) => set({ color })} /></div>

            <div className="grid gap-5 md:grid-cols-2">
                <div>
                    <label htmlFor="td-highlight" className={labelClass}>Highlight words (optional)</label>
                    <input id="td-highlight" type="text" maxLength={200} value={d.highlight} onChange={(e) => set({ highlight: e.target.value })} placeholder="e.g. University of California"
                        className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[#1D1D7E]" />
                    <p className={`text-[11px] mt-1 ${highlightFound ? "text-slate-400" : "text-amber-600 font-semibold"}`}>
                        {highlightFound ? "Words from the title shown in another colour." : "These words aren't in the title, so nothing is highlighted."}
                    </p>
                </div>
                <div>
                    <span className={labelClass}>Highlight colour</span>
                    <ColorChoice label="Highlight colour" value={d.highlight_color} onChange={(highlight_color) => set({ highlight_color })} />
                </div>
            </div>

            <div>
                <label htmlFor="td-lines" className={labelClass}>Line breaks (optional)</label>
                <textarea id="td-lines" rows={3} maxLength={400} value={d.lines} onChange={(e) => set({ lines: e.target.value })}
                    placeholder={"Labor Workforce Hiring\nfor University of California"}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[#1D1D7E] resize-y" />
                <div className="flex flex-wrap items-center gap-3 mt-1">
                    <p className={`text-[11px] ${linesOk ? "text-slate-400" : "text-red-600 font-semibold"}`}>
                        {linesOk ? "The title with your own line breaks (press Enter). Leave empty for automatic wrapping." : "Use exactly the same words as the title, only add line breaks."}
                    </p>
                    {!d.lines.trim() && title && (
                        <button type="button" onClick={() => set({ lines: title })} className="text-[11px] font-bold text-[#1D1D7E] underline underline-offset-2">Start from the title</button>
                    )}
                </div>
            </div>

            <div>
                <span className={labelClass}>Preview</span>
                {/* Shown at 60% scale in a box as wide as the page's title column, so it wraps as on the site */}
                <div className="rounded-xl bg-[#0d0e12] p-6 md:p-8 overflow-hidden" data-title-preview>
                    <div style={{ zoom: 0.6, width: "min(100%, 760px)" }} className="max-w-none">
                        <PortfolioTitle as="p" title={title || "Project title"} design={d} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export const titleDesignProblem = (design, title) =>
    design?.lines?.trim() && !sameWords(design.lines, title) ? "Title line breaks: use exactly the same words as the project title (only add line breaks)." : "";

export function titleDesignFrom(project) {
    let saved = project?.title_design;
    if (typeof saved === "string") { try { saved = JSON.parse(saved); } catch { saved = {}; } }
    return { ...TITLE_DESIGN_DEFAULTS, ...(saved && typeof saved === "object" ? saved : {}) };
}
