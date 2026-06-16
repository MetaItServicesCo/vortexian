"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

// Dynamic import for Quill editor
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

// Quill modules to enable image & video buttons
const modules = {
    toolbar: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image", "video"], // <--- Image and Video controls added here
        ["clean"],
    ],
};

export default function CreateNewsFeed() {
    const [title, setTitle] = useState("");
    const [type, setType] = useState("announcement");
    const [description, setDescription] = useState("");
    const [author, setAuthor] = useState("");
    const [date, setDate] = useState("");
    const router = useRouter();

    const handleSave = (e) => {
        e.preventDefault();

        if (!title || !description) {
            return alert("Title and Description are required!");
        }

        const existingFeeds = JSON.parse(localStorage.getItem("news_feed") || "[]");

        const newFeed = {
            id: Date.now(),
            type,
            title,
            description, // HTML string containing text, images, or videos
            date: date || null,
            author: author || "Admin",
            createdAt: "Just now",
        };

        localStorage.setItem("news_feed", JSON.stringify([newFeed, ...existingFeeds]));
        alert("News Feed Created Successfully!");
        router.push("/dashboard/newsfeed");
    };

    return (
        <div className="max-w-4xl mx-auto p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Create News Feed</h1>

            <form onSubmit={handleSave} className="bg-white p-8 rounded-2xl shadow-sm border space-y-6">
                {/* TITLE */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Holiday Tea Party 🎉"
                        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                </div>

                {/* TYPE */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Feed Type
                    </label>
                    <input
                        type="text"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        placeholder="e.g., Announcement, Event, etc."
                        className="w-full px-4 py-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-400"
                    />
                </div>

                {/* EDITOR (Description with Image/Video upload) */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Supports Image/Video)</label>
                    <div className="h-64 mb-12">
                        <ReactQuill
                            theme="snow"
                            value={description}
                            onChange={setDescription}
                            modules={modules}
                            className="h-full rounded-xl"
                            placeholder="Write your description, insert images or embed videos..."
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* AUTHOR */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Author</label>
                        <input
                            type="text"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            placeholder="e.g. HR Team"
                            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* DATE (Optional) */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Event/Display Date <span className="text-gray-400 text-xs">(Optional)</span></label>
                        <input
                            type="text"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            placeholder="e.g. Dec 20, 2025 · 3:00 PM"
                            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
                >
                    Publish Feed
                </button>
            </form>
        </div>
    );
}