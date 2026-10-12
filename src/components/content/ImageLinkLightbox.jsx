"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, Loader2, X } from "lucide-react";
import { isImageHref } from "@/lib/imageLinks";

/**
 * Text links in rich content that point to an image open the image in a pop-up
 * over the page. One listener for the whole site; without JavaScript (or with
 * Ctrl/Cmd/middle click) the link simply opens the image as before.
 */
export default function ImageLinkLightbox() {
    const [open, setOpen] = useState(null); // { href, label }
    const [status, setStatus] = useState("loading"); // loading | ready | error
    const closeRef = useRef(null);
    const returnFocus = useRef(null);

    useEffect(() => {
        const onClick = (e) => {
            if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            const link = e.target.closest?.(".rich-content a[href]");
            if (!link || link.closest(".tiptap-editor") || !isImageHref(link.getAttribute("href"))) return;
            e.preventDefault();
            returnFocus.current = link;
            setStatus("loading");
            setOpen({ href: link.href, label: link.textContent.trim() });
        };
        document.addEventListener("click", onClick);
        return () => document.removeEventListener("click", onClick);
    }, []);

    const close = useCallback(() => {
        setOpen(null);
        returnFocus.current?.focus();
    }, []);

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === "Escape" && close();
        document.addEventListener("keydown", onKey);
        const overflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        closeRef.current?.focus();
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = overflow;
        };
    }, [open, close]);

    if (!open) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={open.label || "Image"}
            data-image-lightbox=""
            className="fixed inset-0 z-[2147483000] flex flex-col items-center justify-center bg-black/85 p-4 sm:p-8"
            onClick={(e) => e.target === e.currentTarget && close()}
            onKeyDown={(e) => {
                // keep Tab inside the pop-up
                if (e.key !== "Tab") return;
                const items = [...e.currentTarget.querySelectorAll("button, a[href]")];
                const i = items.indexOf(document.activeElement);
                const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : (i + 1) % items.length;
                e.preventDefault();
                items[next]?.focus();
            }}
        >
            <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close image"
                className="absolute top-3 right-3 sm:top-5 sm:right-5 w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
                <X size={22} />
            </button>

            {status === "loading" && <Loader2 className="absolute w-8 h-8 text-white/80 animate-spin" aria-label="Loading image" />}
            {status === "error" ? (
                <p className="text-white text-center">This image couldn&apos;t be loaded.</p>
            ) : (
                // eslint-disable-next-line @next/next/no-img-element -- admin-linked image of any size
                <img
                    src={open.href}
                    alt={open.label}
                    onLoad={() => setStatus("ready")}
                    onError={() => setStatus("error")}
                    className={`block max-w-full max-h-[80vh] w-auto h-auto object-contain rounded-lg shadow-2xl transition-opacity ${status === "ready" ? "opacity-100" : "opacity-0"}`}
                />
            )}

            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-white/80 max-w-3xl text-center">
                {open.label && <span className="font-semibold text-white">{open.label}</span>}
                <a href={open.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 underline underline-offset-2 hover:text-white">
                    Open full size <ExternalLink size={14} />
                </a>
            </div>
        </div>
    );
}
