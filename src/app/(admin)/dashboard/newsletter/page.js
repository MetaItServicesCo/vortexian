"use client";
import { useState, useEffect } from "react";
import { Trash2, Mail, Users, Loader2, Calendar } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { adminFetch } from "@/lib/adminApi";
import NewsletterHeader, { useNewsletterStatus } from "@/components/admin/newsletter/NewsletterHeader";
import { useSelection } from "@/lib/useSelection";
import BulkActions from "@/components/admin/bulk/BulkActions";
import { SelectAllCheckbox, SelectRowCheckbox } from "@/components/admin/bulk/SelectCheckbox";

export default function NewsletterSubscribers() {
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const selection = useSelection(subscribers);
    const status = useNewsletterStatus();

    useEffect(() => {
        adminFetch("/api/newsletter/subscribers").then(
            (data) => { setSubscribers(Array.isArray(data) ? data : []); setLoading(false); },
            (err) => { toast.error(`Subscribers could not be loaded: ${err.message}`); setLoading(false); }
        );
    }, []);

    const handlePurge = async (id) => {
        if (!confirm("Delete this subscriber? They will stop receiving the newsletter.\n\nYou can restore it from Recently deleted for 7 days.")) return;
        try {
            await adminFetch(`/api/newsletter/subscribers/${id}`, { method: "DELETE" });
            setSubscribers((prev) => prev.filter((item) => item.id !== id));
            toast.success("Subscriber removed");
        } catch (err) {
            toast.error(`Could not delete: ${err.message}`);
        }
    };

    return (
        <div className="p-6 md:p-10 min-h-screen bg-gray-50 text-slate-800 font-sans text-base">
            <Toaster position="top-center" />

            <NewsletterHeader status={status} />

            <div className="mb-4 inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-wider text-[#1D1D7E]">
                <Users size={16} /> {subscribers.length} subscriber{subscribers.length === 1 ? "" : "s"}
            </div>

            <div className="max-w-2xl">
                <BulkActions
                    resource="newsletter"
                    selection={selection}
                    noun={["subscriber", "subscribers"]}
                    deleteWarning="They will stop receiving the newsletter."
                    onDeleted={(ids) => setSubscribers((prev) => prev.filter((s) => !ids.includes(s.id)))}
                />
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-w-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100/70 border-b text-[11px] font-black uppercase tracking-widest text-slate-400">
                                <th className="p-4 pl-6 w-10"><SelectAllCheckbox selection={selection} label="Select all subscribers" /></th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Subscribed</th>
                                <th className="p-4 text-center pr-6">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 text-sm font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-16">
                                        <div className="flex justify-center items-center gap-2 text-gray-400 font-bold uppercase">
                                            <Loader2 className="animate-spin w-5 h-5 text-[#1D1D7E]" />
                                            Loading subscribers...
                                        </div>
                                    </td>
                                </tr>
                            ) : subscribers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-12 text-gray-400 font-bold uppercase">
                                        No subscribers found
                                    </td>
                                </tr>
                            ) : (
                                subscribers.map((item) => (
                                    <tr key={item.id} className={`${selection.isSelected(item.id) ? "bg-indigo-50/60" : "hover:bg-slate-50/40"}`}>
                                        <td className="p-4 pl-6"><SelectRowCheckbox selection={selection} id={item.id} label={`Select ${item.email}`} /></td>
                                        {/* EMAIL */}
                                        <td className="p-4 font-bold text-slate-800 flex items-center gap-2">
                                            <Mail size={16} className="text-[#5DB4D1]" />
                                            {item.email}
                                        </td>

                                        {/* DATE */}
                                        <td className="p-4 text-xs text-slate-500 font-bold">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={13} />
                                                {item.created_at
                                                    ? new Date(item.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                                                    : "—"}
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