import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({ children }) {
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