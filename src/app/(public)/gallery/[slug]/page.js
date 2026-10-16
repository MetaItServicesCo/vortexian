import { notFound } from "next/navigation";
import { CalendarDays, Images } from "lucide-react";
import BreadcrumbHero from "@/components/BreadcrumbHero";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import { formatEventDate } from "@/components/gallery/format";
import { serverApiUrl, SITE_URL } from "@/lib/api";

// One event album (Dashboard → Gallery → Albums). Only published albums and photos are shown.
export const dynamic = "force-dynamic";

async function getAlbum(slug) {
    let key = slug;
    try { key = decodeURIComponent(slug); } catch { /* keep as is */ }
    const res = await fetch(serverApiUrl(`/api/gallery/albums/${encodeURIComponent(key)}`), { cache: "no-store" }).catch(() => null);
    return res?.ok ? res.json() : null;
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const data = await getAlbum(slug);
    if (!data) return { title: "Album not found | Vortexian Tech" };
    const { album } = data;
    const title = `${album.title} | Gallery | Vortexian Tech`;
    const description = album.description || `Photos from ${album.title} at Vortexian Tech.`;
    return {
        title,
        description: description.slice(0, 160),
        alternates: { canonical: `/gallery/${album.slug}` },
        openGraph: { title, description, url: `/gallery/${album.slug}`, images: album.cover ? [{ url: album.cover.src }] : [] },
    };
}

export default async function AlbumPage({ params }) {
    const { slug } = await params;
    const data = await getAlbum(slug);
    if (!data) notFound();
    const { album, images } = data;
    const schema = {
        "@context": "https://schema.org",
        "@type": "ImageGallery",
        name: album.title,
        description: album.description || undefined,
        url: `${SITE_URL}/gallery/${album.slug}`,
        image: images.slice(0, 20).map((i) => ({ "@type": "ImageObject", contentUrl: `${SITE_URL}${i.full}`, name: i.title, caption: i.caption || i.alt })),
    };

    return (
        <main className="bg-[#F6F9FC]">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
            <BreadcrumbHero title={album.title.toUpperCase()} currentPage={album.title} trail={[{ label: "Gallery", href: "/gallery" }]} />
            <section className="max-w-[1240px] mx-auto px-5 sm:px-8 pt-14 md:pt-16">
                <div className="max-w-3xl">
                    <p className="flex flex-wrap items-center gap-4 text-sm font-bold text-[#2b7fa0]">
                        {album.event_date && <span className="inline-flex items-center gap-1.5"><CalendarDays size={16} aria-hidden="true" /> {formatEventDate(album.event_date)}</span>}
                        <span className="inline-flex items-center gap-1.5"><Images size={16} aria-hidden="true" /> {album.count} photo{album.count === 1 ? "" : "s"}</span>
                    </p>
                    {album.description && <p className="mt-4 text-lg text-slate-600 leading-relaxed whitespace-pre-line">{album.description}</p>}
                </div>
            </section>
            <section className="max-w-[1240px] mx-auto px-5 sm:px-8 pt-10 pb-20 md:pb-28">
                <GalleryGrid images={images} showFilters={false} />
            </section>
        </main>
    );
}
