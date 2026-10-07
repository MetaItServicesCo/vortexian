// Custom pages created under Dashboard → Pages (privacy policy, terms, …).
// Built-in routes like /about take precedence over this catch-all segment.
export const dynamic = "force-dynamic";

import { cache } from "react";
import { notFound } from "next/navigation";
import BreadcrumbHero from "@/components/BreadcrumbHero";
import RichText from "@/components/content/RichText";
import { serverApiUrl } from "@/lib/api";

const getPage = cache(async (slug) => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
    try {
        const res = await fetch(serverApiUrl(`/api/pages/slug/${slug}`), { cache: "no-store" });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
});

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const page = await getPage(slug);
    if (!page) return { title: "Page Not Found" };

    return {
        title: page.meta_title || page.title,
        description: page.meta_description || undefined,
        alternates: { canonical: `/${page.slug}` },
        openGraph: {
            title: page.meta_title || page.title,
            description: page.meta_description || undefined,
            url: `/${page.slug}`,
            type: "article",
        },
    };
}

export default async function CustomPage({ params }) {
    const { slug } = await params;
    const page = await getPage(slug);
    if (!page) notFound();

    const updated = page.updated_at
        ? new Date(page.updated_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
        : null;

    return (
        <>
            <BreadcrumbHero title={page.title} currentPage={page.title} />
            <section className="bg-white py-16 md:py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    {updated && (
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">
                            Last updated: {updated}
                        </p>
                    )}
                    <RichText html={page.content} className="text-[17px]" />
                </div>
            </section>
        </>
    );
}
