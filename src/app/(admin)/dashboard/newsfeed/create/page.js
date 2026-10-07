"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { richTextAltError } from "@/lib/richText";
const RichTextEditor = dynamic(() => import("@/components/editor/RichTextEditor"), { ssr: false });

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function CreateNewsFeed() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("announcement");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  // ✅ FIXED SUBMIT FUNCTION
  const handleSave = async (e) => {
    e.preventDefault();

    if (!title || !description) {
      return alert("Title and Description are required!");
    }
    const altProblem = richTextAltError(description, "description");
    if (altProblem) {
      return alert(altProblem);
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("title", title);
      formData.append("feed_type", type);
      formData.append("description", description);
      formData.append("author", author || "Admin");
      if (date) formData.append("event_date", date);

      const res = await fetch(`${API_BASE_URL}/api/newsfeed/`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || `Error ${res.status}`);
      }

      alert("News Feed Created Successfully!");
      router.push("/dashboard/newsfeed");
    } catch (err) {
      alert(`Create nahi ho saka: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Create News Feed
      </h1>

      <form
        onSubmit={handleSave}
        className="bg-white p-8 rounded-2xl shadow-sm border space-y-6"
      >
        {/* TITLE */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Title
          </label>
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
            placeholder="Announcement, Event, etc."
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description
          </label>

          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder="Write description..."
            allowVideo
          />
        </div>

        {/* AUTHOR + DATE */}
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author"
            className="w-full px-4 py-3 border rounded-xl"
          />

          <input
            type="text"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="Event date"
            className="w-full px-4 py-3 border rounded-xl"
          />
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-60"
        >
          {saving ? "Publishing..." : "Publish Feed"}
        </button>
      </form>
    </div>
  );
}
