"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useSelection } from "@/lib/useSelection";
import BulkActions from "@/components/admin/bulk/BulkActions";
import { SelectAllCheckbox, SelectRowCheckbox } from "@/components/admin/bulk/SelectCheckbox";

export default function ContactsPage() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const selection = useSelection(contacts);

    const fetchContacts = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.get(
                "/api/contact/",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setContacts(response.data);
        } catch (error) {
            console.log(error.response?.data);
            toast.error(
                error.response?.data?.detail ||
                "Failed to load contacts"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const deleteContact = async (id) => {
        if (!confirm("Delete this quote request?\n\nYou can restore it from Recently deleted for 7 days.")) return;

        try {
            const token = localStorage.getItem("token");

            await axios.delete(
                `/api/contact/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setContacts((prev) =>
                prev.filter((item) => item.id !== id)
            );

            toast.success("Deleted successfully");
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    return (
        <div className="p-8">
            <Toaster />

            <h1 className="text-3xl font-bold mb-6">
                Contact Requests
            </h1>

            <BulkActions
                resource="contacts"
                selection={selection}
                noun={["quote request", "quote requests"]}
                onDeleted={(ids) => setContacts((prev) => prev.filter((c) => !ids.includes(c.id)))}
            />

            <div className="bg-white rounded-xl shadow overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 w-10"><SelectAllCheckbox selection={selection} label="Select all quote requests" /></th>
                            <th className="p-3">Name</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Phone</th>
                            <th className="p-3">Service</th>
                            <th className="p-3">Message</th>
                            <th className="p-3">File</th>
                            <th className="p-3">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="8" className="text-center p-10">
                                    <Loader2 className="animate-spin mx-auto" />
                                </td>
                            </tr>
                        ) : contacts.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center p-10">
                                    No Contacts Found
                                </td>
                            </tr>
                        ) : (
                            contacts.map((contact) => (
                                <tr key={contact.id} className={`border-b ${selection.isSelected(contact.id) ? "bg-indigo-50/60" : ""}`}>
                                    <td className="p-3"><SelectRowCheckbox selection={selection} id={contact.id} label={`Select ${contact.first_name} ${contact.last_name}`} /></td>
                                    <td className="p-3">
                                        {contact.first_name}{" "}
                                        {contact.last_name}
                                    </td>

                                    <td className="p-3">
                                        {contact.email}
                                    </td>

                                    <td className="p-3">
                                        {contact.phone}
                                    </td>

                                    <td className="p-3">
                                        {contact.service}
                                    </td>

                                    <td className="p-3">
                                        {contact.message}
                                    </td>

                                    <td className="p-3">
                                        {contact.project_file ? (
                                            <a
                                                href={`${contact.project_file}`}
                                                target="_blank"
                                                className="text-blue-600"
                                            >
                                                View File
                                            </a>
                                        ) : (
                                            "No File"
                                        )}
                                    </td>

                                    <td className="p-3">
                                        <button
                                            onClick={() =>
                                                deleteContact(contact.id)
                                            }
                                            className="text-red-600"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}