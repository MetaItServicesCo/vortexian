"use client";

import { useEffect, useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import Sidebar from "@/components/admin/Sidebar";
import AdminGuard from "@/components/admin/AdminGuard";

export default function AdminLayout({ children }) {
    // Phones/tablets: the sidebar slides in from the left behind a menu button
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        if (!menuOpen) return;
        const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [menuOpen]);

    return (
        <AdminGuard>
            {(admin) => (
                <div className="flex min-h-screen bg-gray-50">
                    <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
                    {menuOpen && (
                        <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setMenuOpen(false)} aria-hidden="true" />
                    )}

                    <div className="flex-1 flex flex-col min-w-0">
                        <header className="h-16 bg-white border-b flex items-center px-4 md:px-8 justify-between md:justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => setMenuOpen((v) => !v)}
                                aria-label={menuOpen ? "Close menu" : "Open menu"}
                                aria-controls="admin-sidebar"
                                aria-expanded={menuOpen}
                                className="md:hidden w-10 h-10 -ml-2 flex items-center justify-center rounded-lg text-[#1D1D7E] hover:bg-gray-100"
                            >
                                {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                            </button>
                            <span className="text-sm font-bold text-[#1D1D7E] truncate">Welcome, {admin.username}</span>
                        </header>

                        <main className="p-4 md:p-8">
                            {children}
                        </main>
                    </div>
                </div>
            )}
        </AdminGuard>
    );
}
