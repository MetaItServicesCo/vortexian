"use client";
import { useState, useEffect } from "react";
import { UserPlus, Edit3, Trash2, ShieldAlert, Loader2 } from "lucide-react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

export default function AdminTeamDashboardManager() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadTeamData() {
            try {
                const response = await fetch("/api/team");
                if (response.ok) setMembers(await response.json());
            } catch (err) {
                toast.error("Pipeline failure fetching team arrays index records.");
            } finally {
                setLoading(false);
            }
        }
        loadTeamData();
    }, []);

    const handlePurgeSequence = async (id) => {
        if (!confirm("Erase selected professional profile node from system database permanently?")) return;
        try {
            const res = await fetch(`/api/team/${id}`, { method: "DELETE" });
            if (res.ok) {
                setMembers(members.filter((m) => m._id !== id));
                toast.success("Profile destroyed successfully.");
            }
        } catch (err) {
            toast.error("Execution error target.");
        }
    };

    return (
        <div className="p-6 md:p-10 min-h-screen bg-gray-50 text-slate-800 font-sans text-base">
            <Toaster position="top-center" />

            {/* ADMIN LEVEL FLEX WRAPPER BOARD TITLE PANELS */}
            <div className="mb-10 pb-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#1D1D7E] uppercase tracking-tight">Vortexian Roster Matrix</h1>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-0.5">Corporate Profiles Lifecycle Dashboard</p>
                </div>

                {/* TOP RIGHT INTERACTIVE ACTION TRIGGER ROUTER BUTTON */}
                <Link
                    href="/dashboard/team/create"
                    className="bg-[#1D1D7E] hover:bg-[#5DB4D1] text-white hover:text-black px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all duration-300 shadow-lg shadow-blue-900/10 cursor-pointer"
                >
                    <UserPlus size={16} /> Add Team Member
                </Link>
            </div>

            {/* GRID DATA STRUCTURE RENDER MODULE */}
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-100 border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100/70 border-b border-gray-200 text-slate-400 text-[11px] font-black uppercase tracking-widest">
                                <th className="p-4 pl-6">Professional Profile Details</th>
                                <th className="p-4">Assigned Active Capacity</th>
                                <th className="p-4">Connected Network Extensions</th>
                                <th className="p-4 text-center pr-6">Management Operations Desk</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-16 text-sm text-gray-400 font-bold uppercase tracking-widest">
                                        <div className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin text-[#1D1D7E]" /> Restructuring memory mapping arrays...</div>
                                    </td>
                                </tr>
                            ) : members.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-12 text-sm text-gray-400 font-bold uppercase tracking-widest">
                                        Zero corporate identities initialized inside server buffers logs.
                                    </td>
                                </tr>
                            ) : (
                                members.map((member) => (
                                    <tr key={member._id} className="hover:bg-slate-50/40 transition-colors">
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-gray-200 shadow-inner shrink-0">
                                                    <img src={member.image} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <p className="font-extrabold text-slate-900 text-base uppercase tracking-tight">{member.name}</p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-[10px] font-black bg-blue-50 text-[#1D1D7E] border border-blue-100 px-3 py-1.5 rounded-lg uppercase tracking-wider">
                                                {member.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-xs font-bold space-y-0.5 text-slate-500">
                                            {member.linkedin && <p>LN: <span className="text-gray-400 truncate max-w-[120px] inline-block align-bottom">{member.linkedin}</span></p>}
                                            {member.github && <p>GH: <span className="text-gray-400 truncate max-w-[120px] inline-block align-bottom">{member.github}</span></p>}
                                        </td>
                                        <td className="p-4 pr-6">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link
                                                    href={`/dashboard/team/edit/${member._id}`}
                                                    className="w-9 h-9 rounded-xl border border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-all cursor-pointer"
                                                >
                                                    <Edit3 size={15} />
                                                </Link>
                                                <button
                                                    onClick={() => handlePurgeSequence(member._id)}
                                                    className="w-9 h-9 rounded-xl border border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-all cursor-pointer"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
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