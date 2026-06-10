"use client";
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";

export default function BlogList() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ---------------- FETCH BLOGS ----------------
    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                setLoading(true);

                const token = localStorage.getItem("token");

                const res = await axios.get(
                    "http://localhost:8000/api/blog/admin",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setBlogs(res.data);
            } catch (err) {
                setError("Failed to load blogs");
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    // ---------------- DELETE BLOG ----------------
    const handleDelete = async (id) => {
        const confirmDelete = confirm("Are you sure you want to delete this blog?");
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem("token");

            await axios.delete(
                `http://localhost:8000/api/blog/delete/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // UI update (remove deleted blog from state)
            setBlogs((prev) => prev.filter((blog) => blog.id !== id));

        } catch (err) {
            console.log(err);
            alert("Failed to delete blog");
        }
    };

    return (
        <div className="p-8">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Blogs</h1>

                <Link
                    href="/dashboard/blog/create"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    + Add Blog
                </Link>
            </div>

            {/* ERROR */}
            {error && (
                <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">
                    {error}
                </div>
            )}

            {/* LOADING */}
            {loading ? (
                <div className="text-center py-10 text-gray-500">
                    Loading blogs...
                </div>
            ) : blogs.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    No blogs found
                </div>
            ) : (
                <table className="w-full bg-white rounded-lg shadow overflow-hidden">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-4 text-left">Title</th>
                            <th className="p-4 text-left">Category</th>
                            <th className="p-4 text-left">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {blogs.map((blog) => (
                            <tr key={blog.id} className="border-b hover:bg-gray-50">
                                <td className="p-4">{blog.title}</td>
                                <td className="p-4">{blog.category}</td>

                                <td className="p-4 flex gap-3">
                                    <Link
                                        href={`/dashboard/blog/edit/${blog.id}`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        Edit
                                    </Link>

                                    <button
                                        onClick={() =>
                                            handleDelete(blog.id)
                                        }
                                        className="text-red-600 hover:underline"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}