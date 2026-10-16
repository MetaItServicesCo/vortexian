"use client";
import { useEffect, useRef } from "react";
import { animate, useInView } from "framer-motion";

// Counts from 0 up to `value` the first time it scrolls into view. The real number is in the
// server HTML (search engines, no-JS); visitors who prefer reduced motion just see the number.
const fmt = (n) => Math.round(n).toLocaleString("en-US");

export default function CountUp({ value, delay = 0, duration = 1.8, className }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });

    useEffect(() => {
        const el = ref.current;
        if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        if (!inView) {
            el.textContent = fmt(0);
            return;
        }
        const controls = animate(0, value, { duration, delay, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => { el.textContent = fmt(v); } });
        return () => {
            controls.stop();
            el.textContent = fmt(value);
        };
    }, [inView, value, delay, duration]);

    return <span ref={ref} className={className}>{fmt(value)}</span>;
}
