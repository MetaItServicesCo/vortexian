"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, ExternalLink, ImagePlus, Loader2, Pencil, RefreshCw, Search, Trash2, UploadCloud, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { adminFetch } from "@/lib/adminApi";
import { useSelection } from "@/lib/useSelection";
import BulkActions from "@/components/admin/bulk/BulkActions";
import { SelectAllCheckbox, SelectRowCheckbox } from "@/components/admin/bulk/SelectCheckbox";
import { formatReceived } from "@/components/admin/enquiries/EnquiryModal";

const ACCEPT = "image/png,image/jpeg,image/webp,image/gif,image/avif";
const MAX_MB = 10;
const nameFromFile = (f) => f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
const size = (bytes) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

async function copy(text) {
    try {
        await navigator.clipboard.writeText(text);
    } catch {
        const area = Object.assign(document.createElement("textarea"), { value: text });
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        area.remove();
    }
}

function CopyButton({ url }) {
    const [done, setDone] = useState(false);
    return (
        <button type="button" onClick={async () => { await copy(url); setDone(true); toast.success("Link copied"); setTimeout(() => setDone(false), 1500); }}
            className="inline-flex items-center gap-1.5 shrink-0 bg-[#1D1D7E] text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-[#2a2a9e]">
            {done ? <Check size={14} /> : <Copy size={14} />} {done ? "Copied" : "Copy link"}
        </button>
    );
}

function MediaCard({ item, selection, onChange, onDelete }) {
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(item.title);
    const [alt, setAlt] = useState(item.alt || "");
    const [busy, setBusy] = useState(false);
    const [version, setVersion] = useState(0);
    const replaceInput = useRef(null);

    const save = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            onChange(await adminFetch(`/api/media/library/${item.id}`, { method: "PATCH", body: { title, alt } }));
            setEditing(false);
            toast.success("Saved");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setBusy(false);
        }
    };

    const replace = async (file) => {
        if (!file) return;
        if (!confirm(`Replace the picture behind this link?\n\n${item.url}\n\nEvery page and website using this link will show the new picture.`)) return;
        setBusy(true);
        try {
            const form = new FormData();
            form.append("file", file);
            onChange(await adminFetch(`/api/media/library/${item.id}/replace`, { method: "POST", body: form }));
            setVersion((v) => v + 1);
            toast.success("Image replaced; the link stays the same");
        } catch (err) {
            toast.error(err.message, { duration: 6000 });
        } finally {
            setBusy(false);
        }
    };

    return (
        <li className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col ${selection.isSelected(item.id) ? "border-[#1D1D7E] ring-2 ring-[#1D1D7E]/20" : "border-gray-100"}`} data-media={item.file_name}>
            <div className="relative bg-slate-50 aspect-[4/3] flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded image of any size */}
                <img src={`${item.path}${version ? `?v=${version}` : ""}`} alt={item.alt || ""} loading="lazy" className="max-w-full max-h-full object-contain" />
                <span className="absolute top-2 left-2 bg-white/90 rounded-md p-1"><SelectRowCheckbox selection={selection} id={item.id} label={`Select ${item.title}`} /></span>
                {!item.alt && <span className="absolute top-2 right-2 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 rounded px-1.5 py-0.5">No alt text</span>}
            </div>
            <div className="p-4 flex-1 flex flex-col gap-3">
                {editing ? (
                    <form onSubmit={save} className="space-y-2">
                        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} aria-label="Image name" required
                            className="w-full p-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1D1D7E]/40" />
                        <input value={alt} onChange={(e) => setAlt(e.target.value)} maxLength={255} aria-label="Alt text" placeholder="Alt text: what the image shows"
                            className="w-full p-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1D1D7E]/40" />
                        <p className="text-[11px] text-slate-400">Renaming doesn&apos;t change the link.</p>
                        <div className="flex gap-2">
                            <button type="submit" disabled={busy} className="flex-1 bg-[#1D1D7E] text-white text-xs font-bold py-2 rounded-lg disabled:opacity-50">Save</button>
                            <button type="button" onClick={() => { setEditing(false); setTitle(item.title); setAlt(item.alt || ""); }} className="px-3 text-xs font-bold border border-gray-200 rounded-lg">Cancel</button>
                        </div>
                    </form>
                ) : (
                    <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate" title={item.title}>{item.title}</p>
                        <p className="text-xs text-slate-400 truncate">{item.file_name} · {size(item.file_size)} · {formatReceived(item.created_at)}</p>
                        {item.alt && <p className="text-xs text-slate-500 mt-1 line-clamp-2" title={item.alt}>Alt: {item.alt}</p>}
                    </div>
                )}
                <div className="flex items-center gap-2 mt-auto">
                    <input readOnly value={item.url} aria-label={`Link to ${item.title}`} onFocus={(e) => e.target.select()}
                        className="flex-1 min-w-0 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 outline-none" data-media-url="" />
                    <CopyButton url={item.url} />
                </div>
                <div className="flex items-center gap-1 border-t border-slate-100 pt-2 -mb-1">
                    <a href={item.path} target="_blank" rel="noopener noreferrer" aria-label={`Open ${item.title}`} title="Open" className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"><ExternalLink size={15} /></a>
                    <button type="button" onClick={() => setEditing(true)} aria-label={`Edit ${item.title}`} title="Edit name and alt text" className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"><Pencil size={15} /></button>
                    <button type="button" onClick={() => replaceInput.current?.click()} disabled={busy} aria-label={`Replace ${item.title}`} title="Replace image (keeps the link)" className="p-2 rounded-lg text-slate-500 hover:bg-slate-100">
                        {busy ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                    </button>
                    <input ref={replaceInput} type="file" accept={ACCEPT} className="hidden" onChange={(e) => { replace(e.target.files?.[0]); e.target.value = ""; }} />
                    <button type="button" onClick={() => onDelete(item)} aria-label={`Delete ${item.title}`} title="Delete" className="ml-auto p-2 rounded-lg text-red-500 hover:bg-red-50"><Trash2 size={15} /></button>
                </div>
            </div>
        </li>
    );
}

export default function MediaLibrary() {
    const [items, setItems] = useState(null);
    const [query, setQuery] = useState("");
    const [queue, setQueue] = useState([]); // { key, file, preview, title, alt, status, error }
    const [uploading, setUploading] = useState(false);
    const [dragging, setDragging] = useState(false);
    const fileInput = useRef(null);
    const shown = (items || []).filter((i) => !query.trim() || `${i.title} ${i.file_name} ${i.alt || ""}`.toLowerCase().includes(query.trim().toLowerCase()));
    const selection = useSelection(shown);

    useEffect(() => {
        adminFetch("/api/media/library").then(setItems, (err) => { toast.error(`The library could not be loaded: ${err.message}`); setItems([]); });
    }, []);

    // Free preview images when files leave the queue, and when leaving the page
    const previews = useRef(new Set());
    useEffect(() => () => previews.current.forEach((url) => URL.revokeObjectURL(url)), []);
    const dropQueued = (key) => setQueue((prev) => prev.filter((x) => {
        if (x.key === key) { URL.revokeObjectURL(x.preview); previews.current.delete(x.preview); }
        return x.key !== key;
    }));

    const addFiles = (files) => {
        const images = [...files].filter((f) => ACCEPT.split(",").includes(f.type));
        if (images.length < files.length) toast.error("Only JPG, PNG, WEBP, GIF and AVIF images can be added.");
        setQueue((prev) => [...prev, ...images.map((file, i) => ({
            key: `${Date.now()}-${i}-${file.name}`, file, preview: (() => { const u = URL.createObjectURL(file); previews.current.add(u); return u; })(), title: nameFromFile(file), alt: "",
            status: file.size > MAX_MB * 1024 * 1024 ? "error" : "ready", error: file.size > MAX_MB * 1024 * 1024 ? `Larger than ${MAX_MB} MB` : "",
        }))]);
    };

    const updateQueued = (key, patch) => setQueue((prev) => prev.map((q) => (q.key === key ? { ...q, ...patch } : q)));

    const uploadAll = async () => {
        const ready = queue.filter((q) => q.status === "ready");
        if (!ready.length) return;
        if (ready.some((q) => !q.title.trim())) {
            toast.error("Give every image a name: it becomes part of its link.");
            return;
        }
        setUploading(true);
        let added = 0;
        for (const q of ready) {
            updateQueued(q.key, { status: "uploading" });
            try {
                const form = new FormData();
                form.append("file", q.file);
                form.append("title", q.title.trim());
                form.append("alt", q.alt.trim());
                const item = await adminFetch("/api/media/library", { method: "POST", body: form });
                setItems((prev) => [item, ...(prev || [])]);
                dropQueued(q.key);
                added += 1;
            } catch (err) {
                updateQueued(q.key, { status: "error", error: err.message });
            }
        }
        setUploading(false);
        if (added) toast.success(`${added} image${added > 1 ? "s" : ""} added. Copy a link below.`);
    };

    const handleDelete = useCallback(async (item) => {
        let usage = [];
        try {
            usage = (await adminFetch(`/api/media/library/${item.id}/usage`)).usage;
        } catch { /* still allow deleting */ }
        const where = usage.length
            ? `\n\n⚠ This image is used in:\n${usage.map((u) => `• ${u.type}: ${u.title}`).join("\n")}\nThose pages will show a broken image.`
            : "";
        if (!confirm(`Delete “${item.title}”?\n\nIts link stops working (${item.url}), including anywhere it was shared on other websites.${where}\n\nYou can restore it from Recently deleted for 7 days.`)) return;
        try {
            const res = await adminFetch(`/api/media/library/${item.id}`, { method: "DELETE" });
            setItems((prev) => prev.filter((i) => i.id !== item.id));
            toast.success(res.message);
        } catch (err) {
            toast.error(err.message);
        }
    }, []);

    const readyCount = queue.filter((q) => q.status === "ready").length;

    return (
        <div className="max-w-6xl space-y-6">
            <Toaster position="top-center" />
            <div>
                <h1 className="text-3xl font-black text-[#1D1D7E] uppercase tracking-tighter">Media Library</h1>
                <p className="text-slate-500 mt-1">Upload images and copy their permanent link to use anywhere: in the editor&apos;s link box (it opens in a pop-up on the website), on other websites, in emails or on social media.</p>
            </div>

            {/* ---------- upload */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
                    className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${dragging ? "border-[#1D1D7E] bg-[#1D1D7E]/5" : "border-slate-200"}`}
                >
                    <UploadCloud className="mx-auto text-[#1D1D7E]" size={34} />
                    <p className="mt-2 font-semibold text-slate-700">Drag images here, or</p>
                    <button type="button" onClick={() => fileInput.current?.click()} className="mt-2 inline-flex items-center gap-2 bg-[#1D1D7E] text-white px-4 py-2.5 rounded-xl font-semibold text-sm">
                        <ImagePlus size={16} /> Choose images
                    </button>
                    <input ref={fileInput} id="media-files" type="file" accept={ACCEPT} multiple className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
                    <p className="text-xs text-slate-400 mt-2">JPG, PNG, WEBP, GIF or AVIF, up to {MAX_MB} MB each. The name you give becomes the link, e.g. “Augmented Outsourcing” → …/uploads/media/augmented-outsourcing.png</p>
                </div>

                {queue.length > 0 && (
                    <div className="mt-5 space-y-3" data-upload-queue="">
                        {queue.map((q) => (
                            <div key={q.key} className="flex flex-wrap md:flex-nowrap items-center gap-3 border border-slate-100 rounded-xl p-3">
                                {/* eslint-disable-next-line @next/next/no-img-element -- local preview */}
                                <img src={q.preview} alt="" className="w-16 h-16 object-contain bg-slate-50 rounded-lg shrink-0" />
                                <div className="flex-1 min-w-[200px] grid sm:grid-cols-2 gap-2">
                                    <label className="text-xs text-slate-500">Name (becomes the link)
                                        <input value={q.title} onChange={(e) => updateQueued(q.key, { title: e.target.value })} disabled={q.status === "uploading"} maxLength={200}
                                            className="mt-1 w-full p-2 text-sm text-slate-800 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1D1D7E]/40" />
                                    </label>
                                    <label className="text-xs text-slate-500">Alt text (what it shows)
                                        <input value={q.alt} onChange={(e) => updateQueued(q.key, { alt: e.target.value })} disabled={q.status === "uploading"} maxLength={255}
                                            className="mt-1 w-full p-2 text-sm text-slate-800 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1D1D7E]/40" />
                                    </label>
                                </div>
                                <div className="w-28 text-xs text-right shrink-0">
                                    {q.status === "uploading" && <span className="inline-flex items-center gap-1 text-blue-600"><Loader2 size={13} className="animate-spin" /> Uploading</span>}
                                    {q.status === "error" && <span className="text-red-600">{q.error}</span>}
                                    {q.status === "ready" && <span className="text-slate-400">{size(q.file.size)}</span>}
                                </div>
                                <button type="button" onClick={() => dropQueued(q.key)} disabled={q.status === "uploading"} aria-label={`Remove ${q.title}`}
                                    className="p-2 rounded-lg text-slate-400 hover:bg-slate-100"><X size={16} /></button>
                            </div>
                        ))}
                        <div className="flex justify-end">
                            <button type="button" onClick={uploadAll} disabled={uploading || !readyCount}
                                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50">
                                {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />} Upload {readyCount} image{readyCount === 1 ? "" : "s"}
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {/* ---------- library */}
            <div className="flex flex-wrap items-center gap-3">
                <label className="relative flex-1 min-w-[220px]">
                    <span className="sr-only">Search images</span>
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, file or alt text"
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1D1D7E]/40 text-sm" />
                </label>
                {shown.length > 0 && <label className="flex items-center gap-2 text-sm text-slate-600"><SelectAllCheckbox selection={selection} label="Select all images" /> Select all</label>}
            </div>
            <BulkActions resource="media" selection={selection} noun={["image", "images"]}
                deleteWarning="Their links stop working, including on pages and other websites that use them."
                onDeleted={(ids) => setItems((prev) => prev.filter((i) => !ids.includes(i.id)))} />

            {items === null ? (
                <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-[#1D1D7E]" /></div>
            ) : shown.length === 0 ? (
                <p className="py-12 text-center text-slate-500">{items.length ? "No images match your search." : "No images yet. Upload one above."}</p>
            ) : (
                <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" data-media-grid="">
                    {shown.map((item) => (
                        <MediaCard key={item.id} item={item} selection={selection} onDelete={handleDelete}
                            onChange={(saved) => setItems((prev) => prev.map((i) => (i.id === saved.id ? saved : i)))} />
                    ))}
                </ul>
            )}
            <p className="text-xs text-slate-400">Links are permanent: once shared, keep the image here. To change a picture without breaking its link, use Replace (same file type). Deleted images can be restored from Recently deleted for 7 days.</p>
        </div>
    );
}
