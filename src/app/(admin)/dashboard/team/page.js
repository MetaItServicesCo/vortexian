"use client";
import { useState, useEffect } from "react";
import { UserPlus, Edit3, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

export default function AdminTeamDashboardManager() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    useEffect(() => {
        async function loadTeamData() {
            try {
                const response = await fetch("http://localhost:8000/api/team/teams", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.detail || "Failed to fetch");
                }

                setMembers(data);
            } catch (err) {
                toast.error(err.message || "Error fetching team data");
            } finally {
                setLoading(false);
            }
        }

        loadTeamData();
    }, [token]);

    const handlePurgeSequence = async (id) => {
        if (!confirm("Delete this team member permanently?")) return;

        try {
            const res = await fetch(`http://localhost:8000/api/team/delete-team/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || "Delete failed");
            }

            setMembers((prev) => prev.filter((m) => m.id !== id));

            toast.success("Team member deleted successfully");
        } catch (err) {
            toast.error(err.message || "Execution error");
        }
    };

    return (
        <div className="p-6 md:p-10 min-h-screen bg-gray-50 text-slate-800 font-sans text-base">
            <Toaster position="top-center" />

            <div className="mb-10 pb-6 border-b border-gray-200 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-[#1D1D7E] uppercase">
                        Vortexian Roster Matrix
                    </h1>
                    <p className="text-gray-400 text-xs font-bold uppercase">
                        Corporate Profiles Dashboard
                    </p>
                </div>

                <Link
                    href="/dashboard/team/create"
                    className="bg-[#1D1D7E] text-white px-5 py-3 rounded-xl font-black text-xs uppercase flex items-center gap-2"
                >
                    <UserPlus size={16} /> Add Member
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-100 text-xs uppercase">
                                <th className="p-4">Profile</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Links</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-10">
                                        <Loader2 className="animate-spin inline" /> Loading...
                                    </td>
                                </tr>
                            ) : members.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-10">
                                        No team members found
                                    </td>
                                </tr>
                            ) : (
                                members.map((member) => (
                                    <tr key={member.id} className="border-t">
                                        <td className="p-4 flex items-center gap-3">
                                            <img
                                                src={`http://localhost:8000/${member.profile_image}`}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                            <span className="font-bold uppercase">
                                                {member.full_name}
                                            </span>
                                        </td>

                                        <td className="p-4">
                                            <span className="text-xs bg-blue-50 px-2 py-1 rounded">
                                                {member.designation}
                                            </span>
                                        </td>

                                        <td className="p-4 text-xs">
                                            {member.linkedin_link && (
                                                <p>LinkedIn: {member.linkedin_link}</p>
                                            )}
                                        </td>

                                        <td className="p-4 flex justify-center gap-2">
                                            <Link
                                                href={`/dashboard/team/edit/${member.id}`}
                                                className="p-2 border rounded"
                                            >
                                                <Edit3 size={14} />
                                            </Link>

                                            <button
                                                onClick={() =>
                                                    handlePurgeSequence(member.id)
                                                }
                                                className="p-2 border rounded text-red-500"
                                            >
                                                <Trash2 size={14} />
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