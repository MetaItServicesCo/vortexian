"use client";

import { useEffect, useRef } from "react";

// Checkbox for list selection. `indeterminate` shows the "some selected" dash.
export default function SelectCheckbox({ checked, indeterminate = false, onChange, label, className = "" }) {
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current) ref.current.indeterminate = indeterminate;
    }, [indeterminate]);

    return (
        <input
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={() => {}}
            // onClick (not onChange) so Shift+click range selection can read the key
            onClick={(e) => {
                e.stopPropagation();
                onChange(e);
            }}
            aria-label={label}
            data-select-checkbox=""
            className={`h-4 w-4 cursor-pointer rounded border-gray-300 accent-[#1D1D7E] ${className}`}
        />
    );
}

// Header cell checkbox for a whole list
export function SelectAllCheckbox({ selection, label = "Select all" }) {
    return (
        <SelectCheckbox
            checked={selection.allSelected}
            indeterminate={selection.someSelected}
            onChange={selection.toggleAll}
            label={label}
        />
    );
}

// Row checkbox
export function SelectRowCheckbox({ selection, id, label }) {
    return (
        <SelectCheckbox
            checked={selection.isSelected(id)}
            onChange={(e) => selection.toggle(id, e)}
            label={label}
        />
    );
}
