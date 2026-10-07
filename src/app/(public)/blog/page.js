export const dynamic = "force-dynamic";
export const revalidate = 0;

import BlogHero from "@/components/blog/BlogHero";
import TrustedBy from "@/components/blog/TrustedBy";
import HeroBanner from "@/components/blog/HeroBanner";
import BlogGrid from "@/components/blog/BlogGrid";
import { serverApiUrl, SITE_URL } from "@/lib/api";
import { getSection } from "@/lib/content";

export async function generateMetadata() {
    const page = await getSection("page.blog");
    return {
        title: page.meta_title,
        description: page.meta_description,
        alternates: { canonical: "/blog" },
        openGraph: {
            title: page.meta_title,
            description: page.meta_description,
            url: "/blog",
            type: "website",
        },
    };
}

// ✅ SERVER SIDE API FETCH
async function getBlogs() {
    try {
        const res = await fetch(serverApiUrl("/api/blog/public"), {
            cache: "no-store",
        });

        if (!res.ok) {
            throw new Error("API failed");
        }

        const data = await res.json();

        // console.log("🔥 FULL RESPONSE:", data);

        return data;
    } catch (error) {
        console.log("API ERROR:", error);
        return [];
    }
}

export default async function BlogPage() {
    let blogs = [];

    try {
        blogs = await getBlogs();

    } catch (error) {
        console.log("Blog Fetch Error:", error);
        blogs = [];
    }

    // ✅ STRUCTURED DATA (SEO)
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "Vortexian Tech Blog",
        description: "Expert HR insights and hiring advice.",
        url: `${SITE_URL}/blog`,
    };

    return (
        <>
            {/* SEO JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(structuredData),
                }}
            />

            {/* HERO SECTION */}
            <BlogHero />
            <TrustedBy />

            {/* BLOG GRID */}
            <section className="bg-[#F6F6F8] py-16">
                <div className="max-w-7xl mx-auto px-5 lg:px-10">
                    <BlogGrid blogs={blogs} />
                </div>
            </section>

            {/* FOOTER BANNER */}
            <HeroBanner />
        </>
    );
}