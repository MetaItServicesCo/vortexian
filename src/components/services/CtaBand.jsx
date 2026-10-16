"use client";

import Link from "next/link";
import { ArrowRight, Phone, PhoneCall } from "lucide-react";
import { useSettings } from "@/components/content/SiteContentProvider";

// "Need help fast? We're one call away" band. The phone number defaults to Basic Info.
export default function CtaBand({ block }) {
    const settings = useSettings();
    const number = (block.phone || settings.phone || "").trim();
    const dial = number.replace(/[^\d+]/g, "");
    const showPhone = block.show_phone && dial.replace(/\D/g, "").length >= 6;
    const external = /^https?:\/\//i.test(block.button_link || "");
    const Button = external ? "a" : Link;

    return (
        <section className="relative overflow-hidden bg-gradient-to-r from-[#1D1D7E] via-[#262a8f] to-[#43165b] text-white" data-section="cta">
            <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full border-[40px] border-white/[0.04]" aria-hidden="true" />
            <div className="absolute -left-16 -bottom-24 w-72 h-72 rounded-full bg-[#5DB4D1]/10 blur-3xl" aria-hidden="true" />
            <div className="relative max-w-[1240px] mx-auto px-5 sm:px-8 py-16 md:py-20 grid lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-8">
                    {block.eyebrow && (
                        <p className="flex items-center gap-3 text-[#5DB4D1] font-bold">
                            <span className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><PhoneCall size={18} aria-hidden="true" /></span>
                            {block.eyebrow}
                        </p>
                    )}
                    {block.heading && <h2 className="mt-5 text-3xl md:text-5xl font-bold leading-tight tracking-tight">{block.heading}</h2>}
                    {block.text && <p className="mt-5 text-lg md:text-xl text-white/80 leading-relaxed whitespace-pre-line max-w-3xl">{block.text}</p>}
                </div>
                <div className="lg:col-span-4 flex flex-col gap-5 lg:items-end">
                    {showPhone && (
                        <a href={`tel:${dial}`} className="group inline-flex items-center gap-4" aria-label={`Call ${number}`}>
                            <span className="w-14 h-14 rounded-full bg-[#5DB4D1] text-[#0b0b2e] flex items-center justify-center shadow-lg group-hover:scale-105 transition"><Phone size={24} fill="currentColor" strokeWidth={1.5} /></span>
                            <span className="text-2xl md:text-3xl font-black text-[#5DB4D1] group-hover:text-white transition">{number}</span>
                        </a>
                    )}
                    {block.button_text && (
                        <Button href={block.button_link || "/contact"} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-[#1D1D7E] px-7 py-4 text-sm font-black uppercase tracking-widest hover:bg-[#5DB4D1] hover:text-[#0b0b2e] transition">
                            {block.button_text} <ArrowRight size={16} />
                        </Button>
                    )}
                </div>
            </div>
        </section>
    );
}
