"use client";
import { useCallback, useEffect, useState } from "react";
import { Eye, Trash2, Mail, Phone } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { adminFetch } from "@/lib/adminApi";
import { useSelection } from "@/lib/useSelection";
import BulkActions from "@/components/admin/bulk/BulkActions";
import { SelectAllCheckbox, SelectRowCheckbox } from "@/components/admin/bulk/SelectCheckbox";
import EnquiryModal, { formatReceived } from "@/components/admin/enquiries/EnquiryModal";

// Every field of the home page "Drop us a Line" form, in form order
const enquiryFields = (q) => [
    { label: "Full name", value: q.full_name },
    { label: "Company name", value: q.company_name },
    { label: "Website URL", value: q.website_url, type: "url" },
    { label: "Email address", value: q.email, type: "email" },
    { label: "Phone number", value: q.phone_number, type: "phone" },
    { label: "Designation", value: q.designation },
    { label: "Subject", value: q.subject, wide: true },
    { label: "Message", value: q.message, type: "multiline", wide: true },
    { label: "Received", value: q.created_at, type: "date", wide: true },
];

export default function HomePageEnquiries() {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewing, setViewing] = useState(null);
    const selection = useSelection(quotes);
    const closeView = useCallback(() => setViewing(null), []);

    useEffect(() => {
        adminFetch("/api/contact-us/contact-us").then(
            (data) => { setQuotes(Array.isArray(data) ? data : []); setLoading(false); },
            (err) => { toast.error(`Enquiries could not be loaded: ${err.message}`); setLoading(false); }
        );
    }, []);

    const handleDelete = async (q) => {
        if (!confirm(`Delete the enquiry from ${q.full_name}?\n\nYou can restore it from Recently deleted for 7 days.`)) return;
        try {
            await adminFetch(`/api/contact-us/contact-us/${q.id}`, { method: "DELETE" });
            setQuotes((prev) => prev.filter((x) => x.id !== q.id));
            setViewing(null);
            toast.success("Enquiry deleted");
        } catch (err) {
            toast.error(`Could not delete: ${err.message}`);
        }
    };

    return (
        <div className="p-6 md:p-10 min-h-screen bg-gray-50 text-slate-800">
            <Toaster position="top-center" />

            <h1 className="text-2xl font-bold text-[#1D1D7E]">Home Page Enquiries</h1>
            <p className="text-sm text-slate-500 mt-1 mb-6">Messages sent from the “Drop us a Line” form on the home page. Click View to see everything the visitor submitted.</p>

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
                            <th className="p-4">Subject</th>
                            <th className="p-4">Received</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" className="p-6 text-center">Loading...</td></tr>
                        ) : quotes.length === 0 ? (
                            <tr><td colSpan="7" className="p-6 text-center">No enquiries yet</td></tr>
                        ) : (
                            quotes.map((q) => (
                                <tr key={q.id} className={`border-b ${selection.isSelected(q.id) ? "bg-indigo-50/60" : "hover:bg-slate-50/40"}`}>
                                    <td className="p-4"><SelectRowCheckbox selection={selection} id={q.id} label={`Select ${q.full_name}`} /></td>
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800">{q.full_name}</div>
                                        {q.company_name && <div className="text-xs text-slate-400">{q.company_name}</div>}
                                    </td>
                                    <td className="p-4">
                                        <span className="flex items-center gap-2"><Mail size={14} className="text-gray-400 shrink-0" />{q.email}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="flex items-center gap-2 whitespace-nowrap"><Phone size={14} className="text-gray-400 shrink-0" />{q.phone_number}</span>
                                    </td>
                                    <td className="p-4 max-w-[220px]"><span className="line-clamp-2">{q.subject || "—"}</span></td>
                                    <td className="p-4 text-sm text-slate-500 whitespace-nowrap">{formatReceived(q.created_at) || "—"}</td>
                                    <td className="p-4">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setViewing(q)}
                                                className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                            >
                                                <Eye size={14} /> View
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(q)}
                                                aria-label={`Delete enquiry from ${q.full_name}`}
                                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
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
                title={viewing ? `Enquiry from ${viewing.full_name}` : ""}
                subtitle={viewing?.created_at ? `Received ${formatReceived(viewing.created_at)}` : "Home page enquiry"}
                fields={viewing ? enquiryFields(viewing) : []}
                email={viewing?.email}
                phone={viewing?.phone_number}
                replySubject={viewing?.subject}
                onClose={closeView}
                onDelete={viewing ? () => handleDelete(viewing) : undefined}
            />
        </div>
    );
}
