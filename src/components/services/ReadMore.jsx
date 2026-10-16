"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

// Long text shortened behind "Read more". The whole text is always in the page
// (search engines and screen readers get all of it); only its height is limited.
export default function ReadMore({ children, collapsed = true, height = 420, fade = "#ffffff", dark = false }) {
    const [open, setOpen] = useState(!collapsed);
    const [needed, setNeeded] = useState(collapsed);
    const box = useRef(null);
    const id = useId();

    // Only offer "Read more" when the text is actually longer than the shortened view
    useEffect(() => {
        if (!collapsed || !box.current || typeof ResizeObserver === "undefined") return;
        const el = box.current;
        const observer = new ResizeObserver(() => setNeeded(el.scrollHeight > height + 80));
        observer.observe(el);
        return () => observer.disconnect();
    }, [collapsed, height]);

    const clipped = needed && !open;
    return (
        <div>
            <div id={id} ref={box} className="relative overflow-hidden transition-[max-height] duration-500" style={clipped ? { maxHeight: height } : undefined} data-read-more={clipped ? "collapsed" : "open"}>
                {children}
                {clipped && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32" style={{ background: `linear-gradient(to top, ${fade}, transparent)` }} aria-hidden="true" />}
            </div>
            {needed && (
                <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls={id}
                    className={`mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold shadow-sm transition ${dark ? "bg-white/15 text-white hover:bg-white hover:text-[#1D1D7E]" : "border border-[#1D1D7E]/20 bg-white text-[#1D1D7E] hover:bg-[#1D1D7E] hover:text-white"}`}>
                    {open ? "Show less" : "Read more"} <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
                </button>
            )}
        </div>
    );
}
