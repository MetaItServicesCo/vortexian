"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Loader2, Save } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { adminFetch } from "@/lib/adminApi";

const RichTextEditor = dynamic(() => import("@/components/editor/RichTextEditor"), { ssr: false });

// Outlines only: the business still has to supply the actual legal wording.
const TEMPLATES = {
    "Privacy Policy": `<h2>1. Information We Collect</h2><p>Describe the personal information you collect (e.g. name, email, phone, files uploaded through forms).</p><h2>2. How We Use Information</h2><p></p><h2>3. Sharing of Information</h2><p></p><h2>4. Cookies</h2><p></p><h2>5. Data Retention</h2><p></p><h2>6. Your Rights</h2><p></p><h2>7. Contact Us</h2><p></p>`,
    "Terms & Conditions": `<h2>1. Acceptance of Terms</h2><p></p><h2>2. Services</h2><p></p><h2>3. Payments</h2><p></p><h2>4. Intellectual Property</h2><p></p><h2>5. Limitation of Liability</h2><p></p><h2>6. Governing Law</h2><p></p><h2>7. Changes to These Terms</h2><p></p>`,
    "Cookie Policy": `<h2>What Are Cookies</h2><p></p><h2>Cookies We Use</h2><table><tbody><tr><th><p>Cookie</p></th><th><p>Purpose</p></th><th><p>Duration</p></th></tr><tr><td><p></p></td><td><p></p></td><td><p></p></td></tr></tbody></table><h2>Managing Cookies</h2><p></p>`,
    "Refund Policy": `<h2>Eligibility</h2><p></p><h2>How to Request a Refund</h2><p></p><h2>Processing Time</h2><p></p>`,
};

export function slugify(text) {
    return text
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 150);
}

const inputClass = "w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1D1D7E]/40 text-[15px]";
const labelClass = "block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5";

export default function PageForm({ initial }) {
    const router = useRouter();
    const isNew = !initial?.id;

    const [page, setPage] = useState({
        title: "",
        slug: "",
        content: "",
        meta_title: "",
        meta_description: "",
        is_published: true,
        show_in_footer: true,
        footer_order: 0,
        ...initial,
    });
    // Auto-generate the URL from the title until the admin edits it
    const [slugTouched, setSlugTouched] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    const set = (field, value) => setPage((prev) => ({ ...prev, [field]: value }));

    const applyTemplate = (name) => {
        if (page.content && !confirm("Replace the current content with this template?")) return;
        setPage((prev) => ({
            ...prev,
            title: prev.title || name,
            slug: slugTouched ? prev.slug : slugify(prev.title || name),
            content: TEMPLATES[name],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!page.title.trim() || !page.slug.trim()) {
            toast.error("Title and URL are required");
            return;
        }

        setSaving(true);
        try {
            const body = {
                title: page.title.trim(),
                slug: page.slug.trim(),
                content: page.content || "",
                meta_title: page.meta_title || null,
                meta_description: page.meta_description || null,
                is_published: page.is_published,
                show_in_footer: page.show_in_footer,
                footer_order: Number(page.footer_order) || 0,
            };
            const saved = isNew
                ? await adminFetch("/api/pages/", { method: "POST", body })
                : await adminFetch(`/api/pages/${initial.id}`, { method: "PATCH", body });

            toast.success(isNew ? "Page created" : "Page saved");
            if (isNew) router.replace(`/dashboard/pages/${saved.id}`);
            else setPage((prev) => ({ ...prev, ...saved }));
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-5xl">
            <Toaster position="top-center" />

            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard/pages" aria-label="Back" className="w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black shadow-sm">
                    <ArrowLeft size={18} />
                </Link>
                <h1 className="flex-1 text-2xl font-black text-[#1D1D7E] uppercase tracking-tight">
                    {isNew ? "New Page" : "Edit Page"}
                </h1>
                {!isNew && page.is_published && (
                    <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-[#1D1D7E]">
                        View page <ExternalLink size={14} />
                    </a>
                )}
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* -------- main column -------- */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                        <div>
                            <label className={labelClass}>Title *</label>
                            <input
                                type="text"
                                value={page.title}
                                onChange={(e) => {
                                    set("title", e.target.value);
                                    if (!slugTouched) set("slug", slugify(e.target.value));
                                }}
                                placeholder="e.g. Privacy Policy"
                                className={inputClass}
                                required
                            />
                        </div>
                        <div>
                            <label className={labelClass}>URL *</label>
                            <div className="flex items-center rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-[#1D1D7E]/40 overflow-hidden">
                                <span className="pl-3 pr-1 text-slate-400 text-[15px] select-none">/</span>
                                <input
                                    type="text"
                                    value={page.slug}
                                    onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }}
                                    placeholder="privacy-policy"
                                    className="flex-1 py-3 pr-3 outline-none text-[15px]"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={`${labelClass} mb-0`}>Content</span>
                            {isNew && (
                                <div className="flex flex-wrap gap-1.5 ml-auto">
                                    <span className="text-xs text-slate-400 self-center">Start from outline:</span>
                                    {Object.keys(TEMPLATES).map((name) => (
                                        <button key={name} type="button" onClick={() => applyTemplate(name)} className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-bold text-slate-600 hover:bg-[#1D1D7E] hover:text-white">
                                            {name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <RichTextEditor value={page.content} onChange={(html) => set("content", html)} minHeight={420} />
                    </div>
                </div>

                {/* -------- side column -------- */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <h2 className="text-sm font-black uppercase tracking-widest text-[#1D1D7E]">Visibility</h2>
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input type="checkbox" checked={page.is_published} onChange={(e) => set("is_published", e.target.checked)} className="mt-1 w-4 h-4 accent-[#1D1D7E]" />
                            <span>
                                <span className="block text-sm font-bold text-slate-700">Published</span>
                                <span className="block text-xs text-slate-400">Unpublished pages are hidden from visitors.</span>
                            </span>
                        </label>
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input type="checkbox" checked={page.show_in_footer} onChange={(e) => set("show_in_footer", e.target.checked)} className="mt-1 w-4 h-4 accent-[#1D1D7E]" />
                            <span>
                                <span className="block text-sm font-bold text-slate-700">Show in footer</span>
                                <span className="block text-xs text-slate-400">Listed under the footer’s pages column.</span>
                            </span>
                        </label>
                        <div>
                            <label className={labelClass}>Footer order</label>
                            <input type="number" value={page.footer_order} onChange={(e) => set("footer_order", e.target.value)} className={inputClass} />
                            <p className="text-xs text-slate-400 mt-1">Lower numbers appear first.</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <h2 className="text-sm font-black uppercase tracking-widest text-[#1D1D7E]">SEO</h2>
                        <div>
                            <label className={labelClass}>SEO title</label>
                            <input type="text" value={page.meta_title || ""} onChange={(e) => set("meta_title", e.target.value)} placeholder={page.title} className={inputClass} maxLength={200} />
                        </div>
                        <div>
                            <label className={labelClass}>SEO description</label>
                            <textarea rows={4} value={page.meta_description || ""} onChange={(e) => set("meta_description", e.target.value)} className={`${inputClass} resize-y`} />
                            <p className="text-xs text-slate-400 mt-1">{(page.meta_description || "").length}/160 characters</p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-[#1D1D7E] text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#5DB4D1] transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? "Saving…" : isNew ? "Create page" : "Save page"}
                    </button>
                </div>
            </form>
        </div>
    );
}
