"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Trash2, Mail, Phone } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { adminFetch } from "@/lib/adminApi";
import { useSelection } from "@/lib/useSelection";
import BulkActions from "@/components/admin/bulk/BulkActions";
import { SelectAllCheckbox, SelectRowCheckbox } from "@/components/admin/bulk/SelectCheckbox";
import EnquiryModal, { formatReceived } from "@/components/admin/enquiries/EnquiryModal";

const displayName = (l) => l.name || l.email || l.phone || "Visitor";

function Transcript({ messages }) {
    if (!messages?.length) return null;
    return (
        <ol className="space-y-2 max-h-80 overflow-y-auto pr-1" data-transcript="">
            {messages.map((m, i) => (
                <li key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <span className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap break-words ${m.role === "user" ? "bg-[#1D1D7E] text-white" : "bg-slate-100 text-slate-700"}`}>
                        <span className="block text-[10px] font-bold uppercase tracking-wider opacity-60 mb-0.5">{m.role === "user" ? "Visitor" : "Assistant"}</span>
                        {m.content}
                    </span>
                </li>
            ))}
        </ol>
    );
}

const leadFields = (l) => [
    { label: "Name", value: l.name },
    { label: "Company", value: l.company },
    { label: "Email address", value: l.email, type: "email" },
    { label: "Phone number", value: l.phone, type: "phone" },
    { label: "What they need", value: l.need, type: "multiline", wide: true },
    { label: "Page they were on", value: l.page, wide: true },
    { label: "Received", value: l.created_at, type: "date" },
    { label: "Last message", value: l.updated_at, type: "date" },
    { label: "Conversation", value: <Transcript messages={l.transcript} />, type: "node", wide: true },
];

export default function ChatLeads() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewing, setViewing] = useState(null);
    const selection = useSelection(leads);
    const closeView = useCallback(() => setViewing(null), []);

    useEffect(() => {
        adminFetch("/api/ai/admin/leads").then(
            (data) => { setLeads(Array.isArray(data) ? data : []); setLoading(false); },
            (err) => { toast.error(`Chat leads could not be loaded: ${err.message}`); setLoading(false); }
        );
    }, []);

    const view = async (lead) => {
        setViewing(lead);
        try {
            setViewing(await adminFetch(`/api/ai/admin/leads/${lead.id}`));
        } catch (err) {
            toast.error(`The conversation could not be loaded: ${err.message}`);
        }
    };

    const handleDelete = async (l) => {
        if (!confirm(`Delete the chat lead from ${displayName(l)}?\n\nYou can restore it from Recently deleted for 7 days.`)) return;
        try {
            await adminFetch(`/api/ai/admin/leads/${l.id}`, { method: "DELETE" });
            setLeads((prev) => prev.filter((x) => x.id !== l.id));
            setViewing(null);
            toast.success("Chat lead deleted");
        } catch (err) {
            toast.error(`Could not delete: ${err.message}`);
        }
    };

    return (
        <div className="p-6 md:p-10 min-h-screen bg-gray-50 text-slate-800">
            <Toaster position="top-center" />

            <h1 className="text-2xl font-bold text-[#1D1D7E]">Chat Leads</h1>
            <p className="text-sm text-slate-500 mt-1 mb-6">
                Visitors who left their details with the <Link href="/dashboard/ai" className="text-[#1D1D7E] underline">AI assistant</Link>. A lead appears as soon as the visitor gives an email or phone number; “Incomplete” means they haven&apos;t given everything yet. Click View for the whole conversation.
            </p>

            <BulkActions
                resource="chat-leads"
                selection={selection}
                noun={["chat lead", "chat leads"]}
                onDeleted={(ids) => setLeads((prev) => prev.filter((l) => !ids.includes(l.id)))}
            />

            <div className="bg-white rounded-xl shadow overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                        <tr>
                            <th className="p-4 w-10"><SelectAllCheckbox selection={selection} label="Select all chat leads" /></th>
                            <th className="p-4">Name</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Phone</th>
                            <th className="p-4">Needs</th>
                            <th className="p-4">Received</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" className="p-6 text-center">Loading...</td></tr>
                        ) : leads.length === 0 ? (
                            <tr><td colSpan="7" className="p-6 text-center">No chat leads yet</td></tr>
                        ) : (
                            leads.map((l) => (
                                <tr key={l.id} className={`border-b ${selection.isSelected(l.id) ? "bg-indigo-50/60" : "hover:bg-slate-50/40"}`} data-lead={l.email || l.phone}>
                                    <td className="p-4"><SelectRowCheckbox selection={selection} id={l.id} label={`Select ${displayName(l)}`} /></td>
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800">{l.name || <span className="text-slate-400 font-normal italic">No name yet</span>}</div>
                                        {l.company && <div className="text-xs text-slate-400">{l.company}</div>}
                                        {!l.complete && <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 rounded px-1.5 py-0.5">Incomplete</span>}
                                    </td>
                                    <td className="p-4">{l.email ? <span className="flex items-center gap-2"><Mail size={14} className="text-gray-400 shrink-0" />{l.email}</span> : "—"}</td>
                                    <td className="p-4">{l.phone ? <span className="flex items-center gap-2 whitespace-nowrap"><Phone size={14} className="text-gray-400 shrink-0" />{l.phone}</span> : "—"}</td>
                                    <td className="p-4 max-w-[240px]"><span className="line-clamp-2">{l.need || "—"}</span></td>
                                    <td className="p-4 text-sm text-slate-500 whitespace-nowrap">{formatReceived(l.created_at) || "—"}</td>
                                    <td className="p-4">
                                        <div className="flex justify-end gap-2">
                                            <button type="button" onClick={() => view(l)} className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                                                <Eye size={14} /> View
                                            </button>
                                            <button type="button" onClick={() => handleDelete(l)} aria-label={`Delete chat lead from ${displayName(l)}`} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <EnquiryModal
                open={!!viewing}
                title={viewing ? `Chat lead: ${displayName(viewing)}` : ""}
                subtitle={viewing?.created_at ? `Received ${formatReceived(viewing.created_at)}` : "AI assistant"}
                fields={viewing ? leadFields(viewing) : []}
                email={viewing?.email}
                phone={viewing?.phone}
                replySubject="Your enquiry with Vortexian Tech"
                onClose={closeView}
                onDelete={viewing ? () => handleDelete(viewing) : undefined}
            />
        </div>
    );
}
