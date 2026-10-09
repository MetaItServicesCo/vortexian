"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, CheckSquare, Eye, EyeOff, Loader2, Trash2, X } from "lucide-react";
import { adminFetch } from "@/lib/adminApi";

const CHUNK = 500; // server accepts up to 1000 ids per request

async function runBulk(resource, action, ids, extra = {}) {
    let done = 0;
    for (let i = 0; i < ids.length; i += CHUNK) {
        const chunk = ids.slice(i, i + CHUNK);
        const res = await adminFetch(`/api/bulk/${resource}/${action}`, { method: "POST", body: { ids: chunk, ...extra } });
        done += res.deleted ?? res.updated ?? 0;
    }
    return done;
}

const plural = (n, [one, many]) => `${n} ${n === 1 ? one : many}`;

/**
 * Selection bar for an admin list. Appears while rows are selected.
 *
 * resource   key of the backend bulk resource (see backend/app/routes/bulk.py)
 * selection  value returned by useSelection()
 * noun       ["update", "updates"]
 * onDeleted(ids)                 remove the rows from the page
 * onPublished(ids, isPublished)  optional: enables Publish / Unpublish
 * deleteWarning                  optional extra line for the delete confirmation
 */
export default function BulkActions({ resource, selection, noun, onDeleted, onPublished, deleteWarning }) {
    const [busy, setBusy] = useState(null);
    const [notice, setNotice] = useState(null);
    const { count, total, selectedIds } = selection;

    // Esc clears the selection (unless typing in a field)
    useEffect(() => {
        if (count === 0) return;
        const onKey = (e) => {
            if (e.key !== "Escape" || busy) return;
            if (e.target.closest?.("input:not([data-select-checkbox]), textarea, select, [contenteditable='true'], [role='dialog']")) return;
            selection.clear();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [count, busy, selection]);

    useEffect(() => {
        if (!notice) return;
        const t = setTimeout(() => setNotice(null), 6000);
        return () => clearTimeout(t);
    }, [notice]);

    const act = async (kind) => {
        const ids = [...selectedIds];
        if (kind === "delete") {
            const lines = [`Delete ${plural(ids.length, noun)}? This cannot be undone.`];
            if (deleteWarning) lines.push(deleteWarning);
            if (!confirm(lines.join("\n\n"))) return;
        }
        setBusy(kind);
        setNotice(null);
        try {
            if (kind === "delete") {
                const n = await runBulk(resource, "delete", ids);
                onDeleted(ids); // rows already gone elsewhere are removed too
                setNotice({ ok: true, text: `Deleted ${plural(n, noun)}.` });
            } else {
                const value = kind === "publish";
                const n = await runBulk(resource, "publish", ids, { is_published: value });
                onPublished(ids, value);
                setNotice({ ok: true, text: `${value ? "Published" : "Unpublished"} ${plural(n, noun)}.` });
            }
            selection.clear();
        } catch (err) {
            setNotice({ ok: false, text: `Nothing was changed: ${err.message}` });
        } finally {
            setBusy(null);
        }
    };

    const button = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition disabled:opacity-50";

    return (
        <div className="sticky top-0 z-20" aria-live="polite">
            {count === 0 && total > 0 && (
                <div className="mb-3 flex items-center gap-3 text-sm text-gray-500">
                    <button
                        type="button"
                        onClick={selection.selectAll}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-semibold text-[#1D1D7E] hover:bg-[#EEF0FF]"
                    >
                        <CheckSquare size={15} /> Select all ({total})
                    </button>
                    <span className="hidden sm:inline">or tick rows to select them · Shift+click selects a range</span>
                </div>
            )}

            {count > 0 && (
                <div
                    role="region"
                    aria-label="Bulk actions"
                    className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-[#1D1D7E]/20 bg-[#EEF0FF] px-4 py-3 shadow-sm"
                >
                    <span className="text-sm font-bold text-[#1D1D7E]" data-testid="bulk-count">
                        {count} of {total} selected
                    </span>
                    {count < total && (
                        <button type="button" onClick={selection.selectAll} disabled={!!busy} className="text-sm font-semibold text-[#1D1D7E] underline underline-offset-2">
                            Select all {total}
                        </button>
                    )}
                    <button type="button" onClick={selection.clear} disabled={!!busy} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                        <X size={14} /> Clear selection
                    </button>

                    <div className="flex flex-wrap gap-2 sm:ml-auto">
                        {onPublished && (
                            <>
                                <button type="button" onClick={() => act("publish")} disabled={!!busy} className={`${button} bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50`}>
                                    {busy === "publish" ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />} Publish
                                </button>
                                <button type="button" onClick={() => act("unpublish")} disabled={!!busy} className={`${button} bg-white border border-gray-200 text-gray-700 hover:bg-gray-50`}>
                                    {busy === "unpublish" ? <Loader2 size={14} className="animate-spin" /> : <EyeOff size={14} />} Unpublish
                                </button>
                            </>
                        )}
                        <button type="button" onClick={() => act("delete")} disabled={!!busy} className={`${button} bg-red-600 text-white hover:bg-red-700`}>
                            {busy === "delete" ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            {busy === "delete" ? "Deleting…" : `Delete ${count}`}
                        </button>
                    </div>
                </div>
            )}

            {notice && (
                <div
                    role="status"
                    className={`mb-4 flex items-center gap-2 rounded-lg px-4 py-2 text-sm ${notice.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}
                >
                    {notice.ok && <CheckCircle2 size={16} />}
                    <span>{notice.text}</span>
                    <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss" className="ml-auto opacity-60 hover:opacity-100">
                        <X size={14} />
                    </button>
                </div>
            )}
        </div>
    );
}
