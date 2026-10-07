"use client";
import React, { useEffect, useState } from "react";
import {
    FiLayers, FiUsers, FiPlus, FiBriefcase, FiFileText,
    FiMail, FiInbox, FiSend, FiUserCheck,
} from "react-icons/fi";
import Link from "next/link";

const STAT_SOURCES = [
    { label: "Services", path: "/api/services/", href: "/dashboard/services", icon: <FiLayers />, color: "bg-blue-500" },
    { label: "Portfolio Projects", path: "/api/portfolio/", href: "/dashboard/portfolio", icon: <FiBriefcase />, color: "bg-cyan-500" },
    { label: "Blog Posts", path: "/api/blog/public", href: "/dashboard/blog", icon: <FiFileText />, color: "bg-indigo-500" },
    { label: "Team Members", path: "/api/team/teams", href: "/dashboard/team", icon: <FiUsers />, color: "bg-[#1D1D7E]" },
    { label: "Quote Requests", path: "/api/contact/", href: "/dashboard/contacts", icon: <FiInbox />, color: "bg-emerald-500", auth: true },
    { label: "Home Page Enquiries", path: "/api/contact-us/contact-us", href: "/dashboard/quotes", icon: <FiMail />, color: "bg-teal-500", auth: true },
    { label: "Job Applications", path: "/api/career/", href: "/dashboard/career", icon: <FiUserCheck />, color: "bg-amber-500", auth: true },
    { label: "Newsletter Subscribers", path: "/api/newsletter/subscribers", href: "/dashboard/newsletter", icon: <FiSend />, color: "bg-rose-500", auth: true },
];

const DashboardHome = () => {
    const [counts, setCounts] = useState({});

    useEffect(() => {
        const token = localStorage.getItem("token");

        Promise.all(
            STAT_SOURCES.map(async (source) => {
                try {
                    const res = await fetch(source.path, {
                        headers: source.auth ? { Authorization: `Bearer ${token}` } : {},
                    });
                    if (!res.ok) return [source.label, "—"];
                    const data = await res.json();
                    return [source.label, Array.isArray(data) ? data.length : "—"];
                } catch {
                    return [source.label, "—"];
                }
            })
        ).then((entries) => setCounts(Object.fromEntries(entries)));
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-[#1D1D7E] uppercase tracking-tighter">
                    Admin Overview
                </h1>
                <Link href="/dashboard/services/new" className="bg-[#1D1D7E] text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#5DB4D1] transition-all font-bold uppercase text-xs tracking-widest">
                    <FiPlus /> Add New Service
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {STAT_SOURCES.map((stat) => (
                    <Link
                        key={stat.label}
                        href={stat.href}
                        className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 hover:border-[#5DB4D1]/50 hover:shadow-md transition-all"
                    >
                        <div className={`w-16 h-16 shrink-0 ${stat.color} text-white flex items-center justify-center rounded-xl text-2xl`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                            <h3 className="text-3xl font-black text-black">
                                {counts[stat.label] ?? "…"}
                            </h3>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default DashboardHome;
