"use client";
import React from "react";
import { FiDatabase, FiLayers, FiUsers, FiPlus } from "react-icons/fi";
import Link from "next/link";

const DashboardHome = () => {
    const stats = [
        { label: "Total Services", value: "19", icon: <FiLayers />, color: "bg-blue-500" },
        { label: "Total Categories", value: "4", icon: <FiDatabase />, color: "bg-cyan-500" },
        { label: "Team Members", value: "8", icon: <FiUsers />, color: "bg-[#1D1D7E]" },
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-[#1D1D7E] uppercase tracking-tighter">
                    Admin Overview
                </h1>
                <Link href="/dashboard/services/create" className="bg-[#1D1D7E] text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#5DB4D1] transition-all font-bold uppercase text-xs tracking-widest">
                    <FiPlus /> Add New Service
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
                        <div className={`w-16 h-16 ${stat.color} text-white flex items-center justify-center rounded-xl text-2xl`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                            <h3 className="text-3xl font-black text-black">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DashboardHome;