"use client";

import Link from "next/link";

// ── Static news data ─────────────────────────────────────────
const NEWS_DATA = [
  {
    id: 1,
    type: "event",
    title: "Holiday Tea Party 🎉",
    description:
      "Join us for our annual Holiday Tea Party in the main hall. Enjoy festive treats, warm drinks, and celebrate the year with the whole team!",
    date: "Dec 20, 2025 · 3:00 PM",
    author: "HR Team",
    createdAt: "2h ago",
  },
  {
    id: 2,
    type: "award",
    title: "Employee of the Month",
    description:
      "Congratulations to Sarah Ahmed for outstanding client delivery this quarter! Your dedication is truly appreciated.",
    date: null,
    author: "Management",
    createdAt: "3h ago",
  },
  {
    id: 3,
    type: "announcement",
    title: "New Project Kickoff",
    description:
      "We're starting the Vortexian CRM Phase 2 project. Kickoff meeting scheduled for Monday 10 AM in Conference Room B.",
    date: "Monday · 10:00 AM",
    author: "Operations",
    createdAt: "2 days ago",
  },
  {
    id: 4,
    type: "new_hire",
    title: "Welcome Onboard, Zain!",
    description:
      "Zain Malik joins us as Senior Frontend Developer. Please give him a warm welcome and help him settle in!",
    date: null,
    author: "HR Team",
    createdAt: "3 days ago",
  },
  {
    id: 5,
    type: "holiday",
    title: "Office Closed — Eid ul Adha",
    description:
      "The office will remain closed on June 16–18 for Eid ul Adha. Wishing everyone a blessed celebration with family!",
    date: "Jun 16–18, 2025",
    author: "Admin",
    createdAt: "5 days ago",
  },
];

// ── Type config: icon + colors ───────────────────────────────
const TYPE_CONFIG = {
  event: {
    label: "Event",
    wrapperBg: "bg-purple-50",
    iconColor: "text-purple-600",
    badgeBg: "bg-purple-50",
    badgeText: "text-purple-700",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  award: {
    label: "Award",
    wrapperBg: "bg-amber-50",
    iconColor: "text-amber-500",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
  },
  announcement: {
    label: "Announcement",
    wrapperBg: "bg-green-50",
    iconColor: "text-green-600",
    badgeBg: "bg-green-50",
    badgeText: "text-green-800",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  new_hire: {
    label: "New Hire",
    wrapperBg: "bg-blue-50",
    iconColor: "text-blue-600",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-800",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
  },
  holiday: {
    label: "Holiday",
    wrapperBg: "bg-rose-50",
    iconColor: "text-rose-500",
    badgeBg: "bg-rose-50",
    badgeText: "text-rose-700",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 2L8 8H3l4 4-1.5 6L12 15l6.5 3L17 12l4-4h-5L12 2z" />
      </svg>
    ),
  },
  general: {
    label: "Update",
    wrapperBg: "bg-gray-100",
    iconColor: "text-gray-500",
    badgeBg: "bg-gray-100",
    badgeText: "text-gray-700",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
};

// ── Calendar icon ─────────────────────────────────────────────
function CalendarIcon() {
  return (
    <svg
      className="w-3 h-3 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════
export default function NewsFeed() {
  return (
    <div className=" rounded-2xl border border-gray-100 shadow-sm  w-full max-w-md">
      {" "}
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#6B21D4]/10 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-[#6B21D4]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v10a2 2 0 01-2 2z" />
              <polyline points="13 2 13 8 19 8" />
            </svg>
          </div>
          <h2 className="text-[15px] font-semibold text-gray-900">
            Company feed
          </h2>
        </div>
        <span className="text-[12px] text-gray-400">
          {NEWS_DATA.length} updates
        </span>
      </div>
      {/* ── News items ─────────────────────────────────────── */}
      <div className="divide-y divide-gray-50">
        {NEWS_DATA.map((item) => {
          const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.general;

          return (
            <div
              key={item.id}
              className="flex gap-3 px-5 py-4 hover:bg-gray-50/70 transition-colors duration-150 cursor-pointer group"
            >
              {/* Icon box */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.wrapperBg} ${config.iconColor}`}
              >
                {config.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Title + badge row */}
                <div className="flex items-start gap-2 flex-wrap mb-1">
                  <span className="text-[14px] font-semibold text-gray-900 leading-snug group-hover:text-[#6B21D4] transition-colors duration-200">
                    {item.title}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 self-center ${config.badgeBg} ${config.badgeText}`}
                  >
                    {config.label}
                  </span>
                </div>

                {/* Description */}
                <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2 mb-1.5">
                  {item.description}
                </p>

                {/* Meta row */}
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 flex-wrap">
                  {item.date && (
                    <>
                      <CalendarIcon />
                      <span>{item.date}</span>
                      <span className="text-gray-200">·</span>
                    </>
                  )}
                  <span>{item.createdAt}</span>
                  <span className="text-gray-200">·</span>
                  <span>{item.author}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* ── Footer ─────────────────────────────────────────── */}
      <div className="px-5 py-3 border-t border-gray-50 text-center"></div>
    </div>
  );
}
