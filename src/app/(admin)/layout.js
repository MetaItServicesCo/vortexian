"use client";

import Sidebar from "@/components/admin/Sidebar";
import AdminGuard from "@/components/admin/AdminGuard";

export default function AdminLayout({ children }) {
    return (
        <AdminGuard>
            {(admin) => (
                <div className="flex min-h-screen bg-gray-50">
                    <Sidebar />

                    <div className="flex-1 flex flex-col">
                        <header className="h-16 bg-white border-b flex items-center px-8 justify-end">
                            <span className="text-sm font-bold text-[#1D1D7E]">Welcome, {admin.username}</span>
                        </header>

                        <main className="p-8">
                            {children}
                        </main>
                    </div>
                </div>
            )}
        </AdminGuard>
    );
}
