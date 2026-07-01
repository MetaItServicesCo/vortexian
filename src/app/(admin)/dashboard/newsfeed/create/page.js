// "use client";
// import { useState, useMemo, useRef } from "react";
// import { useRouter } from "next/navigation";
// import dynamic from "next/dynamic";
// import "react-quill-new/dist/quill.snow.css";

// // Dynamic import for Quill editor
// const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

// export default function CreateNewsFeed() {
//     const [title, setTitle] = useState("");
//     const [type, setType] = useState("announcement");
//     const [description, setDescription] = useState("");
//     const [author, setAuthor] = useState("");
//     const [date, setDate] = useState("");
//     const router = useRouter();

//     // Quill instance ka reference lena takay video insert ki ja sakay
//     const quillRef = useRef(null);

//     // Custom Video Upload Handler
//     const videoHandler = () => {
//         const input = document.createElement("input");
//         input.setAttribute("type", "file");
//         input.setAttribute("accept", "video/*");
//         input.click();

//         input.onchange = async () => {
//             const file = input.files[0];
//             if (file) {
//                 // Video file size check (Optional: e.g., max 50MB)
//                 if (file.size > 50 * 1024 * 1024) {
//                     alert("Video file size is too large! Max limit is 50MB.");
//                     return;
//                 }

//                 const reader = new FileReader();
//                 reader.readAsDataURL(file);
//                 reader.onload = () => {
//                     const base64VideoUrl = reader.result;

//                     // Quill editor instance get karein
//                     const quill = quillRef.current.getEditor();
//                     const range = quill.getSelection();

//                     // HTML5 video tag insert karne ke liye raw HTML inject karna
//                     // Is se direct system ki video play ho sakegi bina kisi external URL ke
//                     const videoTag = `<video controls width="100%" src="${base64VideoUrl}"></video>`;
//                     quill.clipboard.dangerouslyPasteHTML(range.index, videoTag);
//                 };
//             }
//         };
//     };

//     // Quill Modules setup (useMemo use kiya hai taake handler properly map ho sake)
//     const modules = useMemo(() => ({
//         toolbar: {
//             container: [
//                 // H1 se H6 tak heading select options
//                 [{ header: [1, 2, 3, 4, 5, 6, false] }],
//                 ["bold", "italic", "underline", "strike", "blockquote"],
//                 // Text Color aur Background Color options
//                 [{ color: [] }, { background: [] }],
//                 [{ list: "ordered" }, { list: "bullet" }],
//                 ["link", "image", "video"],
//                 ["clean"],
//             ],
//             handlers: {
//                 video: videoHandler, // Custom video click event overlay
//             },
//         },
//     }), []);

//     const handleSave = (e) => {
//         e.preventDefault();

//         if (!title || !description) {
//             return alert("Title and Description are required!");
//         }

//         const existingFeeds = JSON.parse(localStorage.getItem("news_feed") || "[]");

//         const newFeed = {
//             id: Date.now(),
//             type,
//             title,
//             description, // Isme ab direct base64 video/image store hogi
//             date: date || null,
//             author: author || "Admin",
//             createdAt: "Just now",
//         };

//         localStorage.setItem("news_feed", JSON.stringify([newFeed, ...existingFeeds]));
//         alert("News Feed Created Successfully!");
//         router.push("/dashboard/newsfeed");
//     };

//     return (
//         <div className="max-w-4xl mx-auto p-8 bg-gray-50 min-h-screen">
//             <h1 className="text-3xl font-bold text-gray-800 mb-8">Create News Feed</h1>

//             <form onSubmit={handleSave} className="bg-white p-8 rounded-2xl shadow-sm border space-y-6">
//                 {/* TITLE */}
//                 <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
//                     <input
//                         type="text"
//                         value={title}
//                         onChange={(e) => setTitle(e.target.value)}
//                         placeholder="e.g. Holiday Tea Party 🎉"
//                         className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                         required
//                     />
//                 </div>

//                 {/* TYPE */}
//                 <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         Feed Type
//                     </label>
//                     <input
//                         type="text"
//                         value={type}
//                         onChange={(e) => setType(e.target.value)}
//                         placeholder="e.g., Announcement, Event, etc."
//                         className="w-full px-4 py-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-400"
//                     />
//                 </div>

//                 {/* EDITOR */}
//                 <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Supports Image/Video Upload)</label>
//                     <div className="h-64 mb-12">
//                         <ReactQuill
//                             ref={quillRef}
//                             theme="snow"
//                             value={description}
//                             onChange={setDescription}
//                             modules={modules}
//                             className="h-full rounded-xl"
//                             placeholder="Write your description, insert images or upload videos directly from system..."
//                         />
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                     {/* AUTHOR */}
//                     <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">Author</label>
//                         <input
//                             type="text"
//                             value={author}
//                             onChange={(e) => setAuthor(e.target.value)}
//                             placeholder="e.g. HR Team"
//                             className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                         />
//                     </div>

//                     {/* DATE */}
//                     <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">Event/Display Date <span className="text-gray-400 text-xs">(Optional)</span></label>
//                         <input
//                             type="text"
//                             value={date}
//                             onChange={(e) => setDate(e.target.value)}
//                             placeholder="e.g. Dec 20, 2025 · 3:00 PM"
//                             className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                         />
//                     </div>
//                 </div>

//                 <button
//                     type="submit"
//                     className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
//                 >
//                     Publish Feed
//                 </button>
//             </form>
//         </div>
//     );
// }

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
