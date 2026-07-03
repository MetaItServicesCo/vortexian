"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function NewsList() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    const fetchNews = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await fetch(`${API_BASE_URL}/api/newsfeed/`);
            if (!res.ok) throw new Error(`Error ${res.status}`);
            const data = await res.json();
            setNews(data);
        } catch (err) {
            setError("Unable to load the news feed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this news feed?")) return;
        try {
            setDeletingId(id);
            const token = localStorage.getItem("token");

            const res = await fetch(`${API_BASE_URL}/api/newsfeed/${id}`, {
                method: "DELETE",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            if (!res.ok) throw new Error(`Error ${res.status}`);

            setNews((prev) => prev.filter((item) => item.id !== id));
        } catch (err) {
            alert("Unable to delete the item. Please try again.");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-8">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">News Feed Table</h1>

                <Link
                    href="/dashboard/newsfeed/create"
                    className="bg-black text-white px-5 py-2 rounded-lg"
                >
                    + Create New
                </Link>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-600 rounded">
                    {error}
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : news.length === 0 ? (
                <div className="text-center py-10">No data found</div>
            ) : (
                <div className="overflow-x-auto bg-white shadow rounded-lg">
                    <table className="w-full border-collapse">

                        {/* Table Head */}
                        <thead className="bg-gray-100 text-left text-sm">
                            <tr>
                                <th className="p-3">#</th>
                                <th className="p-3">Title</th>
                                <th className="p-3">Type</th>
                                <th className="p-3">Author</th>
                                <th className="p-3">Date</th>
                                <th className="p-3">Image</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>

                        {/* Table Body */}
                        <tbody>
                            {news.map((item, index) => (
                                <tr key={item.id} className="border-b hover:bg-gray-50">

                                    {/* Index */}
                                    <td className="p-3">{index + 1}</td>

                                    {/* Title */}
                                    <td className="p-3 font-medium">
                                        {item.title}
                                    </td>

                                    {/* Type */}
                                    <td className="p-3 text-indigo-600">
                                        {item.feed_type}
                                    </td>

                                    {/* Author */}
                                    <td className="p-3">
                                        {item.author || "-"}
                                    </td>

                                    {/* Date */}
                                    <td className="p-3">
                                        {item.event_date || "-"}
                                    </td>

                                    {/* Image */}
                                    <td className="p-3">
                                        {item.media_url ? (
                                            <img
                                                src={`${API_BASE_URL}${item.media_url}`}
                                                alt="img"
                                                className="w-14 h-14 object-cover rounded"
                                            />
                                        ) : (
                                            "-"
                                        )}
                                    </td>

                                    {/* Action */}
                                    <td className="p-3">
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            disabled={deletingId === item.id}
                                            className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                                        >
                                            {deletingId === item.id ? "Deleting..." : "Delete"}
                                        </button>
                                    </td>

                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>
            )}
        </div>
    );
}