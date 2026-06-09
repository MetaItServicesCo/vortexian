import BlogHero from "@/components/blog/BlogHero";
import BlogGrid from "@/components/blog/BlogGrid";
import TrustedBy from "@/components/blog/TrustedBy";
import HeroBanner from "@/components/blog/HeroBanner";

import { blogs } from "@/data/blogs"; // ✅ IMPORT FROM CENTRAL FILE

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

const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "TIGI HR Blog",
    description: "Expert HR insights and hiring advice.",
    url: "https://tigihr.com/blog",
};

export default function BlogPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(structuredData),
                }}
            />

            <BlogHero />
            <TrustedBy />

            <section className="bg-[#F6F6F8] py-16">
                <div className="max-w-7xl mx-auto px-5 lg:px-10">

                    {/* ✅ NOW COMES FROM CENTRAL FILE */}
                    <BlogGrid blogs={blogs} />

                </div>
            </section>

            <HeroBanner />
        </>
    );
}