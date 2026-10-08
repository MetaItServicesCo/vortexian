"use client";

// Shared by "Create" and "Edit" news so both screens show the same fields.
import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import ImageAltField, { altError } from "@/components/admin/ImageAltField";
import { adminFetch } from "@/lib/adminApi";
import { mediaUrl } from "@/lib/api";
import { NEWS_TYPES, isVideo } from "@/lib/news";
import { richTextAltError } from "@/lib/richText";

const RichTextEditor = dynamic(() => import("@/components/editor/RichTextEditor"), { ssr: false });

const MAX_MEDIA_MB = 50;
const MEDIA_ACCEPT = "image/png,image/jpeg,image/webp,image/gif,image/avif,video/mp4,video/webm";
const labelClass = "block text-sm font-medium mb-1";
const inputClass = "w-full border rounded-lg px-3 py-2";

// Known types map to their value ("Announcement" -> "announcement"); unknown
// legacy types are kept as-is so saving doesn't silently change them.
function initialType(value) {
    if (!value) return "announcement";
    const known = NEWS_TYPES.find((t) => t.value === value.trim().toLowerCase().replace(/\s+/g, "_"));
    return known ? known.value : value;
}

export default function NewsFeedForm({ initial }) {
    const router = useRouter();
    const isEdit = Boolean(initial?.id);

    const [form, setForm] = useState({
        title: initial?.title || "",
        feed_type: initialType(initial?.feed_type),
        author: initial?.author || "",
        event_date: initial?.event_date || "",
        description: initial?.description || "",
        is_published: initial?.is_published ?? true,
        media_alt: initial?.media_alt || "",
    });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(initial?.media_url ? mediaUrl(initial.media_url) : "");
    const [previewIsVideo, setPreviewIsVideo] = useState(isVideo(initial?.media_url));
    const [removeMedia, setRemoveMedia] = useState(false);
    const [saving, setSaving] = useState(false);

    const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
    const customType = !NEWS_TYPES.some((t) => t.value === form.feed_type);
    // A date picker needs YYYY-MM-DD; older posts may hold free text such as "June 2026"
    const pickerDate = /^\d{4}-\d{2}-\d{2}$/.test(form.event_date) || !form.event_date;

    const chooseFile = (chosen) => {
        if (!chosen) return;
        setFile(chosen);
        setPreview(URL.createObjectURL(chosen));
        setPreviewIsVideo(chosen.type.startsWith("video/"));
        setRemoveMedia(false);
        set("media_alt", "");
    };

    const clearMedia = () => {
        setFile(null);
        setPreview("");
        setRemoveMedia(true);
        set("media_alt", "");
    };

    const validate = () => {
        if (!form.title.trim()) return "Please enter a title.";
        if (!form.author.trim()) return "Please enter the author.";
        if (!form.description.replace(/<[^>]+>/g, "").trim() && !/<img|<video/.test(form.description)) return "Please write the update.";
        if (file && file.size > MAX_MEDIA_MB * 1024 * 1024) return `The file is too large (max ${MAX_MEDIA_MB} MB).`;
        return altError(Boolean(preview) && !previewIsVideo, form.media_alt) || richTextAltError(form.description, "description");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const problem = validate();
        if (problem) {
            toast.error(problem, { duration: 6000 });
            return;
        }

        const data = new FormData();
        data.append("title", form.title.trim());
        data.append("feed_type", form.feed_type);
        data.append("author", form.author.trim());
        data.append("event_date", form.event_date.trim());
        data.append("description", form.description);
        data.append("is_published", form.is_published ? "true" : "false");
        data.append("media_alt", form.media_alt.trim());
        if (file) data.append("file", file);
        if (isEdit && removeMedia && !file) data.append("remove_media", "true");

        setSaving(true);
        try {
            await adminFetch(isEdit ? `/api/newsfeed/${initial.id}` : "/api/newsfeed/", {
                method: isEdit ? "PUT" : "POST",
                body: data,
            });
            toast.success(isEdit ? "Changes saved" : form.is_published ? "Update published" : "Saved as draft");
            setTimeout(() => router.push("/dashboard/newsfeed"), 800);
        } catch (err) {
            toast.error(err.message === "Failed to fetch" ? "Could not reach the server. Please try again." : err.message, { duration: 6000 });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <Toaster position="top-center" />
            <div className="flex items-center justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold">{isEdit ? "Edit News Feed" : "Create News Feed"}</h1>
                {isEdit && initial.is_published !== false && (
                    <a href={`/news?item=${initial.id}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[#1D1D7E] hover:underline">
                        View on site ↗
                    </a>
                )}
            </div>

            <form onSubmit={handleSubmit} noValidate className="bg-white rounded-xl shadow p-6 space-y-5">
                <div>
                    <label htmlFor="news-title" className={labelClass}>Title *</label>
                    <input id="news-title" className={inputClass} value={form.title} maxLength={200} onChange={(e) => set("title", e.target.value)} />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="news-type" className={labelClass}>Type *</label>
                        <select id="news-type" className={inputClass} value={form.feed_type} onChange={(e) => set("feed_type", e.target.value)}>
                            {NEWS_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                            {customType && <option value={form.feed_type}>{form.feed_type} (old type)</option>}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="news-author" className={labelClass}>Author *</label>
                        <input id="news-author" className={inputClass} value={form.author} maxLength={100} onChange={(e) => set("author", e.target.value)} />
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="news-date" className={labelClass}>Event date (optional)</label>
                        <input
                            id="news-date"
                            type={pickerDate ? "date" : "text"}
                            className={inputClass}
                            value={form.event_date}
                            onChange={(e) => set("event_date", e.target.value)}
                        />
                        <p className="text-xs text-gray-400 mt-1">For events: when it takes place.</p>
                    </div>
                    <div>
                        <span className={labelClass}>Visibility</span>
                        <label className="flex items-center gap-3 cursor-pointer select-none mt-2">
                            <input id="news-published" type="checkbox" className="w-4 h-4 accent-[#1D1D7E]" checked={form.is_published} onChange={(e) => set("is_published", e.target.checked)} />
                            <span className="text-sm">{form.is_published ? "Published — visible on the website" : "Draft — hidden from visitors"}</span>
                        </label>
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Description *</label>
                    <RichTextEditor value={form.description} onChange={(value) => set("description", value)} placeholder="Write the update…" allowVideo />
                </div>

                <div className="space-y-3">
                    <label htmlFor="news-media" className={labelClass}>Image or video (optional)</label>
                    {preview && (
                        <div className="flex items-start gap-4">
                            {previewIsVideo ? (
                                <video src={preview} className="w-48 rounded border" controls muted />
                            ) : (
                                // eslint-disable-next-line @next/next/no-img-element -- admin preview
                                <img src={preview} alt={form.media_alt || "Preview"} className="w-32 h-24 object-cover rounded border" />
                            )}
                            <button type="button" onClick={clearMedia} className="text-sm text-red-600 hover:underline">Remove</button>
                        </div>
                    )}
                    <input id="news-media" type="file" accept={MEDIA_ACCEPT} className={inputClass} onChange={(e) => chooseFile(e.target.files?.[0] || null)} />
                    <p className="text-xs text-gray-400">JPG, PNG, WEBP or MP4/WEBM video, up to {MAX_MEDIA_MB} MB. Shown at the top of the update.</p>
                    {preview && !previewIsVideo && (
                        <ImageAltField id="news-image-alt" value={form.media_alt} onChange={(value) => set("media_alt", value)} />
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Link href="/dashboard/newsfeed" className="px-5 py-2 border rounded-lg hover:bg-gray-50">Cancel</Link>
                    <button type="submit" disabled={saving} className="px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-60">
                        {saving ? "Saving..." : isEdit ? "Save Changes" : form.is_published ? "Publish" : "Save Draft"}
                    </button>
                </div>
            </form>
        </div>
    );
}
