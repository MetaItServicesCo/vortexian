"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { Plus, Pencil, Trash2, Layers, Code, Share2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { adminFetch } from "@/lib/adminApi";
import { useSelection } from "@/lib/useSelection";
import BulkActions from "@/components/admin/bulk/BulkActions";
import { SelectAllCheckbox, SelectRowCheckbox } from "@/components/admin/bulk/SelectCheckbox";

const iconMap = {
    Layers: <Layers className="w-4 h-4 text-[#5DB4D1]" />,
    Code: <Code className="w-4 h-4 text-[#5DB4D1]" />,
    Share2: <Share2 className="w-4 h-4 text-[#5DB4D1]" />,
};

export default function AdminServicesList() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const selection = useSelection(services);

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

    // Quick switch for "Show in Services menu" straight from the list
    const [menuBusy, setMenuBusy] = useState(null);
    const toggleMenu = async (service) => {
        const next = service.show_in_menu === false;
        setMenuBusy(service.id);
        try {
            await adminFetch(`/api/services/update-service/${service.id}`, { method: "PATCH", body: { show_in_menu: next } });
            setServices((prev) => prev.map((s) => (s.id === service.id ? { ...s, show_in_menu: next } : s)));
            toast.success(next ? `“${service.service_title}” added to the Services menu` : `“${service.service_title}” hidden from the Services menu`);
        } catch (err) {
            toast.error(`Could not update the menu: ${err.message}`);
        } finally {
            setMenuBusy(null);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this service? Its page will stop working.\n\nYou can restore it from Recently deleted for 7 days.")) return;

        try {
            const token = localStorage.getItem("token"); // ✅ fix 2
            await axios.delete(`/api/services/delete-service/${id}`, {
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

            <BulkActions
                resource="services"
                selection={selection}
                noun={["service", "services"]}
                deleteWarning="Their pages will stop working until restored."
                onDeleted={(ids) => setServices((prev) => prev.filter((s) => !ids.includes(s.id)))}
            />

            {/* TABLE */}
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-100 border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100/70 border-b border-gray-200 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                <th className="p-4 pl-6 w-10"><SelectAllCheckbox selection={selection} label="Select all services" /></th>
                                <th className="p-4">
                                    Service Overview
                                </th>

                                <th className="p-4">Category</th>

                                <th className="p-4">Services menu</th>

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
                                        colSpan="5"
                                        className="text-center py-10 text-xs font-bold text-gray-400 uppercase tracking-widest"
                                    >
                                        Loading core capabilities schema...
                                    </td>
                                </tr>
                            ) : services.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
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
                                        className={`transition-colors ${selection.isSelected(service.id) ? "bg-indigo-50/60" : "hover:bg-slate-50/50"}`}
                                    >
                                        <td className="p-4 pl-6"><SelectRowCheckbox selection={selection} id={service.id} label={`Select “${service.service_title}”`} /></td>
                                        {/* SERVICE INFO */}
                                        <td className="p-4 max-w-xs">
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

                                        {/* SERVICES MENU */}
                                        <td className="p-4">
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={service.show_in_menu !== false}
                                                aria-label={`Show “${service.service_title}” in the Services menu`}
                                                title="Click to show or hide in the website's Services dropdown"
                                                disabled={menuBusy === service.id}
                                                onClick={() => toggleMenu(service)}
                                                className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border transition disabled:opacity-50 ${
                                                    service.show_in_menu !== false
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
                                                        : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                                                }`}
                                            >
                                                {service.show_in_menu !== false ? "In menu" : "Hidden"}
                                            </button>
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