"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { Plus, Pencil, Trash2, Layers, Code, Share2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const iconMap = {
    Layers: <Layers className="w-4 h-4 text-[#5DB4D1]" />,
    Code: <Code className="w-4 h-4 text-[#5DB4D1]" />,
    Share2: <Share2 className="w-4 h-4 text-[#5DB4D1]" />,
};

export default function AdminServicesList() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    // FastAPI Base URL
    const API_URL = "/api/services/"; // ✅ fix 1

    // GET ALL SERVICES
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await axios.get(API_URL);

                console.log(res.data);

                setServices(res.data);
            } catch (error) {
                console.error("Error fetching services:", error);
                toast.error("Failed to load services");
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this capability?")) return;

        try {
            const token = localStorage.getItem("token"); // ✅ fix 2
            await axios.delete(`${API_URL}/delete-service/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setServices((prev) => prev.filter((service) => service.id !== id));
            toast.success("Service deleted successfully");
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.detail || "Failed to delete service");
        }
    };

    return (
        <div className="p-6 md:p-10 min-h-screen bg-gray-50 text-slate-800 font-sans">
            <Toaster position="top-center" />

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 pb-6 border-b border-gray-200">
                <div>
                    <h1 className="text-2xl font-black text-[#1D1D7E] uppercase tracking-tight">
                        Services Matrix
                    </h1>

                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-1">
                        Manage Vortexian Digital Assets
                    </p>
                </div>

                <Link
                    href="/dashboard/services/new"
                    className="flex items-center justify-center gap-2 bg-[#1D1D7E] text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#5DB4D1] hover:text-black transition-all shadow-lg shadow-blue-950/10 self-start sm:self-center"
                >
                    <Plus size={16} />
                    Add New Service
                </Link>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-100 border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100/70 border-b border-gray-200 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                <th className="p-4 pl-6">
                                    Service Overview
                                </th>

                                <th className="p-4">Category</th>

                                <th className="p-4">
                                    Keywords Mapping
                                </th>

                                <th className="p-4 text-center pr-6">
                                    Management Ops
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 text-sm">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="text-center py-10 text-xs font-bold text-gray-400 uppercase tracking-widest"
                                    >
                                        Loading core capabilities schema...
                                    </td>
                                </tr>
                            ) : services.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="text-center py-10 text-xs font-bold text-gray-400 uppercase tracking-widest"
                                    >
                                        No active services registered inside
                                        system storage.
                                    </td>
                                </tr>
                            ) : (
                                services.map((service) => (
                                    <tr
                                        key={service.id}
                                        className="hover:bg-slate-50/50 transition-colors"
                                    >
                                        {/* SERVICE INFO */}
                                        <td className="p-4 pl-6 max-w-xs">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                                    {iconMap[
                                                        service.lucide_icon
                                                    ] || (
                                                            <Layers className="w-4 h-4" />
                                                        )}
                                                </div>

                                                <div>
                                                    <p className="font-extrabold text-slate-900 leading-tight">
                                                        {
                                                            service.service_title
                                                        }
                                                    </p>

                                                    <p className="text-gray-400 text-[11px] font-medium truncate mt-0.5">
                                                        {service.url_slug}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* CATEGORY */}
                                        <td className="p-4">
                                            <span className="text-[10px] font-black uppercase bg-blue-50 text-[#1D1D7E] px-2.5 py-1 rounded-md border border-blue-100">
                                                {service.category_stack}
                                            </span>
                                        </td>

                                        {/* KEYWORDS */}
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-1 max-w-xs">
                                                {service.keywords
                                                    ?.split(",")
                                                    .slice(0, 3)
                                                    .map((kw, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="text-[10px] bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded"
                                                        >
                                                            {kw.trim()}
                                                        </span>
                                                    ))}
                                            </div>
                                        </td>

                                        {/* ACTIONS */}
                                        <td className="p-4 text-center pr-6">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link
                                                    href={`/dashboard/services/edit/${service.id}`}
                                                    className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-all"
                                                >
                                                    <Pencil size={14} />
                                                </Link>

                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            service.id
                                                        )
                                                    }
                                                    className="w-8 h-8 rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-all cursor-pointer"
                                                >
                                                    <Trash2 size={14} />
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