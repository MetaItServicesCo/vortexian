"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Phone } from "lucide-react";
import { useContent, useSettings } from "@/components/content/SiteContentProvider";

// Bottom-left "call us" button (Site Content → Global → Floating call button).
// Uses its own number if set, otherwise the primary phone from Basic Info.
export default function FloatingCallButton() {
    const button = useContent("floating_call");
    const settings = useSettings();
    const reduceMotion = useReducedMotion();
    const number = (button.phone || settings.phone || "").trim();
    const dial = number.replace(/[^\d+]/g, "");
    if (!button.enabled || dial.replace(/\D/g, "").length < 6) return null;

    const label = button.label || "Call us";
    return (
        <motion.a
            href={`tel:${dial}`}
            aria-label={`${label}: ${number}`}
            title={`${label}: ${number}`}
            data-call-button=""
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="group fixed bottom-24 left-4 sm:left-6 z-50 flex items-center gap-3"
        >
            <span className="relative w-14 h-14 rounded-full bg-emerald-500 text-white shadow-[0_10px_25px_-6px_rgba(16,185,129,0.65)] flex items-center justify-center">
                {!reduceMotion && (
                    <motion.span aria-hidden="true" className="absolute inset-0 rounded-full bg-emerald-400"
                        animate={{ scale: [1, 1.5], opacity: [0.5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }} />
                )}
                <motion.span className="relative" aria-hidden="true"
                    animate={reduceMotion ? {} : { rotate: [0, -14, 14, -10, 10, 0, 0, 0] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>
                    <Phone size={24} fill="currentColor" strokeWidth={1.5} />
                </motion.span>
            </span>
            <span className="hidden sm:block pointer-events-none opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 transition bg-white text-slate-800 text-sm font-semibold rounded-full shadow-lg px-4 py-2 whitespace-nowrap">
                {label} · {number}
            </span>
        </motion.a>
    );
}
