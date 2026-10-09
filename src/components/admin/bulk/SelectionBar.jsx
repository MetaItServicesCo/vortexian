"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, CheckSquare, X } from "lucide-react";

export const barButton = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition disabled:opacity-50";

export const plural = (n, [one, many]) => `${n} ${n === 1 ? one : many}`;

/**
 * Shared selection UI for admin lists:
 * - nothing selected: a "Select all (N)" button
 * - rows selected:    "3 of 12 selected · Select all · Clear selection" + the list's actions
 * - after an action:  a result notice (optionally with a link)
 * Esc clears the selection.
 */
export default function SelectionBar({ selection, busy = false, notice, onDismissNotice, children }) {
    const { count, total } = selection;

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
        if (!notice || !onDismissNotice) return;
        const t = setTimeout(onDismissNotice, notice.link ? 12000 : 6000);
        return () => clearTimeout(t);
    }, [notice, onDismissNotice]);

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
                        <button type="button" onClick={selection.selectAll} disabled={busy} className="text-sm font-semibold text-[#1D1D7E] underline underline-offset-2">
                            Select all {total}
                        </button>
                    )}
                    <button type="button" onClick={selection.clear} disabled={busy} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                        <X size={14} /> Clear selection
                    </button>
                    <div className="flex flex-wrap gap-2 sm:ml-auto">{children}</div>
                </div>
            )}

            {notice && (
                <div
                    role="status"
                    className={`mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg px-4 py-2 text-sm ${notice.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}
                >
                    {notice.ok && <CheckCircle2 size={16} className="shrink-0" />}
                    <span>{notice.text}</span>
                    {notice.link && (
                        <Link href={notice.link.href} className="font-semibold underline underline-offset-2">
                            {notice.link.label}
                        </Link>
                    )}
                    {onDismissNotice && (
                        <button type="button" onClick={onDismissNotice} aria-label="Dismiss" className="ml-auto opacity-60 hover:opacity-100">
                            <X size={14} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
