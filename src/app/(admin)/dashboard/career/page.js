"use client";
import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function CareerApplicationsList() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const res = await fetch(`${API_BASE_URL}/api/career/`, {
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            if (!res.ok) throw new Error(`Error ${res.status}`);

            const data = await res.json();
            setApplications(data);
        } catch (err) {
            setError("Applications load nahi ho saki. Dobara try karein.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleDelete = async (id) => {
        if (!confirm("Kya aap yeh application delete karna chahte hain?")) return;

        try {
            setDeletingId(id);
            const token = localStorage.getItem("token");

            const res = await fetch(`${API_BASE_URL}/api/career/${id}`, {
                method: "DELETE",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            if (!res.ok) throw new Error(`Error ${res.status}`);

            setApplications((prev) => prev.filter((item) => item.id !== id));
        } catch (err) {
            alert("Delete nahi ho saka. Dobara try karein.");
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="max-w-7xl mx-auto p-8">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Career Applications</h1>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-600 rounded">
                    {error}
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : applications.length === 0 ? (
                <div className="text-center py-10">No applications found</div>
            ) : (
                <div className="overflow-x-auto bg-white shadow rounded-lg">
                    <table className="w-full border-collapse">

                        {/* Table Head */}
                        <thead className="bg-gray-100 text-left text-sm">
                            <tr>
                                <th className="p-3">#</th>
                                <th className="p-3">Name</th>
                                <th className="p-3">Company</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">LinkedIn</th>
                                <th className="p-3">Applied On</th>
                                <th className="p-3">CV</th>
                                <th className="p-3">Public Contact</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>

                        {/* Table Body */}
                        <tbody>
                            {applications.map((item, index) => (
                                <tr key={item.id} className="border-b hover:bg-gray-50">

                                    {/* Index */}
                                    <td className="p-3">{index + 1}</td>

                                    {/* Name */}
                                    <td className="p-3 font-medium">
                                        {item.first_name} {item.last_name}
                                    </td>

                                    {/* Company */}
                                    <td className="p-3">
                                        {item.company_name || "-"}
                                    </td>

                                    {/* Email */}
                                    <td className="p-3">
                                        {item.email || "-"}
                                    </td>

                                    {/* LinkedIn */}
                                    <td className="p-3">
                                        <a
                                            href={item.linkedin_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-indigo-600 hover:underline"
                                        >
                                            View Profile
                                        </a>
                                    </td>

                                    {/* Applied On */}
                                    <td className="p-3">
                                        {formatDate(item.created_at)}
                                    </td>

                                    {/* CV */}
                                    <td className="p-3">
                                        <a
                                            href={`${API_BASE_URL}${item.cv_url}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200 inline-block"
                                        >
                                            View CV
                                        </a>
                                    </td>

                                    {/* Public Contact */}
                                    <td className="p-3">
                                        {item.show_contact_public ? (
                                            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                                                Yes
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                                No
                                            </span>
                                        )}
                                    </td>

                                    {/* Action */}
                                    <td className="p-3">
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            disabled={deletingId === item.id}
                                            className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                                        >
                                            {deletingId === item.id ? "Deleting..." : "Delete"}
                                        </button>
                                    </td>

                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>
            )}
        </div>
    );
}