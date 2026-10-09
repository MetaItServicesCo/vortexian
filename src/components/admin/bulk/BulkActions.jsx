"use client";

import { useCallback, useState } from "react";
import { Eye, EyeOff, Loader2, Trash2 } from "lucide-react";
import { adminFetch } from "@/lib/adminApi";
import SelectionBar, { barButton, plural } from "./SelectionBar";

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

export const RECENTLY_DELETED = { href: "/dashboard/trash", label: "View Recently deleted" };

/**
 * Selection bar + bulk actions for an admin list.
 *
 * resource   key of the backend bulk resource (see backend/app/trash.py)
 * selection  value returned by useSelection()
 * noun       ["update", "updates"]
 * onDeleted(ids)                 remove the rows from the page
 * onPublished(ids, isPublished)  optional: enables Publish / Unpublish
 * deleteWarning                  optional extra line for the delete confirmation
 */
export default function BulkActions({ resource, selection, noun, onDeleted, onPublished, deleteWarning }) {
    const [busy, setBusy] = useState(null);
    const [notice, setNotice] = useState(null);
    const dismiss = useCallback(() => setNotice(null), []);

    const act = async (kind) => {
        const ids = [...selection.selectedIds];
        if (kind === "delete") {
            const lines = [`Delete ${plural(ids.length, noun)}?`];
            if (deleteWarning) lines.push(deleteWarning);
            lines.push("You can restore them from Recently deleted for 7 days.");
            if (!confirm(lines.join("\n\n"))) return;
        }
        setBusy(kind);
        setNotice(null);
        try {
            if (kind === "delete") {
                const n = await runBulk(resource, "delete", ids);
                onDeleted(ids); // rows already gone elsewhere are removed too
                setNotice({ ok: true, text: `Deleted ${plural(n, noun)}. You can restore ${n === 1 ? "it" : "them"} for 7 days.`, link: RECENTLY_DELETED });
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

    return (
        <SelectionBar selection={selection} busy={!!busy} notice={notice} onDismissNotice={dismiss}>
            {onPublished && (
                <>
                    <button type="button" onClick={() => act("publish")} disabled={!!busy} className={`${barButton} bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50`}>
                        {busy === "publish" ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />} Publish
                    </button>
                    <button type="button" onClick={() => act("unpublish")} disabled={!!busy} className={`${barButton} bg-white border border-gray-200 text-gray-700 hover:bg-gray-50`}>
                        {busy === "unpublish" ? <Loader2 size={14} className="animate-spin" /> : <EyeOff size={14} />} Unpublish
                    </button>
                </>
            )}
            <button type="button" onClick={() => act("delete")} disabled={!!busy} className={`${barButton} bg-red-600 text-white hover:bg-red-700`}>
                {busy === "delete" ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {busy === "delete" ? "Deleting…" : `Delete ${selection.count}`}
            </button>
        </SelectionBar>
    );
}
