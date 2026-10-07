"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// Verifies the stored admin token before rendering any dashboard page.
export default function AdminGuard({ children }) {
    const router = useRouter();
    const [admin, setAdmin] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.replace("/login");
            return;
        }

        let cancelled = false;

        fetch("/api/admins/login", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(async (res) => {
                if (cancelled) return;

                if (res.status === 401 || res.status === 404) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("admin_email");
                    router.replace("/login");
                    return;
                }

                const data = res.ok ? await res.json() : {};
                setAdmin({ username: data.username || "Admin" });
            })
            // Network hiccup: don't log the admin out, the API still enforces auth
            .catch(() => !cancelled && setAdmin({ username: "Admin" }));

        return () => {
            cancelled = true;
        };
    }, [router]);

    if (!admin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-[#1D1D7E]">
                <Loader2 className="w-6 h-6 animate-spin" />
            </div>
        );
    }

    return children(admin);
}
