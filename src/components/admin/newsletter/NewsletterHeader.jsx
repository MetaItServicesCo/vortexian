"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { adminFetch } from "@/lib/adminApi";

const TABS = [
    { href: "/dashboard/newsletter", label: "Subscribers", exact: true },
    { href: "/dashboard/newsletter/campaigns", label: "Newsletters" },
    { href: "/dashboard/newsletter/settings", label: "Settings" },
];

// Status of email sending (from /api/newsletter/status), shared by the newsletter pages
export function useNewsletterStatus() {
    const [status, setStatus] = useState(null);
    useEffect(() => {
        adminFetch("/api/newsletter/status").then(setStatus, () => setStatus({ configured: false, error: true }));
    }, []);
    return status;
}

export default function NewsletterHeader({ status }) {
    const pathname = usePathname();
    const active = (tab) => (tab.exact ? pathname === tab.href : pathname.startsWith(tab.href));

    return (
        <div className="mb-6 space-y-4">
            <div>
                <h1 className="text-2xl font-black text-[#1D1D7E] uppercase tracking-tight">Newsletter</h1>
                <p className="text-sm text-slate-500 mt-1">Write newsletters, send them to your subscribers, and manage the welcome email.</p>
            </div>

            <nav aria-label="Newsletter sections" className="flex gap-1 border-b border-gray-200">
                {TABS.map((tab) => (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        aria-current={active(tab) ? "page" : undefined}
                        className={`px-4 py-2.5 -mb-px text-sm font-semibold border-b-2 transition ${
                            active(tab) ? "border-[#1D1D7E] text-[#1D1D7E]" : "border-transparent text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        {tab.label}
                    </Link>
                ))}
            </nav>

            {status && !status.configured && (
                <div role="alert" className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold">Email sending isn&apos;t set up yet</p>
                        <p className="mt-0.5">Add the Resend API key to the server as <code className="font-mono">RESEND_API_KEY</code>. Until then you can write and preview newsletters, but nothing is sent and no welcome emails go out.</p>
                    </div>
                </div>
            )}
            {status?.configured && (
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500" data-testid="newsletter-status">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>Sending as <strong className="text-slate-700">{status.sender}</strong></span>
                    <span>·</span>
                    <span>{status.subscribers} subscriber{status.subscribers === 1 ? "" : "s"}</span>
                    <span>·</span>
                    <span>Welcome email {status.welcome_enabled ? "on" : "off"}</span>
                </p>
            )}
        </div>
    );
}
