"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function AddBlog() {
    const [formData, setFormData] = useState({
        title: "", slug: "", category: "", image: "",
        metaTitle: "", metaDesc: "", content: "", faqs: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.post("http://localhost:8000/api/blogs", formData);
        alert("Blog Created!");
    };

    return (
        <form onSubmit={handleSubmit} className="p-8 max-w-4xl mx-auto space-y-4">
            <h2 className="text-xl font-bold">Create New Blog</h2>

            <div className="grid grid-cols-2 gap-4">
                <input placeholder="Title" className="border p-2" onChange={e => setFormData({ ...formData, title: e.target.value })} />
                <input placeholder="Slug" className="border p-2" onChange={e => setFormData({ ...formData, slug: e.target.value })} />
                <input placeholder="Category" className="border p-2" onChange={e => setFormData({ ...formData, category: e.target.value })} />
                <input placeholder="Image URL" className="border p-2" onChange={e => setFormData({ ...formData, image: e.target.value })} />
            </div>

            <input placeholder="Meta Title" className="border p-2 w-full" onChange={e => setFormData({ ...formData, metaTitle: e.target.value })} />
            <textarea placeholder="Meta Description" className="border p-2 w-full" onChange={e => setFormData({ ...formData, metaDesc: e.target.value })} />

            <ReactQuill theme="snow" onChange={(val) => setFormData({ ...formData, content: val })} className="h-64 mb-12" />

            <textarea placeholder="FAQs (JSON Schema)" className="border p-2 w-full" onChange={e => setFormData({ ...formData, faqs: e.target.value })} />

            <button className="bg-green-600 text-white px-6 py-2 rounded">Save Blog</button>
        </form>
    );
}