"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { backToSiteHref } from "@/lib/adminMode";

// "← Back to site" link for the login and register screens.
// The target (page you came from) is only known in the browser, so it is
// resolved on click; the plain href is the home page.
export default function BackToSite({ className = "" }) {
    const router = useRouter();

    const onClick = (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return; // new tab etc.
        e.preventDefault();
        router.push(backToSiteHref());
    };

    return (
        <Link
            href="/"
            onClick={onClick}
            className={`inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-gray-400 hover:text-[#1D1D7E] transition-colors ${className}`}
        >
            <ArrowLeft size={14} aria-hidden="true" />
            Back to site
        </Link>
    );
}
