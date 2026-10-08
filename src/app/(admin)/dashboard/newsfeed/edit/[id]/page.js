"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import NewsFeedForm from "@/components/admin/news/NewsFeedForm";
import { adminFetch } from "@/lib/adminApi";

export default function EditNewsFeed() {
    const { id } = useParams();
    const [news, setNews] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        // Admin endpoint: drafts load too
        adminFetch(`/api/newsfeed/admin/${id}`).then(setNews).catch((err) => setError(err.message));
    }, [id]);

    if (error) {
        return (
            <div className="max-w-3xl mx-auto space-y-3">
                <p className="text-red-600">Could not load this update: {error}</p>
                <Link href="/dashboard/newsfeed" className="text-[#1D1D7E] font-semibold">Back to News Feed</Link>
            </div>
        );
    }

    if (!news) return <div className="max-w-3xl mx-auto text-gray-500">Loading...</div>;

    return <NewsFeedForm key={news.id} initial={news} />;
}
