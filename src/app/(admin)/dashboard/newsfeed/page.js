"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { adminFetch } from "@/lib/adminApi";
import { mediaUrl } from "@/lib/api";
import { formatNewsDate, isVideo, newsType } from "@/lib/news";

export default function NewsList() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    // Admin list includes drafts
    const load = () =>
        adminFetch("/api/newsfeed/admin/all").then(
            (data) => { setNews(data); setError(""); setLoading(false); },
            (err) => { setError(`News could not be loaded: ${err.message}`); setLoading(false); }
        );

    const fetchNews = () => {
        setLoading(true);
        load();
    };

    useEffect(() => {
        load();
    }, []);

    const handleDelete = async (item) => {
        if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
        try {
            setDeletingId(item.id);
            await adminFetch(`/api/newsfeed/${item.id}`, { method: "DELETE" });
            setNews((prev) => prev.filter((n) => n.id !== item.id));
            toast.success("Update deleted");
        } catch (err) {
            toast.error(`Could not delete: ${err.message}`);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <Toaster position="top-center" />
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">News Feed</h1>
                    <p className="text-sm text-gray-500 mt-1">Company updates and announcements shown in “News & Updates” and on /news.</p>
                </div>
                <Link href="/dashboard/newsfeed/create" className="bg-black text-white px-5 py-2 rounded-lg">
                    + Create New
                </Link>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-600 rounded flex justify-between items-center gap-4">
                    <span>{error}</span>
                    <button onClick={fetchNews} className="px-3 py-1 text-sm bg-white border border-red-200 rounded">Retry</button>
                </div>
            )}

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : error ? null : news.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No updates yet. Create the first one.</div>
            ) : (
                <div className="overflow-x-auto bg-white shadow rounded-lg">
                    <table className="w-full border-collapse">
                        <thead className="bg-gray-100 text-left text-sm">
                            <tr>
                                <th className="p-3">Media</th>
                                <th className="p-3">Title</th>
                                <th className="p-3">Type</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Posted</th>
                                <th className="p-3">Event date</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {news.map((item) => {
                                const type = newsType(item.feed_type);
                                const published = item.is_published !== false;
                                return (
                                    <tr key={item.id} className="border-b hover:bg-gray-50 align-middle">
                                        <td className="p-3">
                                            {item.media_url ? (
                                                isVideo(item.media_url) ? (
                                                    <span className="text-xs text-gray-500">Video</span>
                                                ) : (
                                                    // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
                                                    <img src={mediaUrl(item.media_url)} alt={item.media_alt || item.title} className="w-14 h-14 object-cover rounded" />
                                                )
                                            ) : (
                                                <span className="text-gray-300">—</span>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <div className="font-medium">{item.title}</div>
                                            <div className="text-xs text-gray-400">by {item.author || "Admin"}</div>
                                        </td>
                                        <td className="p-3">
                                            <span className={`text-xs px-2 py-1 rounded-full ${type.badge}`}>{type.label}</span>
                                        </td>
                                        <td className="p-3">
                                            <span className={`text-xs px-2 py-1 rounded-full ${published ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                                                {published ? "Published" : "Draft"}
                                            </span>
                                        </td>
                                        <td className="p-3 text-sm">{formatNewsDate(item.created_at) || "—"}</td>
                                        <td className="p-3 text-sm">{formatNewsDate(item.event_date) || "—"}</td>
                                        <td className="p-3">
                                            <div className="flex justify-end gap-2">
                                                {published && (
                                                    <a href={`/news?item=${item.id}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
                                                        View
                                                    </a>
                                                )}
                                                <Link href={`/dashboard/newsfeed/edit/${item.id}`} className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(item)}
                                                    disabled={deletingId === item.id}
                                                    className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                                                >
                                                    {deletingId === item.id ? "Deleting..." : "Delete"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
