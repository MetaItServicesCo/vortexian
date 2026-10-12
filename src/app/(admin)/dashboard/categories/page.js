"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp, Check, Loader2, Lock, Pencil, Plus, Trash2, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { adminFetch } from "@/lib/adminApi";

const KINDS = {
    service: { label: "Service categories", item: ["service", "services"], help: "Choose a category for each service. Categories switched on appear in the website's Services dropdown, each opening its services." },
    blog: { label: "Blog categories", item: ["post", "posts"], help: "Choose a category for each blog post. The Blog page shows them as filter buttons." },
};

function Switch({ checked, onChange, label, disabled }) {
    return (
        <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} onClick={() => onChange(!checked)}
            className={`relative w-11 h-6 shrink-0 rounded-full transition disabled:opacity-50 ${checked ? "bg-[#1D1D7E]" : "bg-slate-300"}`}>
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
        </button>
    );
}

function CategoriesManager() {
    const params = useSearchParams();
    const kind = params.get("kind") === "blog" ? "blog" : "service";
    const meta = KINDS[kind];
    const [rows, setRows] = useState(null);
    const [newName, setNewName] = useState("");
    const [editing, setEditing] = useState(null); // { id, name }
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        let cancelled = false;
        adminFetch(`/api/categories/admin?kind=${kind}`).then(
            (data) => !cancelled && setRows(data),
            (err) => { if (!cancelled) { toast.error(err.message); setRows([]); } }
        );
        return () => { cancelled = true; };
    }, [kind]);

    const run = async (fn) => {
        setBusy(true);
        try {
            await fn();
        } catch (err) {
            toast.error(err.message, { duration: 6000 });
        } finally {
            setBusy(false);
        }
    };

    const add = (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        run(async () => {
            const cat = await adminFetch("/api/categories/", { method: "POST", body: { kind, name: newName.trim() } });
            setRows((prev) => { const list = [...prev]; list.splice(list.length - 1, 0, cat); return list; }); // before "Others"
            setNewName("");
            toast.success(`“${cat.name}” added`);
        });
    };

    const update = (row, body, message) =>
        run(async () => {
            const saved = await adminFetch(`/api/categories/${row.id}`, { method: "PATCH", body });
            setRows((prev) => prev.map((r) => (r.id === row.id ? saved : r)));
            setEditing(null);
            if (message) toast.success(message);
        });

    const move = (index, delta) =>
        run(async () => {
            const own = rows.filter((r) => !r.is_system);
            const target = index + delta;
            if (target < 0 || target >= own.length) return;
            [own[index], own[target]] = [own[target], own[index]];
            setRows(await adminFetch("/api/categories/reorder", { method: "POST", body: { kind, ids: own.map((r) => r.id) } }));
        });

    const remove = (row) => {
        const n = row.count;
        const note = n ? `\n\nIts ${n} ${n === 1 ? meta.item[0] : meta.item[1]} will move to “Others”.` : "";
        if (!confirm(`Delete the category “${row.name}”?${note}`)) return;
        run(async () => {
            const res = await adminFetch(`/api/categories/${row.id}`, { method: "DELETE" });
            setRows(await adminFetch(`/api/categories/admin?kind=${kind}`));
            toast.success(res.message);
        });
    };

    const own = (rows || []).filter((r) => !r.is_system);

    return (
        <div className="max-w-4xl">
            <Toaster position="top-center" />
            <h1 className="text-3xl font-black text-[#1D1D7E] uppercase tracking-tighter">Categories</h1>
            <p className="text-slate-500 mt-1">Organise services and blog posts. Changes go live as soon as you make them.</p>

            <nav aria-label="Category type" className="flex gap-1 border-b border-gray-200 mt-6 mb-4">
                {Object.entries(KINDS).map(([key, k]) => (
                    <Link key={key} href={`/dashboard/categories?kind=${key}`} aria-current={kind === key ? "page" : undefined}
                        className={`px-4 py-2.5 -mb-px text-sm font-semibold border-b-2 ${kind === key ? "border-[#1D1D7E] text-[#1D1D7E]" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
                        {k.label}
                    </Link>
                ))}
            </nav>
            <p className="text-sm text-slate-500 mb-5">{meta.help}</p>

            <form onSubmit={add} className="flex gap-2 mb-5">
                <input id="new-category" value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={100}
                    placeholder={kind === "service" ? "New category, e.g. Cloud & DevOps" : "New category, e.g. Hiring Tips"}
                    className="flex-1 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1D1D7E]/40" />
                <button type="submit" disabled={busy || !newName.trim()} className="inline-flex items-center gap-2 bg-[#1D1D7E] text-white px-4 rounded-xl font-semibold disabled:opacity-50">
                    <Plus size={16} /> Add category
                </button>
            </form>

            {rows === null ? (
                <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-[#1D1D7E]" /></div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100" data-testid="category-list">
                    {rows.map((row) => {
                        const i = own.findIndex((r) => r.id === row.id);
                        return (
                            <div key={row.id} className="flex flex-wrap items-center gap-3 px-4 py-3" data-category={row.name}>
                                {editing?.id === row.id ? (
                                    <form className="flex flex-1 gap-2 min-w-[220px]" onSubmit={(e) => { e.preventDefault(); update(row, { name: editing.name.trim() }, "Category renamed"); }}>
                                        <input autoFocus aria-label="Category name" value={editing.name} maxLength={100} onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                                            className="flex-1 p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1D1D7E]/40" />
                                        <button type="submit" aria-label="Save name" disabled={busy || !editing.name.trim()} className="p-2 rounded-lg bg-[#1D1D7E] text-white"><Check size={16} /></button>
                                        <button type="button" aria-label="Cancel" onClick={() => setEditing(null)} className="p-2 rounded-lg border border-gray-200"><X size={16} /></button>
                                    </form>
                                ) : (
                                    <div className="flex-1 min-w-[180px]">
                                        <span className="font-semibold text-slate-800">{row.name}</span>
                                        {row.is_system && <span className="ml-2 inline-flex items-center gap-1 text-xs text-slate-400"><Lock size={11} /> built in</span>}
                                        <span className="block text-xs text-slate-400">
                                            {row.count} {row.count === 1 ? meta.item[0] : meta.item[1]}
                                            {row.is_system ? " · items without a category, or from deleted categories" : ""}
                                        </span>
                                    </div>
                                )}
                                {kind === "service" && (
                                    <label className="flex items-center gap-2 text-sm text-slate-600">
                                        <Switch checked={row.show_in_menu} disabled={busy} label={`Show “${row.name}” in the Services menu`}
                                            onChange={(v) => update(row, { show_in_menu: v }, v ? `“${row.name}” shown in the Services menu` : `“${row.name}” hidden from the Services menu`)} />
                                        <span className="hidden sm:inline">In Services menu</span>
                                    </label>
                                )}
                                {!row.is_system && (
                                    <div className="flex items-center gap-1">
                                        <button type="button" aria-label={`Move “${row.name}” up`} disabled={busy || i === 0} onClick={() => move(i, -1)} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowUp size={15} /></button>
                                        <button type="button" aria-label={`Move “${row.name}” down`} disabled={busy || i === own.length - 1} onClick={() => move(i, 1)} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowDown size={15} /></button>
                                        <button type="button" aria-label={`Rename “${row.name}”`} disabled={busy} onClick={() => setEditing({ id: row.id, name: row.name })} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100"><Pencil size={15} /></button>
                                        <button type="button" aria-label={`Delete “${row.name}”`} disabled={busy} onClick={() => remove(row)} className="p-1.5 rounded-md text-red-500 hover:bg-red-50"><Trash2 size={15} /></button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
            <p className="mt-3 text-xs text-slate-400">
                {kind === "service"
                    ? "The dropdown shows categories in this order, each with its services that have “Show in Services menu” on (Manage Services). Others is always last."
                    : "The Blog page lists these as filter buttons, in this order."}
            </p>
        </div>
    );
}

export default function CategoriesPage() {
    return (
        <Suspense fallback={<div className="py-16 flex justify-center"><Loader2 className="animate-spin text-[#1D1D7E]" /></div>}>
            <CategoriesManager />
        </Suspense>
    );
}
