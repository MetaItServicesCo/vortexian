"use client";

import Sidebar from "@/components/admin/Sidebar";
import useAuthGuard from "@/hooks/useAuthGuard";

export default function AdminLayout({ children }) {
    const { checking } = useAuthGuard();

    if (checking) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <p className="text-sm font-medium text-gray-400">Checking session...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sirf Dashboard ka Sidebar */}
            <Sidebar />

            <div className="flex-1 flex flex-col">
                {/* Aap yahan chota sa Admin Header rakh sakte hain agar chahein */}
                <header className="h-16 bg-white border-b flex items-center px-8 justify-end">
                    <span className="text-sm font-bold text-[#1D1D7E]">Welcome, Admin</span>
                </header>

                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}