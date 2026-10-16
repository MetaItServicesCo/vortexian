"use client";

import { useState } from "react";
import GalleryLightbox from "@/components/gallery/GalleryLightbox";
import { formatEventDate } from "@/components/gallery/format";

// Filterable masonry grid of gallery photos (whole photos, original proportions) that open in a lightbox.
// Used on /gallery, on album pages and as the dashboard preview (drafts marked).
export default function GalleryGrid({ images = [], categories = [], showFilters = true, preview = false }) {
    const [filter, setFilter] = useState("all");
    const [open, setOpen] = useState(null);
    const used = new Set(images.map((i) => i.category));
    const filters = categories.filter((c) => used.has(c.name));
    const shown = filter === "all" ? images : images.filter((i) => i.category === filter);

    if (!images.length) {
        return <p className="py-16 text-center text-slate-500">{preview ? "No photos yet." : "New photos are coming soon."}</p>;
    }

    return (
        <div>
            {showFilters && filters.length > 1 && (
                <div role="group" aria-label="Filter photos by category" className="flex flex-wrap justify-center gap-2.5 mb-10" data-gallery-filters="">
                    {[{ name: "all", label: "All" }, ...filters.map((c) => ({ name: c.name, label: c.name }))].map((f) => (
                        <button key={f.name} type="button" onClick={() => setFilter(f.name)} aria-pressed={filter === f.name}
                            className={`px-5 py-2.5 rounded-full text-sm font-bold transition ${filter === f.name
                                ? "bg-[#1D1D7E] text-white shadow-md"
                                : "bg-white text-slate-600 border border-slate-200 hover:border-[#1D1D7E] hover:text-[#1D1D7E]"}`}>
                            {f.label}
                        </button>
                    ))}
                </div>
            )}

            <ul className="columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance]" data-gallery-grid="">
                {shown.map((image, i) => {
                    const meta = [image.event_name, formatEventDate(image.event_date)].filter(Boolean).join(" · ");
                    return (
                        <li key={image.id} className="break-inside-avoid mb-6" data-gallery-item={image.id}>
                            <figure className="group rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-[0_20px_40px_-20px_rgba(29,29,126,0.35)] transition">
                                <button type="button" onClick={() => setOpen(i)} className="relative block w-full bg-slate-100 focus-visible:outline focus-visible:outline-4 focus-visible:outline-[#5DB4D1]"
                                    aria-label={`Open “${image.title}”`}>
                                    {/* eslint-disable-next-line @next/next/no-img-element -- responsive WebP set from the gallery */}
                                    <img src={image.src} srcSet={image.srcset} sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                                        alt={image.alt} width={image.width || undefined} height={image.height || undefined}
                                        loading={i < 6 ? "eager" : "lazy"} decoding="async"
                                        className="block w-full h-auto transition duration-500 group-hover:scale-[1.02]" />
                                    {preview && !image.is_published && (
                                        <span className="absolute top-3 left-3 rounded-full bg-amber-400 text-[#0b0b2e] text-[11px] font-black uppercase tracking-wider px-2.5 py-1">Draft</span>
                                    )}
                                </button>
                                <figcaption className="px-5 py-4">
                                    <p className="font-bold text-[#0b0b2e] leading-snug">{image.title}</p>
                                    {image.caption && <p className="mt-1 text-sm text-slate-600 leading-relaxed">{image.caption}</p>}
                                    {meta && <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-[#2b7fa0]">{meta}</p>}
                                </figcaption>
                            </figure>
                        </li>
                    );
                })}
            </ul>

            {open !== null && <GalleryLightbox images={shown} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
        </div>
    );
}
