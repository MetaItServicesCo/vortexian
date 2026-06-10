"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import NewsFeed from "./NewsFeed";

export default function NewsDrawerWrapper() {
  const [open, setOpen] = useState(false);
  const [showButton, setShowButton] = useState(true);

  // Auto hide/show button every 10 sec
  useEffect(() => {
    // Drawer open ho to animation stop
    if (open) return;

    const interval = setInterval(() => {
      setShowButton((prev) => !prev);
    }, 5000);

    return () => clearInterval(interval);
  }, [open]);

  const handleOpen = () => {
    setOpen(true);

    // Drawer open hone par button visible rahe
    setShowButton(true);
  };

  const handleClose = () => {
    setOpen(false);

    // Close hone par button visible ho jaye
    setShowButton(true);
  };

  return (
    <>
      {/* BUTTON */}
      <button
        onClick={handleOpen}
        className={`
          fixed bottom-5 z-50
          bg-[#6B21D4] text-white px-2 py-3 rounded-l-sm shadow-lg
          hover:bg-[#5b1db8]
          transition-all duration-700 ease-in-out
          w-[140px] lg:w-[250px]
          text-sm font-semibold
          ${
            showButton
              ? "right-0 opacity-100"
              : "-right-[250px] opacity-0"
          }
        `}
      >
        News & Updates
      </button>

      {/* BACKDROP */}
      {open && (
        <div
          onClick={handleClose}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}

      {/* DRAWER */}
      <div
        className={`fixed right-0 bottom-18
        w-full max-w-md
        h-[400px]
        sm:h-[400px]
        bg-white shadow-2xl z-50
        transform transition-transform duration-300
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h2 className="font-semibold text-gray-900">
            Company News Feed
          </h2>

          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="h-[calc(400px-60px)] overflow-y-auto">
          <NewsFeed />
        </div>
      </div>
    </>
  );
}