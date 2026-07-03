

"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function CreateNewsFeed() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("announcement");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const quillRef = useRef(null);

  // ✅ FIXED VIDEO HANDLER
  const videoHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "video/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      if (file.size > 50 * 1024 * 1024) {
        alert("Video file size is too large! Max limit is 50MB.");
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        const base64VideoUrl = reader.result;
        const quill = quillRef.current?.getEditor();
        const range = quill?.getSelection(true);

        if (quill && range) {
          const videoTag = `<video controls width="100%" src="${base64VideoUrl}"></video>`;
          quill.clipboard.dangerouslyPasteHTML(range.index, videoTag);
        }
      };
    };
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [{ color: [] }, { background: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image", "video"],
          ["clean"],
        ],
        handlers: {
          video: videoHandler,
        },
      },
    }),
    [],
  );

  // ✅ FIXED SUBMIT FUNCTION
  const handleSave = async (e) => {
    e.preventDefault();

    if (!title || !description) {
      return alert("Title and Description are required!");
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
      alert(`Something went wrong: ${err.message}`);
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

          <div className="h-64 mb-12">
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={description}
              onChange={setDescription}
              modules={modules}
              className="h-full rounded-xl"
              placeholder="Write description..."
            />
          </div>
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
