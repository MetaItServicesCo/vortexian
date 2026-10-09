"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Clock, Loader2, Paperclip, RotateCcw, Trash2 } from "lucide-react";
import { adminFetch } from "@/lib/adminApi";
import { useSelection } from "@/lib/useSelection";
import SelectionBar, { barButton, plural } from "@/components/admin/bulk/SelectionBar";
import { SelectAllCheckbox, SelectRowCheckbox } from "@/components/admin/bulk/SelectCheckbox";

// Where each kind of item lives once restored
const SECTIONS = {
    blog: { label: "Blog posts", href: "/dashboard/blog" },
    services: { label: "Services", href: "/dashboard/services" },
    team: { label: "Team members", href: "/dashboard/team" },
    portfolio: { label: "Portfolio", href: "/dashboard/portfolio" },
    testimonials: { label: "Testimonials", href: "/dashboard/testimonials" },
    newsfeed: { label: "News updates", href: "/dashboard/newsfeed" },
    pages: { label: "Pages", href: "/dashboard/pages" },
    career: { label: "Applications", href: "/dashboard/career" },
    contacts: { label: "Quote requests", href: "/dashboard/contacts" },
    quotes: { label: "Home page enquiries", href: "/dashboard/quotes" },
    newsletter: { label: "Subscribers", href: "/dashboard/newsletter" },
};

const DAY = 24 * 60 * 60 * 1000;
const formatWhen = (iso) =>
    new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

function timeLeft(expiresAt, now) {
    const ms = new Date(expiresAt).getTime() - now;
    if (ms < DAY) {
        const hours = Math.max(1, Math.ceil(ms / (60 * 60 * 1000)));
        return { text: `${hours} ${hours === 1 ? "hour" : "hours"} left`, urgent: true };
    }
    const days = Math.ceil(ms / DAY);
    return { text: `${days} days left`, urgent: days <= 1 };
}

const ITEM = ["item", "items"];

export default function RecentlyDeletedPage() {
    const [items, setItems] = useState([]);
    const [retention, setRetention] = useState(7);
    const [now, setNow] = useState(0);
    const [status, setStatus] = useState("loading");
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all");
    const [busy, setBusy] = useState(null);
    const [notice, setNotice] = useState(null);
    const dismiss = useCallback(() => setNotice(null), []);

    const load = () =>
        adminFetch("/api/trash/").then(
            (data) => {
                setItems(data.items || []);
                setRetention(data.retention_days || 7);
                setNow(Date.now());
                setStatus("ready");
            },
            (err) => {
                setError(err.message);
                setStatus("error");
            }
        );

    useEffect(() => {
        load();
    }, []);

    const counts = useMemo(() => {
        const out = {};
        items.forEach((i) => (out[i.resource] = (out[i.resource] || 0) + 1));
        return out;
    }, [items]);
    // A filter whose items were all restored falls back to "all"
    const activeFilter = filter !== "all" && counts[filter] ? filter : "all";
    const visible = useMemo(() => (activeFilter === "all" ? items : items.filter((i) => i.resource === activeFilter)), [items, activeFilter]);
    const selection = useSelection(visible);

    const remove = (ids) => setItems((prev) => prev.filter((i) => !ids.includes(i.id)));

    const restoreItems = async (ids) => {
        setBusy("restore");
        setNotice(null);
        try {
            const res = await adminFetch("/api/trash/restore", { method: "POST", body: { ids } });
            remove(res.restored.map((r) => r.id));
            selection.clear();
            const kinds = [...new Set(res.restored.map((r) => r.resource))];
            const link = kinds.length === 1 && SECTIONS[kinds[0]] ? { href: SECTIONS[kinds[0]].href, label: `Open ${SECTIONS[kinds[0]].label}` } : null;
            if (res.failed.length === 0) {
                setNotice({ ok: true, text: `Restored ${plural(res.restored.length, ITEM)}, exactly as they were.`, link });
            } else {
                const reasons = res.failed.map((f) => `“${f.title || "Item"}”: ${f.reason}`).join(" ");
                const done = res.restored.length ? `Restored ${plural(res.restored.length, ITEM)}. ` : "";
                setNotice({ ok: false, text: `${done}Could not restore ${plural(res.failed.length, ITEM)}. ${reasons}` });
                if (res.failed.some((f) => f.reason?.startsWith("No longer"))) load();
            }
        } catch (err) {
            setNotice({ ok: false, text: `Nothing was restored: ${err.message}` });
        } finally {
            setBusy(null);
        }
    };

    const deleteForever = async (ids, label) => {
        if (!confirm(`Permanently delete ${label}? Any images or files go too. This cannot be undone.`)) return;
        setBusy("forever");
        setNotice(null);
        try {
            const res = await adminFetch("/api/trash/delete-forever", { method: "POST", body: { ids } });
            remove(ids);
            selection.clear();
            setNotice({ ok: true, text: `Permanently deleted ${plural(res.deleted, ITEM)}.` });
        } catch (err) {
            setNotice({ ok: false, text: `Nothing was deleted: ${err.message}` });
        } finally {
            setBusy(null);
        }
    };

    const emptyAll = async () => {
        if (!confirm(`Permanently delete all ${plural(items.length, ITEM)} in Recently deleted? This cannot be undone.`)) return;
        setBusy("empty");
        try {
            const res = await adminFetch("/api/trash/empty", { method: "POST" });
            setItems([]);
            selection.clear();
            setNotice({ ok: true, text: `Recently deleted is empty (${plural(res.deleted, ITEM)} permanently deleted).` });
        } catch (err) {
            setNotice({ ok: false, text: `Nothing was deleted: ${err.message}` });
        } finally {
            setBusy(null);
        }
    };

    const chip = (key, label, n) => (
        <button
            key={key}
            type="button"
            onClick={() => { setFilter(key); selection.clear(); }}
            aria-pressed={activeFilter === key}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${activeFilter === key ? "bg-[#1D1D7E] text-white border-[#1D1D7E]" : "bg-white text-gray-600 border-gray-200 hover:border-[#1D1D7E]/40"}`}
        >
            {label} <span className={activeFilter === key ? "text-white/70" : "text-gray-400"}>{n}</span>
        </button>
    );

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Recently deleted</h1>
                    <p className="text-sm text-gray-500 mt-1 max-w-2xl">
                        Anything deleted in the dashboard stays here for {retention} days, then it is removed permanently.
                        Restoring puts it back exactly as it was, including its images and files.
                    </p>
                </div>
                {items.length > 0 && (
                    <button
                        type="button"
                        onClick={emptyAll}
                        disabled={!!busy}
                        className={`${barButton} border border-red-200 bg-white text-red-600 hover:bg-red-50`}
                    >
                        {busy === "empty" ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Empty Recently deleted
                    </button>
                )}
            </div>

            {status === "loading" && (
                <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
                    <Loader2 size={18} className="animate-spin" /> Loading…
                </div>
            )}

            {status === "error" && (
                <div className="mb-4 p-3 bg-red-100 text-red-600 rounded flex justify-between items-center gap-4">
                    <span>Recently deleted could not be loaded: {error}</span>
                    <button onClick={() => { setStatus("loading"); load(); }} className="px-3 py-1 text-sm bg-white border border-red-200 rounded">Retry</button>
                </div>
            )}

            {status === "ready" && (
                <>
                    {items.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Filter by type">
                            {chip("all", "All", items.length)}
                            {Object.entries(SECTIONS).filter(([key]) => counts[key]).map(([key, s]) => chip(key, s.label, counts[key]))}
                        </div>
                    )}

                    <SelectionBar selection={selection} busy={!!busy} notice={notice} onDismissNotice={dismiss}>
                        <button type="button" onClick={() => restoreItems([...selection.selectedIds])} disabled={!!busy} className={`${barButton} bg-[#1D1D7E] text-white hover:bg-[#16166a]`}>
                            {busy === "restore" ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />} Restore {selection.count}
                        </button>
                        <button
                            type="button"
                            onClick={() => deleteForever([...selection.selectedIds], plural(selection.count, ITEM))}
                            disabled={!!busy}
                            className={`${barButton} bg-white border border-red-200 text-red-600 hover:bg-red-50`}
                        >
                            {busy === "forever" ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete forever
                        </button>
                    </SelectionBar>

                    {items.length === 0 ? (
                        <div className="bg-white rounded-xl border border-dashed border-gray-200 py-16 text-center">
                            <Trash2 className="mx-auto text-gray-300 mb-3" size={32} />
                            <p className="font-semibold text-gray-500">Nothing in Recently deleted</p>
                            <p className="text-sm text-gray-400 mt-1">Items you delete appear here for {retention} days.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto bg-white shadow rounded-lg">
                            <table className="w-full border-collapse">
                                <thead className="bg-gray-100 text-left text-sm">
                                    <tr>
                                        <th className="p-3 w-10"><SelectAllCheckbox selection={selection} label="Select all deleted items" /></th>
                                        <th className="p-3">Item</th>
                                        <th className="p-3">Deleted</th>
                                        <th className="p-3">Removed permanently</th>
                                        <th className="p-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visible.map((item) => {
                                        const left = timeLeft(item.expires_at, now);
                                        return (
                                            <tr key={item.id} className={`border-b align-middle ${selection.isSelected(item.id) ? "bg-indigo-50/60" : "hover:bg-gray-50"}`}>
                                                <td className="p-3"><SelectRowCheckbox selection={selection} id={item.id} label={`Select “${item.title}”`} /></td>
                                                <td className="p-3">
                                                    <div className="font-medium flex items-center gap-1.5">
                                                        {item.title}
                                                        {item.has_files && <Paperclip size={13} className="text-gray-400" aria-label="Has images or files" />}
                                                    </div>
                                                    <span className="mt-1 inline-block text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">{item.type}</span>
                                                </td>
                                                <td className="p-3 text-sm text-gray-600">
                                                    <div>{formatWhen(item.deleted_at)}</div>
                                                    {item.deleted_by && <div className="text-xs text-gray-400">by {item.deleted_by}</div>}
                                                </td>
                                                <td className="p-3 text-sm">
                                                    <span className={`inline-flex items-center gap-1 ${left.urgent ? "text-red-600 font-semibold" : "text-gray-600"}`} title={formatWhen(item.expires_at)}>
                                                        <Clock size={13} /> {left.text}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => restoreItems([item.id])}
                                                            disabled={!!busy}
                                                            className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                                                        >
                                                            <RotateCcw size={13} /> Restore
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => deleteForever([item.id], `“${item.title}”`)}
                                                            disabled={!!busy}
                                                            className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 disabled:opacity-50"
                                                        >
                                                            Delete forever
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {items.length > 0 && (
                        <p className="mt-4 text-xs text-gray-400">
                            Restored items go back to their own section, for example{" "}
                            <Link href="/dashboard/blog" className="underline">Blog</Link> or <Link href="/dashboard/newsfeed" className="underline">News Feed</Link>.
                        </p>
                    )}
                </>
            )}
        </div>
    );
}
