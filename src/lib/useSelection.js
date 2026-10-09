"use client";

import { useCallback, useMemo, useRef, useState } from "react";

const byId = (item) => item.id;

// Row selection for admin lists: toggle one, Shift+click a range, select all.
// Only ids still present in `items` count as selected, so rows removed from the
// list (deleted, filtered out) drop out of the selection automatically.
export function useSelection(items, getId = byId) {
    const [picked, setPicked] = useState(() => new Set());
    const anchor = useRef(null);

    const ids = useMemo(() => items.map(getId), [items, getId]);
    const selectedIds = useMemo(() => ids.filter((id) => picked.has(id)), [ids, picked]);
    const count = selectedIds.length;

    const toggle = useCallback(
        (id, event) => {
            // Read the anchor now: the state updater runs later, after it has moved
            const from = ids.indexOf(anchor.current);
            const to = ids.indexOf(id);
            const range = event?.shiftKey && from !== -1 && to !== -1;
            setPicked((prev) => {
                const next = new Set(prev);
                const select = !prev.has(id);
                if (range) {
                    const [start, end] = from < to ? [from, to] : [to, from];
                    ids.slice(start, end + 1).forEach((rowId) => (select ? next.add(rowId) : next.delete(rowId)));
                } else if (select) {
                    next.add(id);
                } else {
                    next.delete(id);
                }
                return next;
            });
            anchor.current = id;
        },
        [ids]
    );

    const selectAll = useCallback(() => setPicked(new Set(ids)), [ids]);
    const clear = useCallback(() => {
        setPicked(new Set());
        anchor.current = null;
    }, []);

    return {
        selectedIds,
        count,
        total: ids.length,
        allSelected: ids.length > 0 && count === ids.length,
        someSelected: count > 0 && count < ids.length,
        isSelected: (id) => picked.has(id),
        toggle,
        toggleAll: () => (ids.length > 0 && count === ids.length ? clear() : selectAll()),
        selectAll,
        clear,
    };
}
