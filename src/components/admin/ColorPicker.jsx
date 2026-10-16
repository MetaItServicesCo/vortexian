"use client";

import { Check } from "lucide-react";
import { BY_NAME, HEX, PALETTE } from "@/lib/designPalette";

// Swatches from the site palette, an optional "Auto", and any custom colour.
export default function ColorPicker({ value, onChange, allowAuto = true, autoLabel = "Auto", label = "Colour", only }) {
    const colors = only ? PALETTE.filter((c) => only.includes(c.name)) : PALETTE;
    const custom = HEX.test(value || "") ? value : "";
    const swatch = "w-7 h-7 rounded-full border flex items-center justify-center shrink-0 transition hover:scale-110";
    return (
        <div role="group" aria-label={label} className="flex flex-wrap items-center gap-1.5">
            {allowAuto && (
                <button type="button" onClick={() => onChange("auto")} aria-pressed={!value || value === "auto"} title={autoLabel}
                    className={`h-7 px-2.5 rounded-full border text-[11px] font-bold ${!value || value === "auto" ? "bg-[#1D1D7E] text-white border-[#1D1D7E]" : "bg-white text-slate-600 border-slate-300"}`}>
                    {autoLabel}
                </button>
            )}
            {colors.map((c) => (
                <button key={c.name} type="button" onClick={() => onChange(c.name)} aria-pressed={value === c.name} aria-label={c.label} title={c.label}
                    className={`${swatch} ${value === c.name ? "ring-2 ring-offset-1 ring-[#1D1D7E] border-transparent" : "border-slate-300"}`} style={{ background: c.bg }}>
                    {value === c.name && <Check size={13} className={c.dark ? "text-white" : "text-[#1D1D7E]"} />}
                </button>
            ))}
            <label title="Custom colour" className={`${swatch} relative overflow-hidden cursor-pointer ${custom ? "ring-2 ring-offset-1 ring-[#1D1D7E] border-transparent" : "border-slate-300"}`}
                style={{ background: custom || "conic-gradient(#f43f5e, #f59e0b, #22c55e, #06b6d4, #6366f1, #d946ef, #f43f5e)" }}>
                <span className="sr-only">Custom colour</span>
                <input type="color" value={custom || "#5db4d1"} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" aria-label={`${label}: custom colour`} />
            </label>
            {value && value !== "auto" && <span className="text-[11px] text-slate-500 ml-1">{BY_NAME[value]?.label || value}</span>}
        </div>
    );
}
