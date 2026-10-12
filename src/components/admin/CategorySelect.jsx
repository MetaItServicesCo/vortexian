"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * Category picker for the service and blog editors (Dashboard → Categories).
 * value: category id (number|""), onChange(id, name). If the item has no id yet
 * (older data), `legacyName` preselects the category with that name, else "Others".
 */
export default function CategorySelect({ kind, value, legacyName, onChange, id, className = "" }) {
    const [options, setOptions] = useState(null);

    useEffect(() => {
        let cancelled = false;
        fetch(`/api/categories/?kind=${kind}`, { cache: "no-store" })
            .then((res) => (res.ok ? res.json() : []))
            .catch(() => [])
            .then((list) => !cancelled && setOptions(Array.isArray(list) ? list : []));
        return () => { cancelled = true; };
    }, [kind]);

    // Pick a sensible default once the list arrives
    useEffect(() => {
        if (!options?.length || value) return;
        const byName = legacyName && options.find((o) => o.name.toLowerCase() === legacyName.trim().toLowerCase());
        const pick = byName || options.find((o) => o.is_system) || options[0];
        onChange(pick.id, pick.name);
    }, [options, value, legacyName, onChange]);

    return (
        <div>
            <select
                id={id}
                value={value || ""}
                disabled={!options}
                onChange={(e) => {
                    const opt = options.find((o) => String(o.id) === e.target.value);
                    if (opt) onChange(opt.id, opt.name);
                }}
                className={className || "w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl"}
            >
                {!options && <option value="">Loading categories…</option>}
                {options?.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                ))}
            </select>
            <Link href={`/dashboard/categories?kind=${kind}`} className="mt-1 inline-block text-xs text-[#1D1D7E] underline underline-offset-2">
                Manage {kind} categories
            </Link>
        </div>
    );
}
