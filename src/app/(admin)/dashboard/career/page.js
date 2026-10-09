"use client";
import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminApi";
import { mediaUrl } from "@/lib/api";
import { useSelection } from "@/lib/useSelection";
import BulkActions from "@/components/admin/bulk/BulkActions";
import { SelectAllCheckbox, SelectRowCheckbox } from "@/components/admin/bulk/SelectCheckbox";

export default function CareerApplicationsList() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const selection = useSelection(applications);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await adminFetch("/api/career/");
            setApplications(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(`Applications could not be loaded: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleDelete = async (id) => {
        if (!confirm("Delete this application?\n\nYou can restore it from Recently deleted for 7 days.")) return;

        try {
            setDeletingId(id);
            await adminFetch(`/api/career/${id}`, { method: "DELETE" });

            setApplications((prev) => prev.filter((item) => item.id !== id));
        } catch (err) {
            alert(`Could not delete the application: ${err.message}`);
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="max-w-7xl mx-auto p-8">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Career Applications</h1>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-600 rounded flex items-center justify-between gap-4">
                    <span>{error}</span>
                    <button onClick={fetchApplications} className="shrink-0 px-3 py-1 text-sm bg-white border border-red-200 rounded hover:bg-red-50">
                        Retry
                    </button>
                </div>
            )}

            <BulkActions
                resource="career"
                selection={selection}
                noun={["application", "applications"]}
                onDeleted={(ids) => setApplications((prev) => prev.filter((a) => !ids.includes(a.id)))}
            />

            {/* Loading */}
            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : error ? null : applications.length === 0 ? (
                <div className="text-center py-10">No applications found</div>
            ) : (
                <div className="overflow-x-auto bg-white shadow rounded-lg">
                    <table className="w-full border-collapse">

                        {/* Table Head */}
                        <thead className="bg-gray-100 text-left text-sm">
                            <tr>
                                <th className="p-3 w-10"><SelectAllCheckbox selection={selection} label="Select all applications" /></th>
                                <th className="p-3">#</th>
                                <th className="p-3">Photo</th>
                                <th className="p-3">Name</th>
                                <th className="p-3">Company</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">LinkedIn</th>
                                <th className="p-3">Applied On</th>
                                <th className="p-3">CV</th>
                                <th className="p-3">Public Contact</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>

                        {/* Table Body */}
                        <tbody>
                            {applications.map((item, index) => (
                                <tr key={item.id} className={`border-b ${selection.isSelected(item.id) ? "bg-indigo-50/60" : "hover:bg-gray-50"}`}>
                                    <td className="p-3"><SelectRowCheckbox selection={selection} id={item.id} label={`Select ${item.first_name} ${item.last_name}`} /></td>

                                    {/* Index */}
                                    <td className="p-3">{index + 1}</td>

                                    {/* Photo */}
                                    <td className="p-3">
                                        {item.image_url ? (
                                            <a href={mediaUrl(item.image_url)} target="_blank" rel="noopener noreferrer">
                                                {/* eslint-disable-next-line @next/next/no-img-element -- applicant upload */}
                                                <img src={mediaUrl(item.image_url)} alt={`${item.first_name} ${item.last_name}`} className="w-10 h-10 rounded-full object-cover border" />
                                            </a>
                                        ) : (
                                            <span className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center">
                                                {(item.first_name?.[0] || "") + (item.last_name?.[0] || "")}
                                            </span>
                                        )}
                                    </td>

                                    {/* Name */}
                                    <td className="p-3 font-medium">
                                        {item.first_name} {item.last_name}
                                    </td>

                                    {/* Company */}
                                    <td className="p-3">
                                        {item.company_name || "-"}
                                    </td>

                                    {/* Email */}
                                    <td className="p-3">
                                        {item.email || "-"}
                                    </td>

                                    {/* LinkedIn */}
                                    <td className="p-3">
                                        <a
                                            href={item.linkedin_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-indigo-600 hover:underline"
                                        >
                                            View Profile
                                        </a>
                                    </td>

                                    {/* Applied On */}
                                    <td className="p-3">
                                        {formatDate(item.created_at)}
                                    </td>

                                    {/* CV */}
                                    <td className="p-3">
                                        <a
                                            href={mediaUrl(item.cv_url)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200 inline-block"
                                        >
                                            View CV
                                        </a>
                                    </td>

                                    {/* Public Contact */}
                                    <td className="p-3">
                                        {item.show_contact_public ? (
                                            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                                                Yes
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                                No
                                            </span>
                                        )}
                                    </td>

                                    {/* Action */}
                                    <td className="p-3">
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            disabled={deletingId === item.id}
                                            className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                                        >
                                            {deletingId === item.id ? "Deleting..." : "Delete"}
                                        </button>
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