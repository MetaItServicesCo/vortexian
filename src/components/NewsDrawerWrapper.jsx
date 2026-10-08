"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Newspaper, X, ArrowRight } from "lucide-react";
import NewsFeed from "./NewsFeed";

// "News & Updates" button + drawer: side panel on desktop, bottom sheet on mobile
export default function NewsDrawerWrapper() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false); // load the feed only once opened
  const buttonRef = useRef(null);

  const handleOpen = () => {
    setMounted(true);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      // An open update popup handles Escape itself
      if (e.key === "Escape" && !document.getElementById("news-modal-title")) handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleOpen}
        aria-expanded={open}
        aria-controls="news-drawer"
        className="fixed bottom-5 right-0 z-40 flex items-center gap-2 bg-[#1D1D7E] text-white pl-4 pr-5 py-3 rounded-l-xl shadow-lg hover:bg-[#2a2a9e] transition text-sm font-semibold"
      >
        <Newspaper size={18} aria-hidden="true" /> News &amp; Updates
      </button>

      {/* Backdrop */}
      <div
        onClick={handleClose}
        aria-hidden="true"
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      {/* Drawer */}
      <aside
        id="news-drawer"
        role="dialog"
        aria-label="News and updates"
        aria-hidden={!open}
        className={`fixed z-50 bg-slate-50 shadow-2xl flex flex-col transition-transform duration-300
          inset-x-0 bottom-0 h-[85vh] rounded-t-2xl
          sm:inset-x-auto sm:right-0 sm:top-0 sm:bottom-0 sm:h-full sm:w-[420px] sm:rounded-none
          ${open ? "translate-y-0 sm:translate-x-0" : "translate-y-full sm:translate-y-0 sm:translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 py-4 bg-white border-b">
          <div>
            <h2 className="font-bold text-gray-900">News &amp; Updates</h2>
            <p className="text-xs text-gray-500">Latest announcements from Vortexian Tech</p>
          </div>
          <button onClick={handleClose} aria-label="Close news" className="p-2 rounded-lg hover:bg-gray-100" tabIndex={open ? 0 : -1}>
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {mounted && <NewsFeed layout="compact" limit={10} />}
        </div>

        <div className="p-4 bg-white border-t">
          <Link
            href="/news"
            onClick={handleClose}
            tabIndex={open ? 0 : -1}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#1D1D7E] text-white font-semibold text-sm hover:bg-[#2a2a9e]"
          >
            See all updates <ArrowRight size={16} />
          </Link>
        </div>
      </aside>
    </>
  );
}
