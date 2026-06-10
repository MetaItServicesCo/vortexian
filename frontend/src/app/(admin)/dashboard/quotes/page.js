"use client";
import { useState, useEffect } from "react";
import { Trash2, ExternalLink, Mail, Phone, Calendar, Layers, CheckSquare } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function AdminQuotesDashboard() {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchQuotes() {
            try {
                const res = await fetch("/api/quotes");
                if (res.ok) setQuotes(await res.json());
            } catch (err) {
                toast.error("Pipeline failure compiling record arrays.");
            } finally {
                setLoading(false);
            }
        }
        fetchQuotes();
    }, []);

    const handleStatusUpdate = async (id, currentStatus) => {
        try {
            const res = await fetch(`/api/quotes/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: currentStatus })
            });
            if (res.ok) {
                toast.success("Lead operation management index modulated!");
            }
        } catch (err) {
            toast.error("Internal processing operation exception.");
        }
    };

    const handlePurge = async (id) => {
        if (!confirm("Purge selected inbound leads data document from local database layers permanently?")) return;
        try {
            const res = await fetch(`/api/quotes/${id}`, { method: "DELETE" });
            if (res.ok) {
                setQuotes(quotes.filter((q) => q._id !== id));
                toast.success("Lead entry completely destroyed.");
            }
        } catch (err) {
            toast.error("Failed executing storage cleanup operations.");
        }
    };

    return (
        <div className="p-6 md:p-10 min-h-screen bg-gray-50 text-slate-800 font-sans text-base">
            <Toaster position="top-center" />

            <div className="mb-10 pb-6 border-b border-gray-200">
                <h1 className="text-2xl font-black text-[#1D1D7E] uppercase tracking-tight">Inbound Business Quotes</h1>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-0.5">Vortexian Tech Sales Pipeline Matrix</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-slate-100 border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100/70 border-b border-gray-200 text-slate-400 text-[11px] font-black uppercase tracking-widest">
                                <th className="p-4 pl-6">Prospect Overview</th>
                                <th className="p-4">Requested Services Stack</th>
                                <th className="p-4">Submission Meta Details</th>
                                <th className="p-4">Operations State</th>
                                <th className="p-4 text-center pr-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-12 text-sm text-gray-400 font-bold uppercase tracking-widest">
                                        Assembling Inbound Streams Arrays Nodes...
                                    </td>
                                </tr>
                            ) : quotes.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-12 text-sm text-gray-400 font-bold uppercase tracking-widest">
                                        Zero communication inputs registered inside server logs stack.
                                    </td>
                                </tr>
                            ) : (
                                quotes.map((quote) => (
                                    <tr key={quote._id} className="hover:bg-slate-50/40 transition-colors">
                                        <td className="p-4 pl-6 max-w-xs">
                                            <div>
                                                <p className="font-extrabold text-slate-900 text-base">{quote.firstName} {quote.lastName}</p>
                                                <div className="space-y-0.5 mt-2 text-xs text-gray-500 font-semibold">
                                                    <p className="flex items-center gap-1"><Mail size={12} /> {quote.email}</p>
                                                    <p className="flex items-center gap-1"><Phone size={12} /> {quote.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-1.5 max-w-xs">
                                                {quote.services?.map((svc, idx) => (
                                                    <span key={idx} className="text-[10px] font-black bg-blue-50 text-[#1D1D7E] border border-blue-100 px-2.5 py-1 rounded-md uppercase tracking-wider">
                                                        {svc}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4 text-xs space-y-1 text-slate-600 font-bold">
                                            <p className="flex items-center gap-1"><Calendar size={13} className="text-gray-400" /> Deadline: {quote.completionDate}</p>
                                            {quote.projectFile && (
                                                <a href={quote.projectFile} target="_blank" className="flex items-center gap-1 text-[#5DB4D1] hover:underline">
                                                    <ExternalLink size={13} /> Review Asset Attachment Docs
                                                </a>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <select
                                                defaultValue={quote.status}
                                                onChange={(e) => handleStatusUpdate(quote._id, e.target.value)}
                                                className="p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black uppercase tracking-wider outline-none focus:ring-2 focus:ring-[#5DB4D1] cursor-pointer"
                                            >
                                                <option value="New">New Contact</option>
                                                <option value="In Review">In Review</option>
                                                <option value="Contacted">Contacted</option>
                                                <option value="Closed">Closed Loop</option>
                                            </select>
                                        </td>
                                        <td className="p-4 text-center pr-6">
                                            <button
                                                onClick={() => handlePurge(quote._id)}
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