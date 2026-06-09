"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";

export default function BlogList() {
    const [blogs, setBlogs] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:8000/api/blogs").then((res) => setBlogs(res.data));
    }, []);

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Blogs</h1>
                <Link href="/dashboard/add-blog" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                    + Add Blog
                </Link>
            </div>
            <table className="w-full bg-white rounded-lg shadow">
                <thead>
                    <tr className="border-b">
                        <th className="p-4 text-left">Title</th>
                        <th className="p-4 text-left">Category</th>
                        <th className="p-4 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {blogs.map(blog => (
                        <tr key={blog.id} className="border-b">
                            <td className="p-4">{blog.title}</td>
                            <td className="p-4">{blog.category}</td>
                            <td className="p-4 text-blue-500">Edit</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}