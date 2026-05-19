"use client";
import { useState, useEffect } from "react";
import { Trash2, Mail, Phone, Briefcase, Building, FileText, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function AdminContactsDashboard() {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLogs() {
            try {
                const res = await fetch("/api/contacts");
                if (res.ok) setInquiries(await res.json());
            } catch (err) {
                toast.error("Pipeline failure compiling structural log data nodes.");
            } finally {
                setLoading(false);
            }
        }
        fetchLogs();
    }, []);

    const handleStatusShift = async (id, currentPhase) => {
        try {
            const res = await fetch(`/api/contacts/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: currentPhase })
            });
            if (res.ok) toast.success("Lead lifecycle phase state modulated!");
        } catch (err) {
            toast.error("Server execution exception handling status loops.");
        }
    };

    const handlePurge = async (id) => {
        if (!confirm("Destroy selected inquiry log trace from local database clusters? This operation is absolute.")) return;
        try {
            const res = await fetch(`/api/contacts/${id}`, { method: "DELETE" });
            if (res.ok) {
                setInquiries(inquiries.filter((item) => item._id !== id));
                toast.success("Inquiry entry permanent wiped.");
            }
        } catch (err) {
            toast.error("Cleanup pipeline error.");
        }
    };

    return (
        <div className="p-6 md:p-10 min-h-screen bg-gray-50 text-slate-800 font-sans text-base">
            <Toaster position="top-center" />

            <div className="mb-10 pb-6 border-b border-gray-200">
                <h1 className="text-2xl font-black text-[#1D1D7E] uppercase tracking-tight">Inbound Corporate Inquiries</h1>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-0.5">Vortexian Business Communication Log Node</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-slate-100 border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100/70 border-b border-gray-200 text-slate-400 text-[11px] font-black uppercase tracking-widest">
                                <th className="p-4 pl-6">Prospect Profile</th>
                                <th className="p-4">Corporate Info</th>
                                <th className="p-4">Message Context</th>
                                <th className="p-4">Operations Status</th>
                                <th className="p-4 text-center pr-6">Management Ops</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-16 text-sm text-gray-400 font-bold uppercase tracking-widest">
                                        <div className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin text-[#1D1D7E]" /> Compiling database logs...</div>
                                    </td>
                                </tr>
                            ) : inquiries.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-12 text-sm text-gray-400 font-bold uppercase tracking-widest">
                                        Zero direct partnership requests registered.
                                    </td>
                                </tr>
                            ) : (
                                inquiries.map((log) => (
                                    <tr key={log._id} className="hover:bg-slate-50/40 transition-colors">
                                        <td className="p-4 pl-6">
                                            <div>
                                                <p className="font-extrabold text-slate-900 text-base">{log.fullName}</p>
                                                <div className="space-y-0.5 mt-2 text-xs text-gray-500 font-bold">
                                                    <p className="flex items-center gap-1"><Mail size={12} /> {log.email}</p>
                                                    <p className="flex items-center gap-1"><Phone size={12} /> {log.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-xs space-y-1 text-slate-600 font-bold">
                                            <p className="flex items-center gap-1.5 text-slate-900 font-extrabold text-sm"><Building size={14} className="text-blue-900" /> {log.companyName}</p>
                                            <p className="flex items-center gap-1.5"><Briefcase size={13} className="text-gray-400" /> Role: {log.designation}</p>
                                            {log.websiteUrl && <a href={log.websiteUrl} target="_blank" className="text-[#5DB4D1] truncate block max-w-[180px] hover:underline mt-0.5">{log.websiteUrl}</a>}
                                        </td>
                                        <td className="p-4 max-w-xs">
                                            <p className="text-xs font-black text-slate-900 flex items-center gap-1 uppercase tracking-wider"><FileText size={12} className="text-[#5DB4D1]" /> {log.subject}</p>
                                            <p className="text-gray-500 text-xs mt-1 font-medium leading-relaxed truncate group-hover:whitespace-normal transition-all">{log.message}</p>
                                        </td>
                                        <td className="p-4">
                                            <select
                                                defaultValue={log.status}
                                                onChange={(e) => handleStatusShift(log._id, e.target.value)}
                                                className="p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black uppercase tracking-wider outline-none focus:ring-2 focus:ring-[#5DB4D1] cursor-pointer"
                                            >
                                                <option value="Unread">Unread Node</option>
                                                <option value="In Discussion">In Discussion</option>
                                                <option value="Resolved">Resolved Case</option>
                                            </select>
                                        </td>
                                        <td className="p-4 text-center pr-6">
                                            <button
                                                onClick={() => handlePurge(log._id)}
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