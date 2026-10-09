"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, Trash2, Loader2, Paperclip } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { adminFetch } from "@/lib/adminApi";
import { useSelection } from "@/lib/useSelection";
import BulkActions from "@/components/admin/bulk/BulkActions";
import { SelectAllCheckbox, SelectRowCheckbox } from "@/components/admin/bulk/SelectCheckbox";
import EnquiryModal, { formatReceived } from "@/components/admin/enquiries/EnquiryModal";

const fullName = (c) => `${c.first_name || ""} ${c.last_name || ""}`.trim();

// Every field of the "Get a Quote" form, in form order
const requestFields = (c) => [
    { label: "First name", value: c.first_name },
    { label: "Last name", value: c.last_name },
    { label: "Phone", value: c.phone, type: "phone" },
    { label: "Email", value: c.email, type: "email" },
    { label: "Preferred contact method", value: c.preferred_contact_method },
    { label: "Services", value: c.service },
    { label: "Website URL", value: c.website_url, type: "url" },
    { label: "Completion date", value: c.completion_date },
    { label: "Attached file", value: c.project_file, type: "file", wide: true },
    { label: "Message", value: c.message, type: "multiline", wide: true },
    { label: "Received", value: c.created_at, type: "date", wide: true },
];

export default function QuoteRequestsPage() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewing, setViewing] = useState(null);
    const selection = useSelection(contacts);
    const closeView = useCallback(() => setViewing(null), []);

    useEffect(() => {
        adminFetch("/api/contact/").then(
            (data) => { setContacts(Array.isArray(data) ? data : []); setLoading(false); },
            (err) => { toast.error(`Quote requests could not be loaded: ${err.message}`); setLoading(false); }
        );
    }, []);

    const deleteContact = async (c) => {
        if (!confirm(`Delete the quote request from ${fullName(c)}?\n\nYou can restore it from Recently deleted for 7 days.`)) return;
        try {
            await adminFetch(`/api/contact/${c.id}`, { method: "DELETE" });
            setContacts((prev) => prev.filter((item) => item.id !== c.id));
            setViewing(null);
            toast.success("Quote request deleted");
        } catch (err) {
            toast.error(`Could not delete: ${err.message}`);
        }
    };

    return (
        <div className="p-8">
            <Toaster />

            <h1 className="text-3xl font-bold">Quote Requests</h1>
            <p className="text-sm text-slate-500 mt-1 mb-6">Requests sent from the “Get a Quote” form. Click View to see everything the visitor submitted.</p>

            <BulkActions
                resource="contacts"
                selection={selection}
                noun={["quote request", "quote requests"]}
                onDeleted={(ids) => setContacts((prev) => prev.filter((c) => !ids.includes(c.id)))}
            />

            <div className="bg-white rounded-xl shadow overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 text-sm">
                        <tr>
                            <th className="p-3 w-10"><SelectAllCheckbox selection={selection} label="Select all quote requests" /></th>
                            <th className="p-3">Name</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Phone</th>
                            <th className="p-3">Services</th>
                            <th className="p-3">Received</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="text-center p-10">
                                    <Loader2 className="animate-spin mx-auto" />
                                </td>
                            </tr>
                        ) : contacts.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center p-10">No quote requests yet</td>
                            </tr>
                        ) : (
                            contacts.map((contact) => (
                                <tr key={contact.id} className={`border-b ${selection.isSelected(contact.id) ? "bg-indigo-50/60" : "hover:bg-slate-50/40"}`}>
                                    <td className="p-3"><SelectRowCheckbox selection={selection} id={contact.id} label={`Select ${contact.first_name} ${contact.last_name}`} /></td>
                                    <td className="p-3">
                                        <div className="font-semibold flex items-center gap-1.5">
                                            {fullName(contact)}
                                            {contact.project_file && <Paperclip size={13} className="text-gray-400" aria-label="Has an attached file" />}
                                        </div>
                                    </td>
                                    <td className="p-3">{contact.email}</td>
                                    <td className="p-3 whitespace-nowrap">{contact.phone}</td>
                                    <td className="p-3 max-w-[220px]"><span className="line-clamp-2">{contact.service}</span></td>
                                    <td className="p-3 text-sm text-slate-500 whitespace-nowrap">{formatReceived(contact.created_at) || "—"}</td>
                                    <td className="p-3">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setViewing(contact)}
                                                className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                            >
                                                <Eye size={14} /> View
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => deleteContact(contact)}
                                                aria-label={`Delete quote request from ${fullName(contact)}`}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                            >
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
                title={viewing ? `Quote request from ${fullName(viewing)}` : ""}
                subtitle={viewing?.created_at ? `Received ${formatReceived(viewing.created_at)}` : "Get a Quote form"}
                fields={viewing ? requestFields(viewing) : []}
                email={viewing?.email}
                phone={viewing?.phone}
                replySubject={viewing ? `Your quote request (${viewing.service})` : ""}
                onClose={closeView}
                onDelete={viewing ? () => deleteContact(viewing) : undefined}
            />
        </div>
    );
}
