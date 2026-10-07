export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { notFound } from "next/navigation";
import BreadcrumbHero from "@/components/BreadcrumbHero";
import HeroBanner from "@/components/blog/HeroBanner";
import { serverApiUrl } from "@/lib/api";
import RichText from "@/components/content/RichText";

async function getBlog(id) {
    const res = await fetch(serverApiUrl(`/api/blog/${encodeURIComponent(id)}`), {
        cache: "no-store",
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Failed to fetch blog");
    return res.json();
}

function getImageUrl(img) {
    if (!img) return "/placeholder.jpg";
    if (img.startsWith("http")) return img;
    return `${img}`;
}

export async function generateMetadata({ params }) {
    const { id } = await params;
    const blog = await getBlog(id);
    if (!blog) return { title: "Blog Not Found" };
    return {
        title: blog.meta_title || blog.title,
        description: blog.meta_description || blog.excerpt,
        openGraph: {
            title: blog.meta_title || blog.title,
            description: blog.meta_description || blog.excerpt,
            images: blog.featured_image ? [getImageUrl(blog.featured_image)] : [],
        },
    };
}

export default async function BlogDetailPage({ params }) {
    const { id } = await params;
    const blog = await getBlog(id);
    if (!blog) notFound();

    return (
        <>
            <BreadcrumbHero title="Blog" currentPage={blog.title} />

            <main className="max-w-5xl mx-auto px-5 py-10">

                {/* ── FEATURED IMAGE ─────────────────────────────────── */}
                <div className="w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden mb-7">
                    <img
                        src={getImageUrl(blog.featured_image)}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* ── TITLE ──────────────────────────────────────────── */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-snug">
                    {blog.title}
                </h1>

                <hr className="border-gray-200 mb-7" />

                {/* ── TWO COLUMN LAYOUT (items-start is important here) ── */}
                <div className="flex flex-col md:flex-row gap-8 items-start">

                    {/* ── LEFT SIDEBAR (sticky top-24) ────────────────── */}
                    <aside className="w-full md:w-[280px] flex-shrink-0 sticky top-46">

                        {/* Connect With Us card */}
                        <div className="bg-[#1D1D7E] rounded-xl p-5 text-center">
                            <h3 className="text-white font-bold text-base mb-4">
                                Connect With Us
                            </h3>

                            <Link
                                href="/contact"
                                className="flex items-center justify-center gap-2 bg-white text-[#1D1D7E] font-semibold text-sm px-4 py-2.5 rounded-lg mb-3 hover:bg-gray-100 transition-colors w-full"
                            >
                                Hire Talent Now
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </Link>

                            <Link
                                href="/career"
                                className="flex items-center justify-center gap-2 bg-[#22c55e] text-white font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-[#16a34a] transition-colors w-full"
                            >
                                Find Job Now
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>

                        {/* Author + Category info */}
                        {(blog.author || blog.category) && (
                            <div className="mt-5 bg-gray-50 rounded-xl p-4 space-y-3">
                                {blog.author && (
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Author</p>
                                        <p className="text-sm font-semibold text-gray-800">{blog.author}</p>
                                    </div>
                                )}
                                {blog.category && (
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Category</p>
                                        <span className="inline-block text-xs font-semibold bg-[#1D1D7E]/10 text-[#1D1D7E] px-2.5 py-1 rounded-full">
                                            {blog.category}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="mt-5">
                            <Link href="/blog" className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1D1D7E] transition-colors font-medium">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 12H5M12 5l-7 7 7 7" />
                                </svg>
                                Back to Blogs
                            </Link>
                        </div>
                    </aside>

                    {/* ── RIGHT CONTENT (Scrollable) ──────────────────── */}

                    {/* Right side container se fixed height aur max-w hata dein */}
                    {/* ── RIGHT CONTENT ─────────────────────────────────── */}
                    <div className="flex-1 min-w-0 w-full overflow-hidden">
                        <article>
                            <RichText html={blog.content} className="text-[17px]" />
                        </article>
                    </div>
                </div>

            </main>
            <HeroBanner />

        </>
    );
}