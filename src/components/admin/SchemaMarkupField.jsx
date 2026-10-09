"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, ChevronDown, ChevronRight, Code2, Wand2 } from "lucide-react";
import { templateText } from "@/lib/schema";

const AUTOMATIC = {
    blog: "Leave empty to use the automatic BlogPosting markup (SEO & Tracking → Schema markup).",
    service: "Leave empty to use the automatic Service markup (SEO & Tracking → Schema markup).",
    page: "Leave empty for no page-specific markup.",
    portfolio: "Leave empty for no project-specific markup.",
};

export function schemaJsonError(value) {
    if (!(value || "").trim()) return null;
    try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === "object" ? null : "must be a JSON object or array";
    } catch (err) {
        return err.message;
    }
}

/** Per-item schema markup (JSON-LD) box used by the blog, service, page and portfolio editors. */
export default function SchemaMarkupField({ kind = "page", value, onChange, id = "schema-json" }) {
    const [open, setOpen] = useState(Boolean((value || "").trim()));
    const problem = schemaJsonError(value);
    const filled = Boolean((value || "").trim());

    return (
        <div className="rounded-2xl border border-gray-200 bg-white" data-testid="schema-markup-field">
            <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls={id}
                className="w-full flex items-center gap-2 px-4 py-3 text-left">
                {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <Code2 size={16} className="text-[#1D1D7E]" />
                <span className="text-sm font-bold text-slate-800">Schema markup (JSON-LD)</span>
                <span className={`ml-auto text-xs ${filled ? (problem ? "text-red-600" : "text-emerald-700") : "text-slate-400"}`}>
                    {filled ? (problem ? "Not valid JSON" : "Custom markup") : kind === "blog" || kind === "service" ? "Automatic" : "None"}
                </span>
            </button>
            {open && (
                <div className="px-4 pb-4 space-y-2">
                    <p className="text-xs text-slate-500">
                        Structured data for search engines, added to this page only. {AUTOMATIC[kind]} Placeholders filled automatically:{" "}
                        <code className="text-[11px]">{"{{title}} {{description}} {{url}} {{image}}"}</code>
                        {kind === "blog" && <code className="text-[11px]"> {"{{author}} {{category}}"}</code>}
                        {kind === "service" && <code className="text-[11px]"> {"{{category}}"}</code>}
                        {kind === "portfolio" && <code className="text-[11px]"> {"{{category}} {{year}}"}</code>}
                        {" "}and from Basic Info <code className="text-[11px]">{"{{site_name}} {{site_url}} {{logo}} {{email}} {{phone}}"}</code>.
                    </p>
                    {!filled && (
                        <button type="button" onClick={() => onChange(templateText(kind))}
                            className="inline-flex items-center gap-2 rounded-lg border border-[#1D1D7E]/20 bg-[#EEF0FF] px-3 py-1.5 text-xs font-bold text-[#1D1D7E] hover:bg-[#e2e5ff]">
                            <Wand2 size={14} /> Insert recommended template
                        </button>
                    )}
                    <textarea
                        id={id}
                        rows={10}
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value)}
                        spellCheck={false}
                        placeholder='{"@context": "https://schema.org", "@type": "...", ...}'
                        aria-invalid={problem ? "true" : undefined}
                        className={`w-full p-3 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-[#1D1D7E]/40 font-mono text-[13px] leading-relaxed resize-y text-slate-800 ${problem ? "border-red-300" : "border-gray-200"}`}
                    />
                    {filled && (
                        <p className={`flex items-center gap-1.5 text-xs font-semibold ${problem ? "text-red-600" : "text-emerald-700"}`} role="status">
                            {problem ? <AlertCircle size={13} /> : <CheckCircle2 size={13} />}
                            {problem ? `Not valid JSON: ${problem}` : "Valid JSON"}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
