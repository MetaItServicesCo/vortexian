"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import RichText from "@/components/content/RichText";
import { mediaUrl } from "@/lib/api";
import { formatNewsDate, isVideo } from "@/lib/news";
import { TypeBadge } from "./NewsCard";

// Full update in a popup: closes with Esc, the X button or a click outside;
// locks page scroll and returns focus to where the reader was.
export default function NewsModal({ item, onClose }) {
    const closeRef = useRef(null);

    useEffect(() => {
        if (!item) return;
        const previouslyFocused = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        closeRef.current?.focus();

        const onKey = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = previousOverflow;
            previouslyFocused?.focus?.();
        };
    }, [item, onClose]);

    if (!item || typeof document === "undefined") return null;

    const posted = formatNewsDate(item.created_at);
    const eventDate = formatNewsDate(item.event_date);

    // Portal to <body>: the drawer uses a CSS transform, which would otherwise
    // trap this fixed overlay inside the drawer
    return createPortal(
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-6">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="news-modal-title"
                className="relative w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[85vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
                <div className="flex items-start justify-between gap-4 px-5 sm:px-7 pt-5 pb-4 border-b border-gray-100">
                    <div className="min-w-0">
                        <TypeBadge value={item.feed_type} />
                        <h2 id="news-modal-title" className="mt-2 text-xl sm:text-2xl font-bold text-[#111] leading-tight">
                            {item.title}
                        </h2>
                        <p className="mt-1 text-xs text-gray-500">
                            {[eventDate && `Event: ${eventDate}`, posted && `Posted ${posted}`, item.author && `by ${item.author}`].filter(Boolean).join(" · ")}
                        </p>
                    </div>
                    <button
                        ref={closeRef}
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D1D7E]"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto px-5 sm:px-7 py-5 space-y-5">
                    {item.media_url && (isVideo(item.media_url) ? (
                        <video src={mediaUrl(item.media_url)} controls className="w-full rounded-xl bg-black" />
                    ) : (
                        // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded image
                        <img src={mediaUrl(item.media_url)} alt={item.media_alt || item.title} className="w-full max-h-[50vh] object-contain rounded-xl bg-slate-50" />
                    ))}
                    <RichText html={item.description} className="text-[15px]" />
                </div>
            </div>
        </div>,
        document.body
    );
}
