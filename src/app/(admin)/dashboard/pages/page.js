"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit3, Trash2, Loader2, ExternalLink, EyeOff } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { adminFetch } from "@/lib/adminApi";
import { useSelection } from "@/lib/useSelection";
import BulkActions from "@/components/admin/bulk/BulkActions";
import { SelectAllCheckbox, SelectRowCheckbox } from "@/components/admin/bulk/SelectCheckbox";

const NO_PAGES = [];

export default function PagesList() {
    const [pages, setPages] = useState(null);
    const selection = useSelection(pages || NO_PAGES);

    useEffect(() => {
        adminFetch("/api/pages/")
            .then(setPages)
            .catch((err) => {
                toast.error(err.message);
                setPages([]);
            });
    }, []);

    const handleDelete = async (page) => {
        if (!confirm(`Delete “${page.title}”? Its URL /${page.slug} will stop working.\n\nYou can restore it from Recently deleted for 7 days.`)) return;
        try {
            await adminFetch(`/api/pages/${page.id}`, { method: "DELETE" });
            setPages((prev) => prev.filter((p) => p.id !== page.id));
            toast.success("Page deleted");
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className="max-w-5xl space-y-8">
            <Toaster position="top-center" />

            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#1D1D7E] uppercase tracking-tighter">Pages</h1>
                    <p className="text-slate-500 mt-1">Legal pages and other standalone pages. Pages marked “footer” are linked from the site footer.</p>
                </div>
                <Link href="/dashboard/pages/new" className="bg-[#1D1D7E] text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#5DB4D1] transition-all font-bold uppercase text-xs tracking-widest">
                    <Plus size={16} /> New Page
                </Link>
            </div>

            <BulkActions
                resource="pages"
                selection={selection}
                noun={["page", "pages"]}
                deleteWarning="Their URLs will stop working and they leave the footer until restored."
                onDeleted={(ids) => setPages((prev) => prev.filter((p) => !ids.includes(p.id)))}
                onPublished={(ids, value) => setPages((prev) => prev.map((p) => (ids.includes(p.id) ? { ...p, is_published: value } : p)))}
            />

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {pages === null ? (
                    <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#1D1D7E]" /></div>
                ) : pages.length === 0 ? (
                    <div className="py-20 text-center space-y-3">
                        <p className="text-slate-500">No pages yet.</p>
                        <Link href="/dashboard/pages/new" className="text-[#1D1D7E] font-bold">Create your first page (e.g. Privacy Policy)</Link>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-400">
                            <tr>
                                <th className="pl-6 pr-2 py-3 w-10"><SelectAllCheckbox selection={selection} label="Select all pages" /></th>
                                <th className="px-6 py-3">Title</th>
                                <th className="px-6 py-3 hidden md:table-cell">URL</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {pages.map((page) => (
                                <tr key={page.id} className={`${selection.isSelected(page.id) ? "bg-indigo-50/60" : "hover:bg-slate-50/40"}`}>
                                    <td className="pl-6 pr-2 py-4"><SelectRowCheckbox selection={selection} id={page.id} label={`Select “${page.title}”`} /></td>
                                    <td className="px-6 py-4 font-bold text-slate-800">{page.title}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500 hidden md:table-cell">/{page.slug}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1.5">
                                            {page.is_published ? (
                                                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">Published</span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 flex items-center gap-1"><EyeOff size={11} /> Draft</span>
                                            )}
                                            {page.show_in_footer && (
                                                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700">Footer</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            {page.is_published && (
                                                <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer" aria-label="View" className="w-9 h-9 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1D1D7E]">
                                                    <ExternalLink size={15} />
                                                </a>
                                            )}
                                            <Link href={`/dashboard/pages/${page.id}`} aria-label="Edit" className="w-9 h-9 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1D1D7E]">
                                                <Edit3 size={15} />
                                            </Link>
                                            <button onClick={() => handleDelete(page)} aria-label="Delete" className="w-9 h-9 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
