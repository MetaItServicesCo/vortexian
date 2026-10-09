"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Loader2, Plus, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { adminFetch } from "@/lib/adminApi";
import NewsletterHeader, { useNewsletterStatus } from "@/components/admin/newsletter/NewsletterHeader";
import { CampaignStatus, formatWhen } from "@/components/admin/newsletter/CampaignStatus";

export default function NewsletterCampaigns() {
    const router = useRouter();
    const status = useNewsletterStatus();
    const [campaigns, setCampaigns] = useState(null);

    useEffect(() => {
        adminFetch("/api/newsletter/campaigns").then(setCampaigns, (err) => {
            toast.error(`Newsletters could not be loaded: ${err.message}`);
            setCampaigns([]);
        });
    }, []);

    const duplicate = async (c) => {
        try {
            const copy = await adminFetch(`/api/newsletter/campaigns/${c.id}/duplicate`, { method: "POST" });
            router.push(`/dashboard/newsletter/campaigns/${copy.id}`);
        } catch (err) {
            toast.error(err.message);
        }
    };

    const remove = async (c) => {
        const note = c.status === "draft" ? "" : "\n\nIt has already been sent; this only removes it from this list.";
        if (!confirm(`Delete the newsletter “${c.subject}”?${note}`)) return;
        try {
            await adminFetch(`/api/newsletter/campaigns/${c.id}`, { method: "DELETE" });
            setCampaigns((prev) => prev.filter((x) => x.id !== c.id));
            toast.success("Newsletter deleted");
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className="p-6 md:p-10 min-h-screen bg-gray-50 text-slate-800">
            <Toaster position="top-center" />
            <NewsletterHeader status={status} />

            <div className="flex justify-end mb-4">
                <Link href="/dashboard/newsletter/campaigns/new" className="inline-flex items-center gap-2 bg-[#1D1D7E] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#16166a]">
                    <Plus size={16} /> New newsletter
                </Link>
            </div>

            {campaigns === null ? (
                <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-[#1D1D7E]" /></div>
            ) : campaigns.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 text-center">
                    <p className="font-semibold text-slate-600">No newsletters yet</p>
                    <p className="text-sm text-slate-400 mt-1 mb-4">Write your first one: subject, content, a test to yourself, then send.</p>
                    <Link href="/dashboard/newsletter/campaigns/new" className="text-[#1D1D7E] font-semibold underline">Write a newsletter</Link>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                            <tr>
                                <th className="p-4">Subject</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Recipients</th>
                                <th className="p-4">Date</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {campaigns.map((c) => (
                                <tr key={c.id} className="hover:bg-slate-50/50">
                                    <td className="p-4">
                                        <Link href={`/dashboard/newsletter/campaigns/${c.id}`} className="font-semibold text-slate-800 hover:text-[#1D1D7E]">{c.subject}</Link>
                                        {c.preheader && <div className="text-xs text-slate-400 truncate max-w-xs">{c.preheader}</div>}
                                    </td>
                                    <td className="p-4"><CampaignStatus campaign={c} /></td>
                                    <td className="p-4 text-sm text-slate-600">
                                        {c.status === "draft" ? "—" : `${c.sent_count} of ${c.recipients_count} delivered${c.failed_count ? ` · ${c.failed_count} failed` : ""}`}
                                    </td>
                                    <td className="p-4 text-sm text-slate-500 whitespace-nowrap">{c.sent_at ? `Sent ${formatWhen(c.sent_at)}` : `Created ${formatWhen(c.created_at)}`}</td>
                                    <td className="p-4">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/dashboard/newsletter/campaigns/${c.id}`} className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                                                {c.status === "draft" ? "Edit" : "Open"}
                                            </Link>
                                            <button type="button" onClick={() => duplicate(c)} aria-label={`Duplicate “${c.subject}”`} title="Duplicate as a new draft" className="p-1.5 text-slate-500 hover:bg-slate-100 rounded"><Copy size={15} /></button>
                                            {c.status !== "sending" && (
                                                <button type="button" onClick={() => remove(c)} aria-label={`Delete “${c.subject}”`} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={15} /></button>
                                            )}
                                        </div>
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
