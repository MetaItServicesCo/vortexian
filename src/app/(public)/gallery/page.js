import BreadcrumbHero from "@/components/BreadcrumbHero";
import AlbumCards from "@/components/gallery/AlbumCards";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import SchemaMarkup from "@/components/seo/SchemaMarkup";
import { getJson, getSection, pageMetadata } from "@/lib/content";

// Published photos and albums from Dashboard → Gallery; page text from Site Content → Gallery Page.
export const dynamic = "force-dynamic";

export async function generateMetadata() {
    return pageMetadata("page.gallery", "/gallery");
}

export default async function GalleryPage() {
    const [page, gallery] = await Promise.all([getSection("page.gallery"), getJson("/api/gallery/", { images: [], albums: [], categories: [] })]);
    const { images = [], albums = [], categories = [] } = gallery || {};

    return (
        <main className="bg-[#F6F9FC]">
            <SchemaMarkup sectionKey="page.gallery" path="/gallery" />
            <BreadcrumbHero title={page.hero_title} currentPage="Gallery" />

            <section className="max-w-[1240px] mx-auto px-5 sm:px-8 pt-16 md:pt-20 text-center">
                {page.intro_heading && <h2 className="text-3xl md:text-[2.6rem] font-bold text-[#0b0b2e] leading-tight tracking-tight">{page.intro_heading}</h2>}
                {page.intro_text && <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">{page.intro_text}</p>}
            </section>

            {albums.length > 0 && (
                <section className="max-w-[1240px] mx-auto px-5 sm:px-8 pt-14" aria-labelledby="albums-heading">
                    <h2 id="albums-heading" className="text-2xl font-bold text-[#0b0b2e] mb-6">{page.albums_heading || "Events & albums"}</h2>
                    <AlbumCards albums={albums} />
                </section>
            )}

            <section className="max-w-[1240px] mx-auto px-5 sm:px-8 pt-14 pb-20 md:pb-28" aria-labelledby="photos-heading">
                {albums.length > 0 && <h2 id="photos-heading" className="text-2xl font-bold text-[#0b0b2e] mb-6">{page.photos_heading || "All photos"}</h2>}
                <GalleryGrid images={images} categories={categories} />
            </section>
        </main>
    );
}
