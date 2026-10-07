"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("@/components/editor/RichTextEditor"), { ssr: false });

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function EditNewsFeed() {
    const { id } = useParams();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [title, setTitle] = useState("");
    const [feedType, setFeedType] = useState("");
    const [description, setDescription] = useState("");
    const [author, setAuthor] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [file, setFile] = useState(null);
    const [existingMediaUrl, setExistingMediaUrl] = useState("");

    // ---------------- FETCH EXISTING NEWS FEED ----------------
    useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoading(true);
                setError("");

                const res = await fetch(`${API_BASE_URL}/api/newsfeed/${id}`);
                if (!res.ok) throw new Error(`Error ${res.status}`);

                const data = await res.json();

                setTitle(data.title || "");
                setFeedType(data.feed_type || "");
                setDescription(data.description || "");
                setAuthor(data.author || "");
                setEventDate(data.event_date || "");
                setExistingMediaUrl(data.media_url || "");
            } catch (err) {
                setError("News feed load nahi ho saka. Dobara try karein.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchNews();
    }, [id]);

    // ---------------- UPDATE NEWS FEED ----------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            setSubmitting(true);
            const token = localStorage.getItem("token");

            const formData = new FormData();
            formData.append("title", title);
            formData.append("feed_type", feedType);
            formData.append("description", description);
            formData.append("author", author);
            formData.append("event_date", eventDate);
            if (file) {
                formData.append("file", file);
            }

            const res = await fetch(`${API_BASE_URL}/api/newsfeed/${id}`, {
                method: "PUT",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formData,
            });

            if (!res.ok) throw new Error(`Error ${res.status}`);

            router.push("/dashboard/newsfeed");
        } catch (err) {
            setError("Update nahi ho saka. Dobara try karein.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="text-center py-10">Loading...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto p-8">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Edit News Feed</h1>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-600 rounded">
                    {error}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="bg-white shadow rounded-lg p-6 space-y-5"
            >
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Title
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full border rounded-lg px-3 py-2"
                    />
                </div>

                {/* Feed Type */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Feed Type
                    </label>
                    <select
                        value={feedType}
                        onChange={(e) => setFeedType(e.target.value)}
                        required
                        className="w-full border rounded-lg px-3 py-2"
                    >
                        <option value="">Select type</option>
                        <option value="news">News</option>
                        <option value="event">Event</option>
                        <option value="announcement">Announcement</option>
                    </select>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Description
                    </label>
                    <RichTextEditor
                        value={description}
                        onChange={setDescription}
                        allowVideo
                    />
                </div>

                {/* Author */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Author
                    </label>
                    <input
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        required
                        className="w-full border rounded-lg px-3 py-2"
                    />
                </div>

                {/* Event Date */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Event Date
                    </label>
                    <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2"
                    />
                </div>

                {/* Existing Image */}
                {existingMediaUrl && (
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Current Image
                        </label>
                        <img
                            src={`${API_BASE_URL}${existingMediaUrl}`}
                            alt="current"
                            className="w-24 h-24 object-cover rounded border"
                        />
                    </div>
                )}

                {/* New File Upload */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        {existingMediaUrl ? "Replace Image (optional)" : "Upload Image"}
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="w-full border rounded-lg px-3 py-2"
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => router.push("/dashboard/newsfeed")}
                        className="px-5 py-2 rounded-lg border"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-black text-white px-5 py-2 rounded-lg disabled:opacity-50"
                    >
                        {submitting ? "Updating..." : "Update"}
                    </button>
                </div>
            </form>
        </div>
    );
}