import Link from "next/link";
import { Images } from "lucide-react";
import { formatEventDate } from "@/components/gallery/format";

// Event albums: cover (whole photo, never cropped), title, date and number of photos; each opens /gallery/<slug>.
export default function AlbumCards({ albums = [], linkable = true }) {
    if (!albums.length) return null;
    return (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-gallery-albums="">
            {albums.map((a) => {
                const body = (
                    <>
                        <div className="relative overflow-hidden bg-slate-100 min-h-[10rem] flex items-center justify-center">
                            {a.cover && (
                                // eslint-disable-next-line @next/next/no-img-element -- responsive WebP set from the gallery
                                <img src={a.cover.src} srcSet={a.cover.srcset} sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                                    alt={a.cover.alt} width={a.cover.width || undefined} height={a.cover.height || undefined} loading="lazy" decoding="async"
                                    className="block w-full h-auto max-h-[22rem] object-contain transition duration-500 group-hover:scale-[1.03]" />
                            )}
                            <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 text-[#1D1D7E] text-xs font-bold px-3 py-1.5 shadow">
                                <Images size={14} aria-hidden="true" /> {a.count} photo{a.count === 1 ? "" : "s"}
                            </span>
                            {a.is_published === false && <span className="absolute top-3 left-3 rounded-full bg-amber-400 text-[#0b0b2e] text-[11px] font-black uppercase tracking-wider px-2.5 py-1">Draft</span>}
                        </div>
                        <div className="p-5">
                            {a.event_date && <p className="text-[11px] font-bold uppercase tracking-wider text-[#2b7fa0]">{formatEventDate(a.event_date)}</p>}
                            <h3 className="mt-1 text-lg font-bold text-[#0b0b2e] leading-snug">{a.title}</h3>
                            {a.description && <p className="mt-1.5 text-sm text-slate-600 line-clamp-2">{a.description}</p>}
                        </div>
                    </>
                );
                return (
                    <li key={a.id} className="group rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-[0_20px_40px_-20px_rgba(29,29,126,0.35)] transition" data-album={a.slug}>
                        {linkable ? <Link href={`/gallery/${a.slug}`} className="block h-full">{body}</Link> : body}
                    </li>
                );
            })}
        </ul>
    );
}
