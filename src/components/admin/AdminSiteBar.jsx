"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ModeToggle from "@/components/admin/ModeToggle";
import { dashboardHrefFor, rememberSitePath } from "@/lib/adminMode";

// Website side of the Website | Dashboard switch. Renders nothing for visitors:
// it only appears once the stored admin token is confirmed by the API.
export default function AdminSiteBar() {
    const pathname = usePathname();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        let token = null;
        try {
            token = localStorage.getItem("token");
        } catch {
            return;
        }
        if (!token) return;

        let cancelled = false;
        fetch("/api/admins/login", { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => !cancelled && setIsAdmin(res.ok))
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (isAdmin) rememberSitePath(pathname + window.location.search);
    }, [isAdmin, pathname]);

    if (!isAdmin) return null;

    return (
        <div className="fixed bottom-5 left-4 z-[60] rounded-full shadow-lg shadow-slate-900/15" data-admin-toggle="">
            <ModeToggle active="website" siteHref={pathname} dashboardHref={dashboardHrefFor(pathname)} />
        </div>
    );
}
