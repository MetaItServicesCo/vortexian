"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function NewsList() {
    const [news, setNews] = useState([]);

    useEffect(() => {
        // Fetch from local storage on component mount
        const data = JSON.parse(localStorage.getItem("news_feed") || "[]");
        setNews(data);
    }, []);

    return (
        <div className="max-w-5xl mx-auto p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">News Feed</h1>
                <Link 
                    href="/dashboard/newsfeed/create" 
                    className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
                >
                    + Create New
                </Link>
            </div>

            <div className="space-y-6">
                {news.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed rounded-xl text-gray-500">
                        No news found. Create your first post!
                    </div>
                ) : (
                    news.map((item) => (
                        <div key={item.id} className="p-6 border border-gray-100 rounded-xl shadow-sm bg-white hover:shadow-md transition">
                            <div className="text-xs font-semibold text-indigo-500 mb-2 uppercase tracking-wider">
                                {item.date}
                            </div>
                            <div 
                                className="text-gray-700 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: item.content }} 
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}