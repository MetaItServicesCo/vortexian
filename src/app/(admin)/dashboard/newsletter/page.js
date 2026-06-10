"use client";
import { useState, useEffect } from "react";
import { Trash2, Mail, Users, Loader2, Calendar } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function AdminNewsletterDashboard() {
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadSubscribers() {
            try {
                const res = await fetch("/api/newsletter");
                if (res.ok) setSubscribers(await res.json());
            } catch (err) {
                toast.error("Pipeline failure fetching subscribers database clusters.");
            } finally {
                setLoading(false);
            }
        }
        loadSubscribers();
    }, []);

    const handlePurge = async (id) => {
        if (!confirm("Remove selected subscriber entry from mailing loop nodes permanently?")) return;
        try {
            const res = await fetch(`/api/newsletter/${id}`, { method: "DELETE" });
            if (res.ok) {
                setSubscribers(subscribers.filter((item) => item._id !== id));
                toast.success("Subscriber record successfully destroyed.");
            } else {
                toast.error("Purge failure.");
            }
        } catch (err) {
            toast.error("Cleanup pipeline error context.");
        }
    };

    return (
        <div className="p-6 md:p-10 min-h-screen bg-gray-50 text-slate-800 font-sans text-base">
            <Toaster position="top-center" />

            {/* Header Info Panel */}
            <div className="mb-10 pb-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-[#1D1D7E] uppercase tracking-tight">Newsletter Mailing List</h1>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-0.5">Vortexian Tech Marketing Leads</p>
                </div>
                <div className="bg-blue-50 text-[#1D1D7E] px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-2 font-black text-xs uppercase tracking-wider">
                    <Users size={16} /> Total: {subscribers.length} Nodes
                </div>
            </div>

            {/* Main Grid View Controller */}
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-100 border border-gray-100 overflow-hidden max-w-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100/70 border-b border-gray-200 text-slate-400 text-[11px] font-black uppercase tracking-widest">
                                <th className="p-4 pl-6">Subscriber Mailing Address</th>
                                <th className="p-4">Registration Date</th>
                                <th className="p-4 text-center pr-6">Management</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan="3" className="text-center py-16 text-sm text-gray-400 font-bold uppercase tracking-widest">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin text-[#1D1D7E]" /> Compiling newsletter channels...
                                        </div>
                                    </td>
                                </tr>
                            ) : subscribers.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="text-center py-12 text-sm text-gray-400 font-bold uppercase tracking-widest">
                                        No users registered in your newsletter list yet.
                                    </td>
                                </tr>
                            ) : (
                                subscribers.map((item) => (
                                    <tr key={item._id} className="hover:bg-slate-50/40 transition-colors">
                                        <td className="p-4 pl-6 font-extrabold text-slate-900 text-base">
                                            <div className="flex items-center gap-2 text-slate-800">
                                                <Mail size={16} className="text-[#5DB4D1]" />
                                                {item.email}
                                            </div>
                                        </td>
                                        <td className="p-4 text-xs text-slate-500 font-bold">
                                            <p className="flex items-center gap-1.5">
                                                <Calendar size={13} className="text-gray-400" />
                                                {new Date(item.createdAt).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric"
                                                })}
                                            </p>
                                        </td>
                                        <td className="p-4 text-center pr-6">
                                            <button
                                                onClick={() => handlePurge(item._id)}
                                                className="w-9 h-9 rounded-xl border border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-all cursor-pointer mx-auto"
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