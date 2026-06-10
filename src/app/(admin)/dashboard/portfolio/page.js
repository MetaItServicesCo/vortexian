"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Edit3, Loader2, FolderHeart } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function DashboardPortfolioList() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRecords = async () => {
        try {
            const res = await fetch("/api/portfolio");
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        } catch {
            toast.error("Error connecting with storage nodes.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRecords(); }, []);

    const triggerDeletion = async (id) => {
        if (!confirm("Are you absolutely sure you want to purge this record?")) return;
        try {
            const res = await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Project eliminated.");
                setItems(items.filter(item => item._id !== id));
            }
        } catch {
            toast.error("Process termination error.");
        }
    };

    return (
        <div className="p-8 md:p-14 min-h-screen bg-slate-50/50 text-slate-800 font-sans max-w-6xl mx-auto">
            <Toaster />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
                <div>
                    <h1 className="text-3xl font-black text-[#1D1D7E] uppercase tracking-tight">Portfolio Canvas Nodes</h1>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-0.5">Control pipeline for Vortexian Tech projects</p>
                </div>
                {/* REDIRECTION CONTROL BUTTON FOR CREATION PANEL */}
                <Link href="/dashboard/portfolio/create" className="bg-[#1D1D7E] text-white px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-md hover:bg-neutral-900 transition-all cursor-pointer">
                    <Plus size={16} /> Add New Project
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#1D1D7E]" size={36} /></div>
            ) : items.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 border border-gray-100 text-center shadow-sm max-w-md mx-auto">
                    <FolderHeart className="mx-auto text-gray-300 mb-4" size={44} />
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">No active portfolio entries deployed.</p>
                </div>
            ) : (
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/70 border-b border-gray-100 text-[10px] font-black uppercase tracking-2xl text-slate-400">
                                    <th className="p-6">Thumbnail</th>
                                    <th className="p-6">Project Metadata</th>
                                    <th className="p-6">Category</th>
                                    <th className="p-6">Year</th>
                                    <th className="p-6 text-right">Actions Matrix</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm font-semibold text-slate-700">
                                {items.map((item) => (
                                    <tr key={item._id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="p-6">
                                            <img src={item.mainImage} alt="" className="w-16 h-12 object-cover rounded-xl border border-gray-100 shadow-sm" />
                                        </td>
                                        <td className="p-6">
                                            <p className="font-bold text-slate-900 text-base">{item.title}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">/{item.slug}</p>
                                        </td>
                                        <td className="p-6"><span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-xs uppercase font-bold tracking-wider">{item.category}</span></td>
                                        <td className="p-6 font-mono text-gray-500">{item.year}</td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/dashboard/portfolio/edit/${item._id}`} className="w-10 h-10 bg-slate-50 hover:bg-sky-50 text-slate-500 hover:text-sky-600 rounded-xl flex items-center justify-center border border-gray-100 shadow-sm transition-all">
                                                    <Edit3 size={16} />
                                                </Link>
                                                <button onClick={() => triggerDeletion(item._id)} className="w-10 h-10 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl flex items-center justify-center border border-gray-100 shadow-sm transition-all cursor-pointer">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}