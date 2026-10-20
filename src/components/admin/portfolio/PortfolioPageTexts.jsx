"use client";

import { RotateCcw } from "lucide-react";
import { PORTFOLIO_TEXT_DEFAULTS } from "@/lib/portfolio";

// Portfolio editor → Page texts: the small label, intro paragraph and the two section
// headings on the project's page. value/onChange use the API field names.
const FIELDS = [
    { key: "overview_label", label: "Small label above the title", rows: 1, help: "Leave empty to hide it." },
    { key: "overview_text", label: "Short paragraph next to the title", rows: 3, help: "Leave empty to hide it; the title then uses the full width." },
    { key: "challenge_heading", label: "Heading of section 01 (the challenge)", rows: 2, help: "Press Enter for a line break. Empty uses the standard heading." },
    { key: "solution_heading", label: "Heading of section 02 (the solution)", rows: 2, help: "Press Enter for a line break. Empty uses the standard heading." },
];

const inputClass = "w-full p-3.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-[#1D1D7E] shadow-sm resize-y";
const labelClass = "block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5";

export default function PortfolioPageTexts({ value, onChange }) {
    const set = (key, v) => onChange({ ...value, [key]: v });
    return (
        <div className="rounded-2xl border border-gray-100 bg-slate-50/60 p-5 md:p-6 space-y-5" data-page-texts>
            <div>
                <p className="text-[#1D1D7E] font-black text-xs uppercase tracking-widest">Page texts</p>
                <p className="text-xs text-slate-500 mt-1">The wording around this case study on its page.</p>
            </div>
            {FIELDS.map((f) => {
                const id = `pf-${f.key}`;
                const changed = (value[f.key] ?? "") !== PORTFOLIO_TEXT_DEFAULTS[f.key];
                return (
                    <div key={f.key}>
                        <div className="flex items-center justify-between gap-3">
                            <label htmlFor={id} className={labelClass}>{f.label}</label>
                            {changed && (
                                <button type="button" onClick={() => set(f.key, PORTFOLIO_TEXT_DEFAULTS[f.key])}
                                    className="mb-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-[#1D1D7E]">
                                    <RotateCcw size={12} /> Standard text
                                </button>
                            )}
                        </div>
                        {f.rows === 1 ? (
                            <input id={id} type="text" maxLength={120} value={value[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} className={inputClass} />
                        ) : (
                            <textarea id={id} rows={f.rows} maxLength={f.key === "overview_text" ? 2000 : 200} value={value[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} className={inputClass} />
                        )}
                        <p className="text-[11px] text-slate-400 mt-1">{f.help}</p>
                    </div>
                );
            })}
        </div>
    );
}

// Editor state for a project: saved texts, or the standard wording where nothing was saved yet
export function pageTextsFrom(project) {
    return Object.fromEntries(Object.keys(PORTFOLIO_TEXT_DEFAULTS).map((k) => [k, project?.[k] == null ? PORTFOLIO_TEXT_DEFAULTS[k] : project[k]]));
}
