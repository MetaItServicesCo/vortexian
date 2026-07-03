"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Type config (same as yours) ─────────────────────────────
const TYPE_CONFIG = {
  event: {
    label: "Event",
    wrapperBg: "bg-purple-50",
    iconColor: "text-purple-600",
    badgeBg: "bg-purple-50",
    badgeText: "text-purple-700",
  },
  award: {
    label: "Award",
    wrapperBg: "bg-amber-50",
    iconColor: "text-amber-500",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
  },
  announcement: {
    label: "Announcement",
    wrapperBg: "bg-green-50",
    iconColor: "text-green-600",
    badgeBg: "bg-green-50",
    badgeText: "text-green-800",
  },
  new_hire: {
    label: "New Hire",
    wrapperBg: "bg-blue-50",
    iconColor: "text-blue-600",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-800",
  },
  holiday: {
    label: "Holiday",
    wrapperBg: "bg-rose-50",
    iconColor: "text-rose-500",
    badgeBg: "bg-rose-50",
    badgeText: "text-rose-700",
  },
  general: {
    label: "Update",
    wrapperBg: "bg-gray-100",
    iconColor: "text-gray-500",
    badgeBg: "bg-gray-100",
    badgeText: "text-gray-700",
  },
};

// ── Simple icons ─────────────────────────────────────────────
const CalendarIcon = () => (
  <svg
    className="w-3 h-3"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

// ── MAIN COMPONENT ───────────────────────────────────────────
export default function NewsFeed() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE_URL}/api/newsfeed`);
      if (!res.ok) throw new Error("API Error");

      const data = await res.json();

      // optional: reverse for latest first
      setNews(data.reverse());
    } catch (err) {
      setError("Failed to load news");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div className="rounded-2xl border border-gray-100 shadow-sm w-full max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="text-[15px] font-semibold">Company feed</h2>
        <span className="text-[12px] text-gray-400">{news.length} updates</span>
      </div>

      {/* Error */}
      {error && <div className="p-3 text-red-600 text-sm">{error}</div>}

      {/* Loading */}
      {loading ? (
        <div className="p-5 text-sm text-gray-400">Loading...</div>
      ) : (
        <div className="divide-y divide-gray-50">
          {news.map((item) => {
            const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.general;

            return (
              <div
                key={item.id}
                className="flex gap-3 px-5 py-4 hover:bg-gray-50 transition"
              >
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.wrapperBg} ${config.iconColor}`}
                >
                  📢
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[14px] font-semibold text-gray-900">
                      {item.title}
                    </span>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${config.badgeBg} ${config.badgeText}`}
                    >
                      {item.feed_type || config.label}
                    </span>
                  </div>

                  {/* Description */}
                  {/* Description */}
                  <div
                    className="text-[12px] text-gray-500 mb-2 ql-editor-preview"
                    dangerouslySetInnerHTML={{ __html: item.description }}
                  />

                  {/* Meta */}
                  <div className="flex items-center gap-1 text-[11px] text-gray-400 flex-wrap">
                    {item.event_date && (
                      <>
                        <CalendarIcon />
                        <span>{item.event_date}</span>
                        <span>·</span>
                      </>
                    )}

                    <span>{item.created_at || item.createdAt}</span>
                    <span>·</span>
                    <span>{item.author || "Admin"}</span>
                  </div>

                  {/* Image */}
                  {item.media_url && (
                    <img
                      src={`${API_BASE_URL}${item.media_url}`}
                      className="mt-2 w-full h-32 object-cover rounded-lg"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
