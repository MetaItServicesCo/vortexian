"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Loader2, RotateCcw, Save } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { SECTION_MAP, resolveSection } from "@/content/registry";
import { adminFetch } from "@/lib/adminApi";
import { FieldList, findMissingAlt } from "@/components/admin/content/SchemaForm";

const GROUP_URLS = {
    "Global": "/",
    "Home Page": "/",
    "About Page": "/about",
    "Contact Page": "/contact",
    "Career Page": "/career",
    "Services Page": "/services",
    "Portfolio Page": "/portfolio",
    "Blog Page": "/blog",
};

export default function EditContentSection() {
    const { key } = useParams();
    const section = SECTION_MAP[key];

    const [value, setValue] = useState(null);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
        if (!section) return;
        let cancelled = false;
        fetch(`/api/content/${key}`)
            .then((res) => (res.ok ? res.json() : {}))
            .catch(() => ({}))
            .then((saved) => {
                if (!cancelled) setValue(resolveSection(key, { [key]: saved }));
            });
        return () => { cancelled = true; };
    }, [key, section]);

    // Warn before leaving with unsaved changes
    useEffect(() => {
        if (!dirty) return;
        const handler = (e) => { e.preventDefault(); e.returnValue = ""; };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [dirty]);

    if (!section) {
        return (
            <div className="space-y-4">
                <p className="text-slate-500">Unknown content section.</p>
                <Link href="/dashboard/content" className="text-[#1D1D7E] font-bold">Back to Site Content</Link>
            </div>
        );
    }

    const handleSave = async (e) => {
        e.preventDefault();
        const missing = findMissingAlt(section.fields, value);
        if (missing.length) {
            toast.error(`Alt text is required before saving: ${missing.join(", ")}`, { duration: 6000 });
            return;
        }
        setSaving(true);
        try {
            const saved = await adminFetch(`/api/content/${key}`, { method: "PUT", body: value });
            setValue(resolveSection(key, { [key]: saved }));
            setDirty(false);
            toast.success("Saved — changes are live");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (!confirm(`Reset “${section.title}” to the original content? Your edits will be lost.`)) return;
        try {
            await adminFetch(`/api/content/${key}`, { method: "DELETE" });
            setValue(resolveSection(key, {}));
            setDirty(false);
            toast.success("Reset to original content");
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className="max-w-4xl">
            <Toaster position="top-center" />

            <div className="flex items-start gap-4 mb-8">
                <Link href="/dashboard/content" aria-label="Back" className="w-11 h-11 shrink-0 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black shadow-sm">
                    <ArrowLeft size={18} />
                </Link>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{section.group}</p>
                    <h1 className="text-2xl font-black text-[#1D1D7E] uppercase tracking-tight">{section.title}</h1>
                    {section.description && <p className="text-sm text-slate-500 mt-1">{section.description}</p>}
                </div>
                <a
                    href={GROUP_URLS[section.group] || "/"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-[#1D1D7E] mt-3"
                >
                    View page <ExternalLink size={14} />
                </a>
            </div>

            {!value ? (
                <div className="py-24 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#1D1D7E]" /></div>
            ) : (
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
                        <FieldList
                            fields={section.fields}
                            value={value}
                            onChange={(next) => { setValue(next); setDirty(true); }}
                        />
                    </div>

                    <div className="sticky bottom-4 flex items-center gap-3 bg-white/90 backdrop-blur p-3 rounded-2xl border border-gray-100 shadow-lg">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-[#1D1D7E] text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#5DB4D1] transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-5 py-3.5 rounded-xl border border-gray-200 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-red-600 hover:border-red-200 flex items-center gap-2"
                        >
                            <RotateCcw size={14} /> Reset to original
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
