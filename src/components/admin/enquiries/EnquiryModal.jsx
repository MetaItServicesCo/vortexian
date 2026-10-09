"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Copy, ExternalLink, Mail, Phone, Trash2, X } from "lucide-react";
import { mediaUrl } from "@/lib/api";
import { normalizeHref } from "@/lib/links";

export const formatReceived = (iso) =>
    iso ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : null;

const empty = <span className="text-slate-400 italic">Not provided</span>;

function Value({ field }) {
    const v = typeof field.value === "string" ? field.value.trim() : field.value;
    if (!v) return field.type === "date" ? <span className="text-slate-400 italic">Not recorded</span> : empty;
    switch (field.type) {
        case "email":
            return <a href={`mailto:${v}`} className="text-[#1D1D7E] underline underline-offset-2 break-all">{v}</a>;
        case "phone":
            return <a href={`tel:${v.replace(/[^\d+]/g, "")}`} className="text-[#1D1D7E] underline underline-offset-2">{v}</a>;
        case "url": {
            const href = normalizeHref(v);
            return href ? (
                <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 text-[#1D1D7E] underline underline-offset-2 break-all">
                    {v} <ExternalLink size={12} className="shrink-0" />
                </a>
            ) : v;
        }
        case "file":
            return (
                <a href={mediaUrl(v)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#1D1D7E] underline underline-offset-2">
                    Open attached file <ExternalLink size={12} />
                </a>
            );
        case "date":
            return formatReceived(v);
        case "multiline":
            return <p className="whitespace-pre-wrap break-words leading-relaxed">{v}</p>;
        default:
            return <span className="break-words">{v}</span>;
    }
}

/**
 * Full details of a form submission (home page enquiry or quote request).
 * fields: [{ label, value, type?: "text"|"email"|"phone"|"url"|"file"|"date"|"multiline", wide?: boolean }]
 */
export default function EnquiryModal({ open, title, subtitle, fields, email, phone, replySubject, onClose, onDelete }) {
    const [copied, setCopied] = useState(false);
    const closeRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const previous = document.activeElement;
        const onKey = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        const overflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        closeRef.current?.focus();
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = overflow;
            previous?.focus?.();
        };
    }, [open, onClose]);

    if (!open || typeof document === "undefined") return null;

    const copyAll = async () => {
        const text = [title, ...fields.map((f) => `${f.label}: ${(f.type === "date" ? formatReceived(f.value) : f.value) || "—"}`)].join("\n");
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // clipboard blocked: nothing else to do
        }
    };

    const action = "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition";

    return createPortal(
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-slate-900/50 sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="enquiry-title"
                className="w-full sm:max-w-2xl max-h-[92vh] flex flex-col bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl"
            >
                <div className="flex items-start gap-3 px-6 pt-5 pb-4 border-b border-gray-100">
                    <div className="min-w-0 flex-1">
                        <h2 id="enquiry-title" className="text-lg font-bold text-slate-900 break-words">{title}</h2>
                        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
                    </div>
                    <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="p-2 -m-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                        <X size={18} />
                    </button>
                </div>

                <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2 px-6 py-5 overflow-y-auto">
                    {fields.map((field) => (
                        <div key={field.label} className={field.wide ? "sm:col-span-2" : ""} data-testid={`enquiry-field-${field.label}`}>
                            <dt className="text-[11px] font-black uppercase tracking-wider text-slate-400">{field.label}</dt>
                            <dd className={`mt-1 text-[15px] text-slate-800 ${field.type === "multiline" ? "rounded-xl bg-slate-50 border border-slate-100 p-3" : ""}`}>
                                <Value field={field} />
                            </dd>
                        </div>
                    ))}
                </dl>

                <div className="flex flex-wrap items-center gap-2 px-6 py-4 border-t border-gray-100">
                    {email && (
                        <a href={`mailto:${email}?subject=${encodeURIComponent(`Re: ${replySubject || "Your enquiry"}`)}`} className={`${action} bg-[#1D1D7E] text-white hover:bg-[#16166a]`}>
                            <Mail size={15} /> Reply by email
                        </a>
                    )}
                    {phone && (
                        <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className={`${action} border border-gray-200 text-slate-700 hover:bg-slate-50`}>
                            <Phone size={15} /> Call
                        </a>
                    )}
                    <button type="button" onClick={copyAll} className={`${action} border border-gray-200 text-slate-700 hover:bg-slate-50`}>
                        {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? "Copied" : "Copy details"}
                    </button>
                    {onDelete && (
                        <button type="button" onClick={onDelete} className={`${action} ml-auto text-red-600 hover:bg-red-50`}>
                            <Trash2 size={15} /> Delete
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
