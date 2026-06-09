"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import 'react-quill-new/dist/quill.snow.css';

// Editor configuration for Images, Links, and Formatting
const modules = {
    toolbar: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['image', 'link', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['clean']
    ],
};

const ReactQuill = dynamic(() => import("react-quill-new"), {
    ssr: false,
    loading: () => <div className="h-64 flex items-center justify-center border">Loading Editor...</div>
});

export default function AddBlog() {
    const [formData, setFormData] = useState({
        title: "", slug: "", category: "", image: "",
        metaTitle: "", metaDesc: "", content: "", faqs: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:8000/api/blog/create", formData);
            alert("Blog successfully created!");
            setFormData({ title: "", slug: "", category: "", image: "", metaTitle: "", metaDesc: "", content: "", faqs: "" });
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to save. Check console.");
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto bg-gray-50 min-h-screen">
            <h2 className="text-3xl font-bold mb-8 text-gray-800">Create New Blog</h2>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Title" val={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                    <InputField label="Slug" val={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} />
                    <InputField label="Category" val={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                    <InputField label="Image URL" val={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} />
                </div>

                <InputField label="Meta Title" val={formData.metaTitle} onChange={e => setFormData({ ...formData, metaTitle: e.target.value })} />

                <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-600 mb-1">Meta Description</label>
                    <textarea className="border p-2 rounded w-full h-20" onChange={e => setFormData({ ...formData, metaDesc: e.target.value })} value={formData.metaDesc} />
                </div>

                {/* Editor Section */}
                <div className="pb-20">
                    <label className="block mb-2 font-semibold text-gray-700">Content:</label>
                    <ReactQuill
                        modules={modules}
                        theme="snow"
                        value={formData.content}
                        onChange={(val) => setFormData({ ...formData, content: val })}
                        className="h-64"
                    />
                </div>

                <div className="flex flex-col pt-4">
                    <label className="text-sm font-semibold text-gray-600 mb-1">FAQs (JSON Schema)</label>
                    <textarea className="border p-2 rounded w-full h-24" onChange={e => setFormData({ ...formData, faqs: e.target.value })} value={formData.faqs} />
                </div>

                <button
                    type="submit"
                    className="w-full bg-[#22c55e] text-white py-4 rounded-lg font-bold hover:bg-[#16a34a] transition-all shadow-lg"
                >
                    Save Blog Now
                </button>
            </form>
        </div>
    );
}

// Helper Component for cleaner code
function InputField({ label, val, onChange }) {
    return (
        <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600 mb-1">{label}</label>
            <input className="border p-2 rounded w-full" value={val} onChange={onChange} />
        </div>
    );
}