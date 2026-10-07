"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import ImageAltField, { altError } from "@/components/admin/ImageAltField";
import { richTextAltError } from "@/lib/richText";
import { mediaUrl } from "@/lib/api";
import { errorMessage } from "@/lib/adminApi";
const RichTextEditor = dynamic(() => import("@/components/editor/RichTextEditor"), { ssr: false });

export default function EditBlogPage() {
    const router = useRouter();
    const params = useParams();
    const blogId = params.id;

    const [form, setForm] = useState({
        title: "",
        excerpt: "",
        content: "",
        category: "",
        author: "",
        meta_title: "",
        meta_description: "",
        image: null,
        image_alt: "",
    });

    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState("");

    // ---------------- FETCH BLOG ----------------
    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await axios.get(
                    `/api/blog/${blogId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setForm({
                    title: res.data.title || "",
                    excerpt: res.data.excerpt || "",
                    content: res.data.content || "",
                    category: res.data.category || "",
                    author: res.data.author || "",
                    meta_title: res.data.meta_title || "",
                    meta_description: res.data.meta_description || "",
                    image: null,
                    image_alt: res.data.featured_image_alt || "",
                });

                setPreview(res.data.featured_image ? mediaUrl(res.data.featured_image) : null);
            } catch (err) {
                console.log(err);
                setError("Failed to load blog");
            } finally {
                setLoading(false);
            }
        };

        if (blogId) fetchBlog();
    }, [blogId]);

    // ---------------- HANDLE INPUT ----------------
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    // ---------------- IMAGE HANDLER ----------------
    const handleImage = (e) => {
        const file = e.target.files[0];
        // A new picture needs its own description
        setForm({ ...form, image: file || null, image_alt: file ? "" : form.image_alt });

        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    // ---------------- UPDATE BLOG ----------------
    const handleUpdate = async (e) => {
        e.preventDefault();

        const validation = altError(!!preview, form.image_alt) || richTextAltError(form.content);
        if (validation) {
            alert(validation);
            return;
        }

        try {
            setUpdating(true);

            const token = localStorage.getItem("token");

            const data = new FormData();

            data.append("title", form.title);
            data.append("excerpt", form.excerpt);
            data.append("content", form.content);
            data.append("category", form.category);
            data.append("author", form.author);
            data.append("meta_title", form.meta_title);
            data.append("meta_description", form.meta_description);

            if (form.image) {
                data.append("image", form.image);
            }

            await axios.patch(
                `/api/blog/update/${blogId}`,
                {
                    title: form.title,
                    excerpt: form.excerpt,
                    content: form.content,
                    category: form.category,
                    author: form.author,
                    meta_title: form.meta_title,
                    meta_description: form.meta_description,
                    ...(preview && !form.image ? { featured_image_alt: form.image_alt.trim() } : {}),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            // A newly chosen featured image is uploaded separately
            if (form.image) {
                const imageData = new FormData();
                imageData.append("image", form.image);
                imageData.append("featured_image_alt", form.image_alt.trim());
                await axios.post(`/api/blog/update-image/${blogId}`, imageData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }

            alert("Blog updated successfully");
            router.push("/dashboard/blog");
        } catch (err) {
            console.log(err);
            alert(`Failed to update blog: ${errorMessage(err.response?.data, err.message)}`);
        } finally {
            setUpdating(false);
        }
    };

    // ---------------- LOADING ----------------
    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="p-8 max-w-4xl mx-auto bg-white shadow rounded">

            <h1 className="text-2xl font-bold mb-6">Edit Blog</h1>

            {error && (
                <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-5">

                {/* TITLE */}
                <div>
                    <label className="font-semibold">Title</label>
                    <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        className="w-full p-3 border rounded"
                        required
                    />
                </div>

                {/* EXCERPT */}
                <div>
                    <label className="font-semibold">Excerpt</label>
                    <input
                        type="text"
                        name="excerpt"
                        value={form.excerpt}
                        onChange={handleChange}
                        className="w-full p-3 border rounded"
                        required
                    />
                </div>

                {/* CONTENT (SSR SAFE EDITOR) */}
                <div>
                    <label className="font-semibold">Content</label>

                    <RichTextEditor
                        value={form.content}
                        onChange={(value) =>
                            setForm((prev) => ({ ...prev, content: value }))
                        }
                        minHeight={400}
                    />
                </div>

                {/* CATEGORY */}
                <div>
                    <label className="font-semibold">Category</label>
                    <input
                        type="text"
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        className="w-full p-3 border rounded"
                        required
                    />
                </div>

                {/* AUTHOR */}
                <div>
                    <label className="font-semibold">Author</label>
                    <input
                        type="text"
                        name="author"
                        value={form.author}
                        onChange={handleChange}
                        className="w-full p-3 border rounded"
                        required
                    />
                </div>

                {/* IMAGE */}
                <div>
                    <label className="font-semibold">Image</label>
                    <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                        onChange={handleImage}
                        className="w-full p-2 border rounded"
                    />

                    {preview && (
                        <>
                            {/* eslint-disable-next-line @next/next/no-img-element -- local preview */}
                            <img
                                src={preview}
                                alt={form.image_alt || "Featured image preview"}
                                className="w-40 h-32 object-cover mt-2 rounded"
                            />
                            <div className="mt-3">
                                <ImageAltField
                                    id="blog-image-alt"
                                    value={form.image_alt}
                                    onChange={(value) => setForm((prev) => ({ ...prev, image_alt: value }))}
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* META TITLE */}
                <div>
                    <label className="font-semibold">Meta Title</label>
                    <input
                        type="text"
                        name="meta_title"
                        value={form.meta_title}
                        onChange={handleChange}
                        className="w-full p-3 border rounded"
                    />
                </div>

                {/* META DESCRIPTION */}
                <div>
                    <label className="font-semibold">Meta Description</label>
                    <textarea
                        name="meta_description"
                        value={form.meta_description}
                        onChange={handleChange}
                        className="w-full p-3 border rounded"
                    />
                </div>

                {/* SUBMIT */}
                <button
                    type="submit"
                    disabled={updating}
                    className="bg-green-600 text-white px-6 py-2 rounded w-full hover:bg-green-700"
                >
                    {updating ? "Updating..." : "Update Blog"}
                </button>

            </form>
        </div>
    );
}