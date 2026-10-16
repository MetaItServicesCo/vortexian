"use client";

import Link from "next/link";
import { ArrowRight, Phone, PhoneCall } from "lucide-react";
import { useSettings } from "@/components/content/SiteContentProvider";
import { resolveColor } from "@/lib/designPalette";

const PAD = { compact: "py-12 md:py-14", normal: "py-16 md:py-20", spacious: "py-24 md:py-28" };

// "Need help fast? We're one call away" band. The phone number defaults to Basic Info.
export default function CtaBand({ block }) {
    const settings = useSettings();
    const number = (block.phone || settings.phone || "").trim();
    const dial = number.replace(/[^\d+]/g, "");
    const showPhone = block.show_phone && dial.replace(/\D/g, "").length >= 6;
    const external = /^https?:\/\//i.test(block.button_link || "");
    const Button = external ? "a" : Link;
    const design = block.design || {};
    const bg = resolveColor(design.background) || resolveColor("gradient");   // default: navy → purple
    const light = !bg.dark;
    const accent = resolveColor(design.accent);
    const accentColor = accent?.background?.startsWith("#") ? accent.background : light ? "#1D1D7E" : "#5DB4D1";

    return (
        <section className={`relative overflow-hidden ${light ? "text-[#0b0b2e]" : "text-white"}`} style={{ background: bg.background }} data-section="cta">
            <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full border-[40px] border-white/[0.04]" aria-hidden="true" />
            <div className="absolute -left-16 -bottom-24 w-72 h-72 rounded-full bg-[#5DB4D1]/10 blur-3xl" aria-hidden="true" />
            <div className={`relative max-w-[1240px] mx-auto px-5 sm:px-8 ${PAD[design.spacing] || PAD.normal} grid lg:grid-cols-12 gap-10 items-center`}>
                <div className="lg:col-span-8">
                    {block.eyebrow && (
                        <p className="flex items-center gap-3 font-bold" style={{ color: accentColor }}>
                            <span className={`w-10 h-10 rounded-full flex items-center justify-center ${light ? "bg-white/70" : "bg-white/10"}`}><PhoneCall size={18} aria-hidden="true" /></span>
                            {block.eyebrow}
                        </p>
                    )}
                    {block.heading && <h2 className="mt-5 text-3xl md:text-5xl font-bold leading-tight tracking-tight">{block.heading}</h2>}
                    {block.text && <p className={`mt-5 text-lg md:text-xl leading-relaxed whitespace-pre-line max-w-3xl ${light ? "text-slate-700" : "text-white/80"}`}>{block.text}</p>}
                </div>
                <div className="lg:col-span-4 flex flex-col gap-5 lg:items-end">
                    {showPhone && (
                        <a href={`tel:${dial}`} className="group inline-flex items-center gap-4" aria-label={`Call ${number}`}>
                            <span className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition" style={{ background: accentColor, color: light ? "#ffffff" : "#0b0b2e" }}><Phone size={24} fill="currentColor" strokeWidth={1.5} /></span>
                            <span className="text-2xl md:text-3xl font-black transition group-hover:opacity-80" style={{ color: accentColor }}>{number}</span>
                        </a>
                    )}
                    {block.button_text && (
                        <Button href={block.button_link || "/contact"} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                            className={`inline-flex items-center justify-center gap-2 rounded-xl px-7 py-4 text-sm font-black uppercase tracking-widest transition ${light ? "bg-[#1D1D7E] text-white hover:bg-[#5DB4D1] hover:text-[#0b0b2e]" : "bg-white text-[#1D1D7E] hover:bg-[#5DB4D1] hover:text-[#0b0b2e]"}`}>
                            {block.button_text} <ArrowRight size={16} />
                        </Button>
                    )}
                </div>
            </div>
        </section>
    );
}
