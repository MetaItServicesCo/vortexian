"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

// ✅ SSR SAFE REACT QUILL (IMPORTANT FIX)
const ReactQuill = dynamic(() => import("react-quill-new"), {
    ssr: false,
});

export default function EditBlogPage() {
    const router = useRouter();
    const params = useParams();
    const blogId = params.id;
    const quillRef = useRef(null);

    const [form, setForm] = useState({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        category: "",
        author: "",
        meta_title: "",
        meta_description: "",
        image: null,
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
                    slug: res.data.slug || "",
                    excerpt: res.data.excerpt || "",
                    content: res.data.content || "",
                    category: res.data.category || "",
                    author: res.data.author || "",
                    meta_title: res.data.meta_title || "",
                    meta_description: res.data.meta_description || "",
                    image: null,
                });

                setPreview(res.data.image || null);
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
        setForm({ ...form, image: file });

        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    // ---------------- EDITOR: IMAGE INSERT PAR ALT TEXT ----------------
    const imageHandler = useCallback(() => {
        const editor = quillRef.current?.getEditor();
        if (!editor) return;

        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.click();

        input.onchange = () => {
            const file = input.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = () => {
                const range = editor.getSelection(true);
                const altText =
                    window.prompt("Image k liye ALT text likhein (SEO k liye zaroori hai):", "") || "";

                editor.insertEmbed(range.index, "image", reader.result);

                setTimeout(() => {
                    const images = editor.root.querySelectorAll("img");
                    const lastImage = images[images.length - 1];
                    if (lastImage) {
                        lastImage.setAttribute("alt", altText);
                    }
                }, 50);

                editor.setSelection(range.index + 1);
            };
            reader.readAsDataURL(file);
        };
    }, []);

    // ---------------- EDITOR: EXISTING IMAGE PAR CLICK KARKE ALT EDIT ----------------
    useEffect(() => {
        const editor = quillRef.current?.getEditor();
        if (!editor) return;

        const editorRoot = editor.root;

        const handleImageClick = (e) => {
            if (e.target.tagName === "IMG") {
                const currentAlt = e.target.getAttribute("alt") || "";
                const newAlt = window.prompt(
                    "Is image ka ALT text update karein:",
                    currentAlt
                );
                if (newAlt !== null) {
                    e.target.setAttribute("alt", newAlt);
                }
            }
        };

        editorRoot.addEventListener("click", handleImageClick);

        return () => {
            editorRoot.removeEventListener("click", handleImageClick);
        };
    }, [form.content]);

    const modules = {
        toolbar: {
            container: [
                [{ header: [1, 2, 3, false] }],
                [{ size: ["small", false, "large", "huge"] }],
                ["bold", "italic", "underline", "strike"],
                [{ color: [] }, { background: [] }],
                [{ script: "sub" }, { script: "super" }],
                ["blockquote", "code-block", "link", "image"],
                [{ list: "ordered" }, { list: "bullet" }],
                [{ indent: "-1" }, { indent: "+1" }],
                [{ align: [] }],
                ["clean"],
            ],
            handlers: {
                image: imageHandler,
            },
        },
    };

    // ---------------- UPDATE BLOG ----------------
    const handleUpdate = async (e) => {
        e.preventDefault();

        try {
            setUpdating(true);

            const token = localStorage.getItem("token");

            const data = new FormData();

            data.append("title", form.title);
            data.append("slug", form.slug);
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
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            alert("Blog updated successfully");
            router.push("/dashboard/blog");
        } catch (err) {
            console.log(err);
            alert("Failed to update blog");
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

                {/* SLUG */}
                <div>
                    <label className="font-semibold">Slug</label>
                    <input
                        type="text"
                        name="slug"
                        value={form.slug}
                        onChange={handleChange}
                        className="w-full p-3 border rounded"
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

                    <ReactQuill
                        ref={quillRef}
                        theme="snow"
                        modules={modules}
                        value={form.content}
                        onChange={(value) =>
                            setForm({ ...form, content: value })
                        }
                        className="blog-editor"
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
                        onChange={handleImage}
                        className="w-full p-2 border rounded"
                    />

                    {preview && (
                        <img
                            src={preview}
                            className="w-40 h-32 object-cover mt-2 rounded"
                        />
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

            {/* Editor ki custom styling */}
            <style jsx global>{`
                .blog-editor .ql-toolbar {
                    position: sticky;
                    top: 0;
                    z-index: 20;
                    background: #ffffff;
                    border-top-left-radius: 6px;
                    border-top-right-radius: 6px;
                }

                .blog-editor .ql-container {
                    min-height: 500px;
                    max-height: 700px;
                    overflow-y: auto;
                    font-size: 16px;
                }

                .blog-editor .ql-editor {
                    min-height: 500px;
                }

                .blog-editor .ql-editor a {
                    color: #2563eb !important;
                    font-weight: 700 !important;
                    text-decoration: underline;
                }

                .blog-editor .ql-editor img {
                    cursor: pointer;
                    max-width: 100%;
                }
            `}</style>
        </div>
    );
}