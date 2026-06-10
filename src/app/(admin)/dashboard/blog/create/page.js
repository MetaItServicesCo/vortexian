"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import "react-quill-new/dist/quill.snow.css";
import { useRouter } from "next/navigation";

const ReactQuill = dynamic(
    () => import("react-quill-new"),
    { ssr: false }
);

const modules = {
    toolbar: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline", "strike"],
        ["blockquote", "link", "image"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["clean"],
    ],
};

export default function AddBlog() {
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        excerpt: "",
        category: "",
        author: "",
        meta_title: "",
        meta_description: "",
        content: "",
        image: null,
    });
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            if (!token) {
                alert("Please login first.");
                return;
            }

            const data = new FormData();

            data.append("title", formData.title);
            data.append("excerpt", formData.excerpt);
            data.append("content", formData.content);
            data.append("category", formData.category);
            data.append("author", formData.author);
            data.append("meta_title", formData.meta_title);
            data.append(
                "meta_description",
                formData.meta_description
            );

            if (formData.image) {
                data.append("image", formData.image);
            }

            const response = await axios.post(
                "http://localhost:8000/api/blog/create",
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log(response.data);

            alert("Blog Created Successfully");
            router.push("/dashboard/blog");
            setFormData({
                title: "",
                excerpt: "",
                category: "",
                author: "",
                meta_title: "",
                meta_description: "",
                content: "",
                image: null,
            });

            const fileInput =
                document.getElementById("blog-image");

            if (fileInput) {
                fileInput.value = "";
            }
        } catch (error) {
            console.log("FULL ERROR:", error);

            if (error.response) {
                console.log("STATUS:", error.response.status);
                console.log("DATA:", error.response.data);
                console.log("HEADERS:", error.response.headers);
            }

            console.log("REQUEST URL:", error.config?.url);

            alert(
                error.response?.data?.detail ||
                error.message ||
                "Server Error"
            );
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8">
                Create Blog
            </h1>

            <form
                onSubmit={handleSubmit}
                className="bg-white shadow rounded-lg p-6 space-y-6"
            >
                <div className="grid md:grid-cols-2 gap-4">
                    <InputField
                        label="Title"
                        value={formData.title}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                title: e.target.value,
                            })
                        }
                    />

                    <InputField
                        label="Category"
                        value={formData.category}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                category: e.target.value,
                            })
                        }
                    />

                    <InputField
                        label="Author"
                        value={formData.author}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                author: e.target.value,
                            })
                        }
                    />

                    <div>
                        <label className="block mb-2 font-medium">
                            Blog Image
                        </label>

                        <input
                            id="blog-image"
                            type="file"
                            accept="image/*"
                            className="border rounded w-full p-2"
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    image:
                                        e.target.files?.[0] || null,
                                })
                            }
                        />
                    </div>
                </div>

                <div>
                    <label className="block mb-2 font-medium">
                        Excerpt
                    </label>

                    <textarea
                        className="w-full border rounded p-3 h-28"
                        value={formData.excerpt}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                excerpt: e.target.value,
                            })
                        }
                    />
                </div>

                <div>
                    <label className="block mb-2 font-medium">
                        Meta Title
                    </label>

                    <input
                        className="w-full border rounded p-3"
                        value={formData.meta_title}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                meta_title: e.target.value,
                            })
                        }
                    />
                </div>

                <div>
                    <label className="block mb-2 font-medium">
                        Meta Description
                    </label>

                    <textarea
                        className="w-full border rounded p-3 h-24"
                        value={formData.meta_description}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                meta_description:
                                    e.target.value,
                            })
                        }
                    />
                </div>

                <div>
                    <label className="block mb-2 font-medium">
                        Content
                    </label>

                    <ReactQuill
                        theme="snow"
                        modules={modules}
                        value={formData.content}
                        onChange={(value) =>
                            setFormData({
                                ...formData,
                                content: value,
                            })
                        }
                        className="mb-16"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded font-semibold"
                >
                    {loading
                        ? "Creating Blog..."
                        : "Create Blog"}
                </button>
            </form>
        </div>
    );
}

function InputField({
    label,
    value,
    onChange,
}) {
    return (
        <div>
            <label className="block mb-2 font-medium">
                {label}
            </label>

            <input
                type="text"
                value={value}
                onChange={onChange}
                className="w-full border rounded p-3"
            />
        </div>
    );
}