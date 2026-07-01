"use client";
import { useState, useEffect } from "react";
import { Trash2, Mail, Users, Loader2, Calendar } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function AdminNewsletterDashboard() {
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🔐 TOKEN
    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null;

    useEffect(() => {
        async function loadSubscribers() {
            try {
                const res = await fetch(
                    "/api/newsletter/subscribers",
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await res.json();

                if (res.ok) {
                    setSubscribers(data);
                } else {
                    toast.error(data.detail || "Failed to fetch subscribers");
                }
            } catch (err) {
                toast.error("Network error loading subscribers");
            } finally {
                setLoading(false);
            }
        }

        if (token) loadSubscribers();
        else {
            toast.error("Token missing. Please login first.");
            setLoading(false);
        }
    }, [token]);

    // 🗑 DELETE SUBSCRIBER
    const handlePurge = async (id) => {
        if (!confirm("Delete this subscriber permanently?")) return;

        try {
            const res = await fetch(
                `/api/newsletter/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await res.json();

            if (res.ok) {
                setSubscribers((prev) =>
                    prev.filter((item) => item.id !== id)
                );
                toast.success(data.message || "Deleted successfully");
            } else {
                toast.error(data.detail || "Delete failed");
            }
        } catch (err) {
            toast.error("Server error while deleting");
        }
    };

    return (
        <div className="p-6 md:p-10 min-h-screen bg-gray-50 text-slate-800 font-sans text-base">
            <Toaster position="top-center" />

            {/* HEADER */}
            <div className="mb-10 pb-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-[#1D1D7E] uppercase tracking-tight">
                        Newsletter Mailing List
                    </h1>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-0.5">
                        Marketing Leads System
                    </p>
                </div>

                <div className="bg-blue-50 text-[#1D1D7E] px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-2 font-black text-xs uppercase tracking-wider">
                    <Users size={16} /> Total: {subscribers.length}
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-w-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100/70 border-b text-[11px] font-black uppercase tracking-widest text-slate-400">
                                <th className="p-4 pl-6">Email</th>
                                <th className="p-4">Date</th>
                                <th className="p-4 text-center pr-6">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 text-sm font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan="3" className="text-center py-16">
                                        <div className="flex justify-center items-center gap-2 text-gray-400 font-bold uppercase">
                                            <Loader2 className="animate-spin w-5 h-5 text-[#1D1D7E]" />
                                            Loading subscribers...
                                        </div>
                                    </td>
                                </tr>
                            ) : subscribers.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="text-center py-12 text-gray-400 font-bold uppercase">
                                        No subscribers found
                                    </td>
                                </tr>
                            ) : (
                                subscribers.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/40">
                                        {/* EMAIL */}
                                        <td className="p-4 pl-6 font-bold text-slate-800 flex items-center gap-2">
                                            <Mail size={16} className="text-[#5DB4D1]" />
                                            {item.email}
                                        </td>

                                        {/* DATE */}
                                        <td className="p-4 text-xs text-slate-500 font-bold">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={13} />
                                                {item.created_at
                                                    ? new Date(item.created_at).toLocaleDateString()
                                                    : "N/A"}
                                            </div>
                                        </td>

                                        {/* DELETE */}
                                        <td className="p-4 text-center pr-6">
                                            <button
                                                onClick={() => handlePurge(item.id)}
                                                className="w-9 h-9 rounded-xl border border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center mx-auto"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}