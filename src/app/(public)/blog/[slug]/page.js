import BreadcrumbHero from "@/components/BreadcrumbHero";
import { blogs } from "@/data/blogs";
import Image from "next/image";
import Link from "next/link";

export default async function BlogDetailPage({ params }) {
    // 1. Slug extract karein
    const { slug } = await params;

    // 2. Blog find karein
    const blog = blogs.find((b) => b.slug === slug);

    // 3. Agar blog nahi mila, toh 404 show karein
    if (!blog) {
        notFound();
    }

    return (
        <>
            {/* Breadcrumb mein dynamic blog title pass kiya gaya hai */}
            <BreadcrumbHero
                title={blog.title}
                currentPage={blog.title}
            />

            <main className="max-w-6xl mx-auto px-5 py-10">
                {/* ... baki ka code waisa hi rahega ... */}

                {/* HERO IMAGE */}
                <div className="relative w-full h-[400px] mb-8 rounded-2xl overflow-hidden">
                    <Image
                        src={blog.image || "/placeholder.jpg"}
                        alt={blog.title || "Blog Post"}
                        fill
                        className="object-cover"
                    />
                </div>

                {/* TITLE */}
                <h1 className="text-4xl font-bold text-gray-900 mb-10">
                    {blog.title}
                </h1>

                <div className="grid md:grid-cols-[300px_1fr] gap-10 items-start">
                    {/* SIDEBAR */}
                    <aside className="sticky top-45"> {/* top-45 ko top-24 ya 28 se replace karein taake header ke neeche rahe */}
                        <div className="bg-[#1a1a2e] p-6 rounded-2xl shadow-lg">
                            <h3 className="text-white font-bold text-xl mb-6">Connect With Us</h3>
                            <div className="flex flex-col gap-3">
                                <Link href="/hire-talent" className="bg-white text-[#1a1a2e] font-bold py-3 px-4 rounded text-center hover:bg-gray-100 transition">
                                    Hire Talent Now →
                                </Link>
                                <Link href="/find-job" className="bg-[#22c55e] text-white font-bold py-3 px-4 rounded text-center hover:bg-green-600 transition">
                                    Find Job Now →
                                </Link>
                            </div>
                        </div>
                    </aside>

                    {/* ARTICLE CONTENT */}
                    <article className="prose prose-lg max-w-none text-gray-700">
                        <div dangerouslySetInnerHTML={{ __html: blog.content || "<p>No content available.</p>" }} />
                        <p>
                            lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, doloremque? Doloribus, voluptate. Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, doloremque? Doloribus, voluptate.
                            lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, doloremque? Doloribus, voluptate. Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, doloremque? Doloribus, voluptate.
                            lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, doloremque? Doloribus, voluptate. Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, doloremque? Doloribus, voluptate.
                            lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, doloremque? Doloribus, voluptate. Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, doloremque? Doloribus, voluptate.
                            lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, doloremque? Doloribus, voluptate. Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, doloremque? Doloribus, voluptate.
                            lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, doloremque? Doloribus, voluptate. Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, doloremque? Doloribus, voluptate.
                            lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, doloremque? Doloribus, voluptate. Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, doloremque? Doloribus, voluptate.
                            lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, doloremque? Doloribus, voluptate. Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, doloremque? Doloribus, voluptate.

                        </p>
                    </article>
                </div>
            </main>
        </>
    );
}