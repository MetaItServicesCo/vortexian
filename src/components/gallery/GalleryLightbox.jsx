"use client";

import { useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { formatEventDate } from "@/components/gallery/format";

// Large preview of a gallery photo with Previous / Next / Close, arrow keys, Esc and swipe.
export default function GalleryLightbox({ images, index, onIndex, onClose }) {
    const image = images[index];
    const closeRef = useRef(null);
    const touch = useRef(null);
    const count = images.length;
    const go = useCallback((d) => onIndex((index + d + count) % count), [index, count, onIndex]);

    useEffect(() => {
        const opener = document.activeElement;
        closeRef.current?.focus();
        const overflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = overflow; opener?.focus?.(); };
    }, []);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") onClose();
            else if (e.key === "ArrowRight" && count > 1) go(1);
            else if (e.key === "ArrowLeft" && count > 1) go(-1);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [go, onClose, count]);

    // Preload the neighbours so Next / Previous feel instant
    useEffect(() => {
        if (count < 2) return;
        [images[(index + 1) % count], images[(index - 1 + count) % count]].forEach((img) => {
            const pre = new window.Image();
            pre.srcset = img.srcset;
            pre.sizes = "100vw";
        });
    }, [index, images, count]);

    if (!image) return null;
    const meta = [image.event_name, formatEventDate(image.event_date)].filter(Boolean).join(" · ");

    return (
        <div role="dialog" aria-modal="true" aria-label={image.title} data-gallery-lightbox=""
            className="fixed inset-0 z-[2147483000] bg-[#06061a]/95 flex flex-col"
            onClick={(e) => e.target === e.currentTarget && onClose()}
            onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
                if (touch.current == null || count < 2) return;
                const dx = e.changedTouches[0].clientX - touch.current;
                if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
                touch.current = null;
            }}>
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 text-white/80 text-sm">
                <span aria-live="polite">{count > 1 ? `${index + 1} / ${count}` : ""}</span>
                <button ref={closeRef} type="button" onClick={onClose} aria-label="Close"
                    className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
                    <X size={22} />
                </button>
            </div>
            <div className="relative flex-1 min-h-0 flex items-center justify-center px-2 sm:px-16" onClick={(e) => e.target === e.currentTarget && onClose()}>
                {/* eslint-disable-next-line @next/next/no-img-element -- responsive WebP set from the gallery */}
                <img key={image.id} src={image.full} srcSet={image.srcset} sizes="100vw" alt={image.alt}
                    width={image.width || undefined} height={image.height || undefined}
                    className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-2xl" />
                {count > 1 && (
                    <>
                        <button type="button" onClick={() => go(-1)} aria-label="Previous photo"
                            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
                            <ChevronLeft size={26} />
                        </button>
                        <button type="button" onClick={() => go(1)} aria-label="Next photo"
                            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
                            <ChevronRight size={26} />
                        </button>
                    </>
                )}
            </div>
            <div className="px-4 sm:px-6 py-4 text-center text-white max-w-3xl mx-auto">
                <p className="font-bold text-lg">{image.title}</p>
                {image.caption && <p className="mt-1 text-white/75 text-sm">{image.caption}</p>}
                {meta && <p className="mt-1 text-[#5DB4D1] text-xs font-semibold uppercase tracking-wider">{meta}</p>}
            </div>
        </div>
    );
}
