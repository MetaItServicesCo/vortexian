import BreadcrumbHero from "@/components/BreadcrumbHero";
import NewsFeed from "@/components/NewsFeed";
import { getSection, pageMetadata } from "@/lib/content";

export const dynamic = "force-dynamic";

export function generateMetadata() {
    return pageMetadata("page.news", "/news");
}

export default async function NewsPage({ searchParams }) {
    const [page, intro, params] = await Promise.all([getSection("page.news"), getSection("news.intro"), searchParams]);

    return (
        <main>
            <BreadcrumbHero title={page.hero_title} currentPage={page.hero_title} />
            <section className="bg-slate-50 py-14 md:py-20 px-5 md:px-10">
                <div className="max-w-7xl mx-auto">
                    {intro.text && <p className="text-gray-600 max-w-2xl mb-10 text-[15px] md:text-base">{intro.text}</p>}
                    {/* ?item=<id> opens that update in the popup (used by "View" in the admin) */}
                    <NewsFeed layout="grid" openItemId={params?.item} />
                </div>
            </section>
        </main>
    );
}
