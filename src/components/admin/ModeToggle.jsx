"use client";

import Link from "next/link";
import { Globe, LayoutDashboard } from "lucide-react";

// Segmented "Website | Dashboard" switch shown to logged-in admins on both sides.
export default function ModeToggle({ active, siteHref, dashboardHref, className = "" }) {
    const item = (mode, href, Icon, label) => {
        const on = active === mode;
        return (
            <Link
                href={href}
                aria-current={on ? "page" : undefined}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    on ? "bg-[#1D1D7E] text-white shadow-sm" : "text-[#1D1D7E] hover:bg-[#1D1D7E]/10"
                }`}
            >
                <Icon size={14} aria-hidden="true" />
                {label}
            </Link>
        );
    };

    return (
        <nav aria-label="Switch between website and dashboard" className={`inline-flex items-center gap-0.5 rounded-full border border-[#1D1D7E]/15 bg-white p-0.5 ${className}`}>
            {item("website", siteHref, Globe, "Website")}
            {item("dashboard", dashboardHref, LayoutDashboard, "Dashboard")}
        </nav>
    );
}
