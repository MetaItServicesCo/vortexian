"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Eye, EyeOff, ExternalLink, ImagePlus, Images, Loader2, Pencil, Plus, Search, Star, Trash2, UploadCloud, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { adminFetch } from "@/lib/adminApi";
import { useSelection } from "@/lib/useSelection";
import BulkActions from "@/components/admin/bulk/BulkActions";
import { SelectAllCheckbox, SelectRowCheckbox } from "@/components/admin/bulk/SelectCheckbox";
import AlbumCards from "@/components/gallery/AlbumCards";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import { formatEventDate } from "@/components/gallery/format";

// Dashboard → Gallery: photos (upload, edit, order, publish), event albums and a preview.
// Public pages: /gallery and /gallery/<album> (backend/app/routes/gallery.py).

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/avif";
const MAX_MB = 20;
const input = "w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1D1D7E]/40 text-sm text-slate-800";
const lbl = "text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1";
const nameFromFile = (f) => f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
const TABS = [["photos", "Photos"], ["albums", "Albums"], ["preview", "Preview"]];

function Field({ text, children, className = "" }) {
    return <label className={`block ${className}`}><span className={lbl}>{text}</span>{children}</label>;
}

function Select({ value, onChange, options, label, empty }) {
    return (
        <select className={input} value={value ?? ""} onChange={(e) => onChange(e.target.value)} aria-label={label}>
            {empty && <option value="">{empty}</option>}
            {options.map((o) => <option key={o.id} value={o.id}>{o.name || o.title}</option>)}
        </select>
    );
}

// ---------------------------------------------------------------- upload

function Uploader({ data, onUploaded, presetAlbum }) {
    const [queue, setQueue] = useState([]);
    const freshBatch = () => ({ category_id: "", album_id: presetAlbum || "", event_name: "", event_date: "", is_published: false });
    const [batch, setBatch] = useState(freshBatch);
    const [busy, setBusy] = useState(false);
    const [dragging, setDragging] = useState(false);
    const fileInput = useRef(null);
    const previews = useRef(new Set());

    useEffect(() => () => previews.current.forEach((u) => URL.revokeObjectURL(u)), []);

    const add = (files) => {
        const list = [...files];
        const ok = list.filter((f) => ACCEPT.split(",").includes(f.type));
        if (ok.length < list.length) toast.error("Only photos can be added: JPG, PNG, WEBP, GIF or AVIF.");
        setQueue((prev) => [...prev, ...ok.map((file, i) => {
            const preview = URL.createObjectURL(file);
            previews.current.add(preview);
            const big = file.size > MAX_MB * 1024 * 1024;
            return { key: `${Date.now()}-${i}-${file.name}`, file, preview, title: nameFromFile(file), alt: "", caption: "", status: big ? "error" : "ready", error: big ? `Larger than ${MAX_MB} MB` : "" };
        })]);
    };
    const update = (key, patch) => setQueue((prev) => prev.map((q) => (q.key === key ? { ...q, ...patch } : q)));
    const drop = (key) => setQueue((prev) => prev.filter((q) => {
        if (q.key === key) { URL.revokeObjectURL(q.preview); previews.current.delete(q.preview); }
        return q.key !== key;
    }));

    const upload = async () => {
        const ready = queue.filter((q) => q.status === "ready");
        if (ready.some((q) => !q.title.trim() || !q.alt.trim())) {
            toast.error("Every photo needs a title and alt text (alt text describes the photo for Google and screen readers).");
            return;
        }
        setBusy(true);
        let done = 0;
        for (const q of ready) {
            update(q.key, { status: "uploading" });
            try {
                const form = new FormData();
                form.append("file", q.file);
                form.append("title", q.title.trim());
                form.append("alt", q.alt.trim());
                form.append("caption", q.caption.trim());
                Object.entries(batch).forEach(([k, v]) => form.append(k, String(v ?? "")));
                onUploaded(await adminFetch("/api/gallery/admin/images", { method: "POST", body: form }));
                drop(q.key);
                done += 1;
            } catch (err) {
                update(q.key, { status: "error", error: err.message });
            }
        }
        setBusy(false);
        if (done) toast.success(`${done} photo${done > 1 ? "s" : ""} added${batch.is_published ? " and published" : " as drafts"}.`);
        if (done === ready.length) setBatch(freshBatch());   // next batch starts fresh (drafts, no album) so nothing is published by accident
    };
    const ready = queue.filter((q) => q.status === "ready").length;

    return (
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 space-y-4" aria-label="Upload photos">
            <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); add(e.dataTransfer.files); }}
                className={`rounded-2xl border-2 border-dashed p-7 text-center transition ${dragging ? "border-[#1D1D7E] bg-[#1D1D7E]/5" : "border-slate-200"}`}>
                <UploadCloud className="mx-auto text-[#1D1D7E]" size={32} />
                <p className="mt-2 font-semibold text-slate-700">Drag photos here, or</p>
                <button type="button" onClick={() => fileInput.current?.click()} className="mt-2 inline-flex items-center gap-2 bg-[#1D1D7E] text-white px-4 py-2.5 rounded-xl font-semibold text-sm">
                    <ImagePlus size={16} /> Choose photos
                </button>
                <input ref={fileInput} id="gallery-files" type="file" accept={ACCEPT} multiple className="hidden" onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
                <p className="text-xs text-slate-400 mt-2">Select many at once. JPG, PNG, WEBP, GIF or AVIF, up to {MAX_MB} MB each. Photos are optimised automatically (smaller WebP files in several sizes, upright, location data removed).</p>
            </div>

            {queue.length > 0 && (
                <>
                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 grid sm:grid-cols-2 lg:grid-cols-5 gap-3" data-upload-batch="">
                        <Field text="Category (all photos)"><Select value={batch.category_id} onChange={(v) => setBatch({ ...batch, category_id: v })} options={data.categories} label="Category for these photos" empty="Others" /></Field>
                        <Field text="Album (optional)"><Select value={batch.album_id} onChange={(v) => setBatch({ ...batch, album_id: v })} options={data.albums} label="Album for these photos" empty="No album" /></Field>
                        <Field text="Event name (optional)"><input className={input} value={batch.event_name} maxLength={150} onChange={(e) => setBatch({ ...batch, event_name: e.target.value })} aria-label="Event name for these photos" /></Field>
                        <Field text="Event date (optional)"><input type="date" className={input} value={batch.event_date} onChange={(e) => setBatch({ ...batch, event_date: e.target.value })} aria-label="Event date for these photos" /></Field>
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 self-end pb-2.5 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 accent-[#1D1D7E]" checked={batch.is_published} onChange={(e) => setBatch({ ...batch, is_published: e.target.checked })} aria-label="Publish now" />
                            Publish now <span className="font-normal text-slate-400">(otherwise drafts)</span>
                        </label>
                    </div>
                    <ul className="space-y-3" data-upload-queue="">
                        {queue.map((q) => (
                            <li key={q.key} className="flex flex-wrap md:flex-nowrap items-start gap-3 border border-slate-100 rounded-xl p-3">
                                {/* eslint-disable-next-line @next/next/no-img-element -- local preview */}
                                <img src={q.preview} alt="" className="w-20 h-20 object-contain bg-slate-50 rounded-lg shrink-0" />
                                <div className="flex-1 min-w-[220px] grid md:grid-cols-3 gap-2">
                                    <input className={input} value={q.title} maxLength={150} placeholder="Title *" disabled={q.status === "uploading"} onChange={(e) => update(q.key, { title: e.target.value })} aria-label="Photo title" />
                                    <input className={input} value={q.alt} maxLength={255} placeholder="Alt text * (what the photo shows)" disabled={q.status === "uploading"} onChange={(e) => update(q.key, { alt: e.target.value })} aria-label="Photo alt text" />
                                    <input className={input} value={q.caption} maxLength={500} placeholder="Caption (optional)" disabled={q.status === "uploading"} onChange={(e) => update(q.key, { caption: e.target.value })} aria-label="Photo caption" />
                                </div>
                                <div className="w-28 text-xs text-right shrink-0 pt-2">
                                    {q.status === "uploading" && <span className="inline-flex items-center gap-1 text-blue-600"><Loader2 size={13} className="animate-spin" /> Uploading</span>}
                                    {q.status === "error" && <span className="text-red-600">{q.error}</span>}
                                    {q.status === "ready" && <span className="text-slate-400">{(q.file.size / 1024 / 1024).toFixed(1)} MB</span>}
                                </div>
                                <button type="button" onClick={() => drop(q.key)} disabled={q.status === "uploading"} aria-label={`Remove ${q.title || "photo"}`} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100"><X size={16} /></button>
                            </li>
                        ))}
                    </ul>
                    <div className="flex justify-end">
                        <button type="button" onClick={upload} disabled={busy || !ready} className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50">
                            {busy ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />} Upload {ready} photo{ready === 1 ? "" : "s"}
                        </button>
                    </div>
                </>
            )}
        </section>
    );
}

// ---------------------------------------------------------------- photo editor

function EditPhoto({ image, data, onSaved, onClose }) {
    const [form, setForm] = useState({
        title: image.title, alt: image.alt, caption: image.caption || "", event_name: image.event_name || "", event_date: image.event_date || "",
        category_id: image.category_id || "", album_id: image.album_id || "", is_published: image.is_published,
    });
    const [busy, setBusy] = useState(false);
    const set = (patch) => setForm((f) => ({ ...f, ...patch }));
    const save = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.alt.trim()) { toast.error("Title and alt text are required."); return; }
        setBusy(true);
        try {
            onSaved(await adminFetch(`/api/gallery/admin/images/${image.id}`, {
                method: "PATCH",
                body: { ...form, category_id: form.category_id ? Number(form.category_id) : null, album_id: form.album_id ? Number(form.album_id) : null },
            }));
            toast.success("Photo saved");
            onClose();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setBusy(false);
        }
    };
    return (
        <div role="dialog" aria-modal="true" aria-label={`Edit ${image.title}`} className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <form onSubmit={save} className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto p-6 grid md:grid-cols-[240px,1fr] gap-5" data-edit-photo="">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
                <img src={image.src} alt={image.alt} className="w-full h-auto rounded-xl bg-slate-50 object-contain max-h-80" />
                <div className="space-y-3">
                    <Field text="Title *"><input className={input} value={form.title} maxLength={150} onChange={(e) => set({ title: e.target.value })} aria-label="Title" /></Field>
                    <Field text="Alt text *"><input className={input} value={form.alt} maxLength={255} onChange={(e) => set({ alt: e.target.value })} aria-label="Alt text" /></Field>
                    <Field text="Caption"><textarea className={`${input} resize-y`} rows={2} value={form.caption} maxLength={500} onChange={(e) => set({ caption: e.target.value })} aria-label="Caption" /></Field>
                    <div className="grid sm:grid-cols-2 gap-3">
                        <Field text="Event name"><input className={input} value={form.event_name} maxLength={150} onChange={(e) => set({ event_name: e.target.value })} aria-label="Event name" /></Field>
                        <Field text="Event date"><input type="date" className={input} value={form.event_date} onChange={(e) => set({ event_date: e.target.value })} aria-label="Event date" /></Field>
                        <Field text="Category"><Select value={form.category_id} onChange={(v) => set({ category_id: v })} options={data.categories} label="Category" /></Field>
                        <Field text="Album"><Select value={form.album_id} onChange={(v) => set({ album_id: v })} options={data.albums} label="Album" empty="No album" /></Field>
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 accent-[#1D1D7E]" checked={form.is_published} onChange={(e) => set({ is_published: e.target.checked })} aria-label="Published" /> Published (visible on the website)
                    </label>
                    <div className="flex gap-2 pt-2">
                        <button type="submit" disabled={busy} className="flex-1 bg-[#1D1D7E] text-white py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50">{busy ? "Saving…" : "Save"}</button>
                        <button type="button" onClick={onClose} className="px-4 border border-gray-200 rounded-xl text-sm font-semibold">Cancel</button>
                    </div>
                </div>
            </form>
        </div>
    );
}

// ---------------------------------------------------------------- albums

function AlbumForm({ album, onSaved, onCancel }) {
    const [form, setForm] = useState({ title: album?.title || "", slug: album?.slug || "", description: album?.description || "", event_date: album?.event_date || "", is_published: album?.is_published ?? false });
    const [busy, setBusy] = useState(false);
    const set = (patch) => setForm((f) => ({ ...f, ...patch }));
    const save = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) { toast.error("Please give the album a title."); return; }
        setBusy(true);
        try {
            const saved = await adminFetch(album ? `/api/gallery/admin/albums/${album.id}` : "/api/gallery/admin/albums", { method: album ? "PATCH" : "POST", body: form });
            onSaved(saved);
            toast.success(album ? "Album saved" : "Album created. Now add photos to it.");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setBusy(false);
        }
    };
    return (
        <form onSubmit={save} className="grid md:grid-cols-2 gap-3 bg-slate-50 border border-slate-100 rounded-xl p-4" data-album-form="">
            <Field text="Album title *"><input className={input} value={form.title} maxLength={150} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. Annual Company Event 2026" aria-label="Album title" /></Field>
            <Field text="Event date"><input type="date" className={input} value={form.event_date} onChange={(e) => set({ event_date: e.target.value })} aria-label="Album event date" /></Field>
            <Field text="Short description" className="md:col-span-2"><textarea className={`${input} resize-y`} rows={2} maxLength={1000} value={form.description} onChange={(e) => set({ description: e.target.value })} aria-label="Album description" /></Field>
            {album && <Field text="Page address"><div className="flex items-center rounded-lg border border-gray-200 bg-white"><span className="pl-2.5 text-sm text-slate-400">/gallery/</span><input className="flex-1 min-w-0 p-2.5 pl-1 text-sm outline-none bg-transparent" value={form.slug} maxLength={180} onChange={(e) => set({ slug: e.target.value })} aria-label="Album address" /></div></Field>}
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer self-end pb-2">
                <input type="checkbox" className="w-4 h-4 accent-[#1D1D7E]" checked={form.is_published} onChange={(e) => set({ is_published: e.target.checked })} aria-label="Album published" /> Published
            </label>
            <div className="md:col-span-2 flex gap-2">
                <button type="submit" disabled={busy} className="bg-[#1D1D7E] text-white px-5 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50">{album ? "Save album" : "Create album"}</button>
                {onCancel && <button type="button" onClick={onCancel} className="px-4 border border-gray-200 rounded-xl text-sm font-semibold">Cancel</button>}
            </div>
        </form>
    );
}

// ---------------------------------------------------------------- page

export default function GalleryAdmin() {
    const [data, setData] = useState(null);
    const [tab, setTab] = useState("photos");
    const [filters, setFilters] = useState({ q: "", category: "", album: "", status: "" });
    const [editing, setEditing] = useState(null);
    const [editingAlbum, setEditingAlbum] = useState(null);
    const [newAlbum, setNewAlbum] = useState(false);
    const [coverFor, setCoverFor] = useState(null);
    const [presetAlbum, setPresetAlbum] = useState("");

    const load = useCallback(() => adminFetch("/api/gallery/admin").then(setData, (err) => toast.error(`The gallery could not be loaded: ${err.message}`)), []);
    useEffect(() => { load(); }, [load]);

    const images = useMemo(() => data?.images || [], [data]);
    const shown = useMemo(() => images.filter((i) =>
        (!filters.q || `${i.title} ${i.caption || ""} ${i.event_name || ""}`.toLowerCase().includes(filters.q.toLowerCase())) &&
        (!filters.category || String(i.category_id) === filters.category) &&
        (!filters.album || (filters.album === "none" ? !i.album_id : String(i.album_id) === filters.album)) &&
        (!filters.status || (filters.status === "published") === i.is_published)), [images, filters]);
    const selection = useSelection(shown);

    if (!data) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-[#1D1D7E]" /></div>;

    const replaceImage = (img) => setData((d) => ({ ...d, images: d.images.map((i) => (i.id === img.id ? img : i)) }));
    const albumCounts = (albumId) => images.filter((i) => i.album_id === albumId).length;
    const refreshAlbums = () => load();

    const togglePublish = async (img) => {
        try {
            replaceImage(await adminFetch(`/api/gallery/admin/images/${img.id}`, { method: "PATCH", body: { is_published: !img.is_published } }));
            toast.success(img.is_published ? "Unpublished (hidden from the website)" : "Published");
            refreshAlbums();
        } catch (err) { toast.error(err.message); }
    };

    // Move a photo before/after its neighbour in the current view; saves the whole order
    const move = async (img, dir) => {
        const pos = shown.findIndex((i) => i.id === img.id);
        const neighbour = shown[pos + dir];
        if (!neighbour) return;
        const order = images.map((i) => i.id).filter((id) => id !== img.id);
        const at = order.indexOf(neighbour.id) + (dir > 0 ? 1 : 0);
        order.splice(at, 0, img.id);
        setData((d) => ({ ...d, images: order.map((id) => d.images.find((i) => i.id === id)) }));
        try { await adminFetch("/api/gallery/admin/images/reorder", { method: "POST", body: { ids: order } }); }
        catch (err) { toast.error(err.message); load(); }
    };

    const removeImage = async (img) => {
        if (!confirm(`Delete “${img.title}”?\n\nYou can restore it from Recently deleted for 7 days.`)) return;
        try {
            const res = await adminFetch(`/api/gallery/admin/images/${img.id}`, { method: "DELETE" });
            setData((d) => ({ ...d, images: d.images.filter((i) => i.id !== img.id) }));
            toast.success(res.message);
            refreshAlbums();
        } catch (err) { toast.error(err.message); }
    };

    const setCover = async (album, imageId) => {
        try {
            await adminFetch(`/api/gallery/admin/albums/${album.id}`, { method: "PATCH", body: { cover_image_id: imageId } });
            toast.success("Cover updated");
            setCoverFor(null);
            load();
        } catch (err) { toast.error(err.message); }
    };

    const albumAction = async (album, body, message) => {
        try { await adminFetch(`/api/gallery/admin/albums/${album.id}`, { method: "PATCH", body }); toast.success(message); load(); }
        catch (err) { toast.error(err.message); }
    };
    const moveAlbum = async (i, dir) => {
        const order = data.albums.map((a) => a.id);
        [order[i], order[i + dir]] = [order[i + dir], order[i]];
        setData((d) => ({ ...d, albums: order.map((id) => d.albums.find((a) => a.id === id)) }));
        try { await adminFetch("/api/gallery/admin/albums/reorder", { method: "POST", body: { ids: order } }); } catch (err) { toast.error(err.message); load(); }
    };
    const removeAlbum = async (album) => {
        if (!confirm(`Delete the album “${album.title}”?\n\nIts ${albumCounts(album.id)} photos stay in the gallery. You can restore the album from Recently deleted for 7 days.`)) return;
        try { const res = await adminFetch(`/api/gallery/admin/albums/${album.id}`, { method: "DELETE" }); toast.success(res.message); load(); }
        catch (err) { toast.error(err.message); }
    };

    const published = images.filter((i) => i.is_published).length;

    return (
        <div className="max-w-6xl space-y-6">
            <Toaster position="top-center" />
            <div className="flex flex-wrap items-start gap-4">
                <div className="flex-1 min-w-[240px]">
                    <h1 className="text-3xl font-black text-[#1D1D7E] uppercase tracking-tighter">Gallery</h1>
                    <p className="text-slate-500 mt-1">Photos of company events, team activities, meetings, training and achievements. {images.length} photos ({published} published), {data.albums.length} albums.</p>
                </div>
                <a href="/gallery" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1D1D7E] mt-2">View the Gallery page <ExternalLink size={14} /></a>
                <Link href="/dashboard/categories?kind=gallery" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1D1D7E] mt-2">Gallery categories</Link>
            </div>

            <nav aria-label="Gallery sections" className="flex gap-1 border-b border-gray-200">
                {TABS.map(([key, name]) => (
                    <button key={key} type="button" onClick={() => setTab(key)} aria-current={tab === key ? "page" : undefined}
                        className={`px-4 py-2.5 -mb-px text-sm font-semibold border-b-2 ${tab === key ? "border-[#1D1D7E] text-[#1D1D7E]" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
                        {name}
                    </button>
                ))}
            </nav>

            {tab === "photos" && (
                <>
                    <Uploader key={presetAlbum} data={data} presetAlbum={presetAlbum} onUploaded={(img) => { setData((d) => ({ ...d, images: [img, ...d.images] })); }} />

                    <div className="flex flex-wrap items-end gap-3" data-gallery-filters-admin="">
                        <label className="relative flex-1 min-w-[200px]"><span className="sr-only">Search photos</span>
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} placeholder="Search title, caption or event" className={`${input} pl-9`} />
                        </label>
                        <div className="w-44"><Select value={filters.category} onChange={(v) => setFilters({ ...filters, category: v })} options={data.categories} label="Filter by category" empty="All categories" /></div>
                        <div className="w-44">
                            <select className={input} value={filters.album} onChange={(e) => setFilters({ ...filters, album: e.target.value })} aria-label="Filter by album">
                                <option value="">All albums</option><option value="none">No album</option>
                                {data.albums.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
                            </select>
                        </div>
                        <div className="w-36">
                            <select className={input} value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} aria-label="Filter by status">
                                <option value="">All</option><option value="published">Published</option><option value="draft">Drafts</option>
                            </select>
                        </div>
                        {shown.length > 0 && <label className="flex items-center gap-2 text-sm text-slate-600 pb-2.5"><SelectAllCheckbox selection={selection} label="Select all photos" /> Select all</label>}
                    </div>

                    <BulkActions resource="gallery-images" selection={selection} noun={["photo", "photos"]}
                        onDeleted={(ids) => { setData((d) => ({ ...d, images: d.images.filter((i) => !ids.includes(i.id)) })); refreshAlbums(); }}
                        onPublished={(ids, value) => { setData((d) => ({ ...d, images: d.images.map((i) => (ids.includes(i.id) ? { ...i, is_published: value } : i)) })); refreshAlbums(); }} />

                    {shown.length === 0 ? (
                        <p className="py-12 text-center text-slate-500">{images.length ? "No photos match these filters." : "No photos yet. Upload some above."}</p>
                    ) : (
                        <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" data-admin-photos="">
                            {shown.map((img, i) => {
                                const album = data.albums.find((a) => a.id === img.album_id);
                                return (
                                    <li key={img.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col ${selection.isSelected(img.id) ? "border-[#1D1D7E] ring-2 ring-[#1D1D7E]/20" : "border-gray-100"}`} data-photo={img.title}>
                                        <div className="relative bg-slate-50 aspect-[4/3] flex items-center justify-center">
                                            {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail */}
                                            <img src={img.thumb} alt={img.alt} loading="lazy" className="max-w-full max-h-full object-contain" />
                                            <span className="absolute top-2 left-2 bg-white/90 rounded-md p-1"><SelectRowCheckbox selection={selection} id={img.id} label={`Select ${img.title}`} /></span>
                                            <span className={`absolute top-2 right-2 rounded-full text-[10px] font-black uppercase tracking-wider px-2 py-1 ${img.is_published ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{img.is_published ? "Published" : "Draft"}</span>
                                            {album?.cover_image_id === img.id && <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-[#1D1D7E] text-white text-[10px] font-bold px-2 py-1"><Star size={10} /> Album cover</span>}
                                        </div>
                                        <div className="p-3 flex-1 flex flex-col">
                                            <p className="font-bold text-sm text-slate-800 truncate" title={img.title}>{img.title}</p>
                                            <p className="text-[11px] text-slate-400 truncate">{img.category}{album ? ` · ${album.title}` : ""}{img.event_date ? ` · ${formatEventDate(img.event_date)}` : ""}</p>
                                            <div className="mt-auto pt-2 flex items-center gap-0.5">
                                                <button type="button" onClick={() => move(img, -1)} disabled={i === 0} aria-label={`Move ${img.title} earlier`} title="Show earlier" className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowLeft size={14} /></button>
                                                <button type="button" onClick={() => move(img, 1)} disabled={i === shown.length - 1} aria-label={`Move ${img.title} later`} title="Show later" className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowRight size={14} /></button>
                                                <button type="button" onClick={() => togglePublish(img)} aria-label={`${img.is_published ? "Unpublish" : "Publish"} ${img.title}`} title={img.is_published ? "Unpublish" : "Publish"} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100">{img.is_published ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                                                {album && album.cover_image_id !== img.id && <button type="button" onClick={() => setCover(album, img.id)} aria-label={`Use ${img.title} as the album cover`} title="Use as album cover" className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100"><Star size={14} /></button>}
                                                <button type="button" onClick={() => setEditing(img)} aria-label={`Edit ${img.title}`} title="Edit" className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100"><Pencil size={14} /></button>
                                                <button type="button" onClick={() => removeImage(img)} aria-label={`Delete ${img.title}`} title="Delete" className="ml-auto p-1.5 rounded-md text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </>
            )}

            {tab === "albums" && (
                <section className="space-y-4">
                    {newAlbum ? <AlbumForm onSaved={() => { setNewAlbum(false); load(); }} onCancel={() => setNewAlbum(false)} /> : (
                        <button type="button" onClick={() => setNewAlbum(true)} className="inline-flex items-center gap-2 bg-[#1D1D7E] text-white px-4 py-2.5 rounded-xl font-semibold text-sm" data-new-album=""><Plus size={16} /> New album</button>
                    )}
                    {data.albums.length === 0 && <p className="text-slate-500">No albums yet. Create one per event, e.g. “Annual Company Event 2026”, then add photos to it.</p>}
                    <ul className="space-y-3">
                        {data.albums.map((album, i) => (
                            <li key={album.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3" data-admin-album={album.slug}>
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="w-24 h-20 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element -- cover thumbnail */}
                                        {album.cover ? <img src={album.cover.src} alt={album.cover.alt} className="max-w-full max-h-full object-contain" /> : <Images className="text-slate-300" />}
                                    </div>
                                    <div className="flex-1 min-w-[200px]">
                                        <p className="font-bold text-slate-800">{album.title} <span className={`ml-1 rounded-full text-[10px] font-black uppercase tracking-wider px-2 py-0.5 ${album.is_published ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{album.is_published ? "Published" : "Draft"}</span></p>
                                        <p className="text-xs text-slate-500">/gallery/{album.slug} · {albumCounts(album.id)} photos{album.event_date ? ` · ${formatEventDate(album.event_date)}` : ""}</p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1">
                                        <button type="button" onClick={() => moveAlbum(i, -1)} disabled={i === 0} aria-label={`Move ${album.title} up`} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowUp size={15} /></button>
                                        <button type="button" onClick={() => moveAlbum(i, 1)} disabled={i === data.albums.length - 1} aria-label={`Move ${album.title} down`} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowDown size={15} /></button>
                                        <button type="button" onClick={() => albumAction(album, { is_published: !album.is_published }, album.is_published ? "Album unpublished" : "Album published")} className="px-2.5 py-1.5 rounded-md text-xs font-bold text-[#1D1D7E] hover:bg-slate-100">{album.is_published ? "Unpublish" : "Publish"}</button>
                                        <button type="button" onClick={() => setCoverFor(coverFor === album.id ? null : album.id)} className="px-2.5 py-1.5 rounded-md text-xs font-bold text-[#1D1D7E] hover:bg-slate-100">Choose cover</button>
                                        <button type="button" onClick={() => { setPresetAlbum(String(album.id)); setTab("photos"); }} className="px-2.5 py-1.5 rounded-md text-xs font-bold text-[#1D1D7E] hover:bg-slate-100">Add photos</button>
                                        <button type="button" onClick={() => setEditingAlbum(editingAlbum === album.id ? null : album.id)} aria-label={`Edit ${album.title}`} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100"><Pencil size={15} /></button>
                                        <button type="button" onClick={() => removeAlbum(album)} aria-label={`Delete ${album.title}`} className="p-1.5 rounded-md text-red-500 hover:bg-red-50"><Trash2 size={15} /></button>
                                    </div>
                                </div>
                                {editingAlbum === album.id && <AlbumForm album={album} onSaved={() => { setEditingAlbum(null); load(); }} onCancel={() => setEditingAlbum(null)} />}
                                {coverFor === album.id && (
                                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2" role="group" aria-label={`Choose a cover for ${album.title}`}>
                                        {images.filter((im) => im.album_id === album.id).map((im) => (
                                            <button key={im.id} type="button" onClick={() => setCover(album, im.id)} aria-label={`Cover: ${im.title}`}
                                                className={`rounded-lg overflow-hidden bg-slate-50 aspect-square flex items-center justify-center border-2 ${album.cover_image_id === im.id ? "border-[#1D1D7E]" : "border-transparent hover:border-slate-300"}`}>
                                                {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail */}
                                                <img src={im.thumb} alt={im.alt} className="max-w-full max-h-full object-contain" />
                                            </button>
                                        ))}
                                        {albumCounts(album.id) === 0 && <p className="col-span-full text-sm text-slate-500">Add photos to this album first.</p>}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {tab === "preview" && (
                <section className="rounded-2xl border border-gray-200 bg-[#F6F9FC] p-5 md:p-8 space-y-10" data-gallery-preview="">
                    <p className="text-sm text-slate-500">How the Gallery page looks, <b>drafts included</b> (marked “Draft”). Visitors only see published photos and albums.</p>
                    {data.albums.length > 0 && <div><h2 className="text-xl font-bold text-[#0b0b2e] mb-4">Events & albums</h2><AlbumCards albums={data.albums} linkable={false} /></div>}
                    <GalleryGrid images={images} categories={data.categories} preview />
                </section>
            )}

            {editing && <EditPhoto image={editing} data={data} onSaved={(img) => { replaceImage(img); refreshAlbums(); }} onClose={() => setEditing(null)} />}
        </div>
    );
}
