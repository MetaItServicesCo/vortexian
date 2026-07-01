import BlogHero from "@/components/blog/BlogHero";
import TrustedBy from "@/components/blog/TrustedBy";
import HeroBanner from "@/components/blog/HeroBanner";
import BlogGrid from "@/components/blog/BlogGrid";

export const metadata = {
    title: "Blog | Latest Insights & Articles — TIGI HR",
    description:
        "Read the latest blogs from TIGI HR. Expert insights on hiring, talent acquisition, HR strategies, and career growth.",
    keywords:
        "HR blog, hiring tips, talent acquisition, recruitment, career advice, TIGI HR",
    openGraph: {
        title: "Blog | TIGI HR",
        description:
            "Expert HR insights, hiring tips, and career advice from TIGI HR.",
        type: "website",
    },
};

// ✅ SERVER SIDE API FETCH
async function getBlogs() {
    try {
        const res = await fetch("/api/blog/public", {
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
        name: "TIGI HR Blog",
        description: "Expert HR insights and hiring advice.",
        url: "https://tigihr.com/blog",
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