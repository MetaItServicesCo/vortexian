"use client";
import { useState, useEffect } from "react";
import { Trash2, Mail, Phone, Calendar } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useSelection } from "@/lib/useSelection";
import BulkActions from "@/components/admin/bulk/BulkActions";
import { SelectAllCheckbox, SelectRowCheckbox } from "@/components/admin/bulk/SelectCheckbox";

export default function AdminQuotesDashboard() {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const selection = useSelection(quotes);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    useEffect(() => {
        async function fetchQuotes() {
            try {
                const res = await fetch("/api/contact-us/contact-us", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    setQuotes(data);
                } else {
                    toast.error("Unauthorized or failed to load data");
                }
            } catch (err) {
                toast.error("Network error while fetching quotes");
            } finally {
                setLoading(false);
            }
        }

        if (token) fetchQuotes();
        else {
            toast.error("Token missing. Please login first.");
            setLoading(false);
        }
    }, [token]);

    // 🗑 DELETE API
    const handlePurge = async (id) => {
        if (!confirm("Delete this enquiry?\n\nYou can restore it from Recently deleted for 7 days.")) return;

        try {
            const res = await fetch(`/api/contact-us/contact-us/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                setQuotes((prev) => prev.filter((q) => q.id !== id));
                toast.success("Deleted successfully!");
            } else {
                toast.error("Delete failed");
            }
        } catch (err) {
            toast.error("Server error while deleting");
        }
    };

    return (
        <div className="p-6 md:p-10 min-h-screen bg-gray-50 text-slate-800">
            <Toaster position="top-center" />

            <h1 className="text-2xl font-bold text-[#1D1D7E] mb-6">
                Contact Leads Dashboard
            </h1>

            <BulkActions
                resource="quotes"
                selection={selection}
                noun={["enquiry", "enquiries"]}
                onDeleted={(ids) => setQuotes((prev) => prev.filter((q) => !ids.includes(q.id)))}
            />

            <div className="bg-white rounded-xl shadow overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                        <tr>
                            <th className="p-4 w-10"><SelectAllCheckbox selection={selection} label="Select all enquiries" /></th>
                            <th className="p-4">Name</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Phone</th>
                            <th className="p-4">Date</th>
                            <th className="p-4 text-center">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="p-6 text-center">Loading...</td></tr>
                        ) : quotes.length === 0 ? (
                            <tr><td colSpan="6" className="p-6 text-center">No records found</td></tr>
                        ) : (
                            quotes.map((q) => (
                                <tr key={q.id} className={`border-b ${selection.isSelected(q.id) ? "bg-indigo-50/60" : "hover:bg-slate-50/40"}`}>
                                    <td className="p-4"><SelectRowCheckbox selection={selection} id={q.id} label={`Select ${q.full_name}`} /></td>
                                    {/* Name Column */}
                                    <td className="p-4 font-bold text-slate-800">{q.full_name}</td>

                                    {/* Email Column */}
                                    <td className="p-4 flex items-center gap-2">
                                        <Mail size={14} className="text-gray-400" />
                                        {q.email}
                                    </td>

                                    {/* Phone Column */}
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Phone size={14} className="text-gray-400" />
                                            {q.phone_number}
                                        </div>
                                    </td>

                                    {/* Date Column */}
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-gray-400" />
                                            {q.created_at}
                                        </div>
                                    </td>

                                    {/* Action Column */}
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => handlePurge(q.id)}
                                            className="text-red-500 hover:text-red-700 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}