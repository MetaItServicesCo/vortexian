"use client";

import { FiSend, FiUsers, FiGrid, FiClock, FiFileText } from "react-icons/fi";

const TABS = [
  { id: "compose", label: "Compose", icon: FiSend },
  { id: "subscribers", label: "Subscribers", icon: FiUsers },
  { id: "templates", label: "Templates", icon: FiGrid },
  { id: "history", label: "History", icon: FiClock },
  { id: "signup", label: "Signup Form", icon: FiFileText },
];

export default function NewsletterTabs({ activeTab, setActiveTab }) {
  return (
    <div className="flex flex-wrap bg-gray-100 rounded-xl p-1 mb-6 gap-1 overflow-x-auto">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
              active
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon size={14} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
