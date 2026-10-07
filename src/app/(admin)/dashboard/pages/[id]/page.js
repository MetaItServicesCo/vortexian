"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import PageForm from "@/components/admin/pages/PageForm";
import { adminFetch } from "@/lib/adminApi";

export default function EditPage() {
    const { id } = useParams();
    const [page, setPage] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        adminFetch(`/api/pages/id/${id}`).then(setPage).catch((err) => setError(err.message));
    }, [id]);

    if (error) {
        return (
            <div className="space-y-3">
                <p className="text-slate-500">{error}</p>
                <Link href="/dashboard/pages" className="text-[#1D1D7E] font-bold">Back to Pages</Link>
            </div>
        );
    }

    if (!page) {
        return <div className="py-24 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#1D1D7E]" /></div>;
    }

    return <PageForm key={page.id} initial={page} />;
}
