"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import BlogForm from "@/components/admin/blog/BlogForm";
import { adminFetch } from "@/lib/adminApi";

export default function EditBlogPage() {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        adminFetch(`/api/blog/${id}`).then(setBlog).catch((err) => setError(err.message));
    }, [id]);

    if (error) {
        return (
            <div className="max-w-6xl mx-auto p-8 space-y-3">
                <p className="text-red-600">Could not load this post: {error}</p>
                <Link href="/dashboard/blog" className="text-[#1D1D7E] font-semibold">Back to Blog</Link>
            </div>
        );
    }

    if (!blog) return <div className="max-w-6xl mx-auto p-8 text-gray-500">Loading...</div>;

    // key: remount with the loaded post so every field starts from saved values
    return <BlogForm key={blog.id} initial={blog} />;
}
