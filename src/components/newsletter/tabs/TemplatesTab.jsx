"use client";

import {
  FiFileText,
  FiTrendingUp,
  FiVolume2,
  FiRadio,
  FiArrowUpRight,
} from "react-icons/fi";
import useNewsletterStore from "@/store/newsletterStore";

const ICONS = {
  editorial: FiFileText,
  insightful: FiTrendingUp,
  official: FiRadio,
  promotional: FiVolume2,
};

const BADGE_STYLES = {
  Editorial: "bg-blue-50 text-blue-600",
  Insightful: "bg-purple-50 text-purple-600",
  Official: "bg-gray-100 text-gray-700",
  Promotional: "bg-amber-50 text-amber-700",
};

export default function TemplatesTab() {
  const templates = useNewsletterStore((s) => s.templates);
  const templatesLoading = useNewsletterStore((s) => s.templatesLoading);
  const loadTemplateIntoCompose = useNewsletterStore(
    (s) => s.loadTemplateIntoCompose,
  );

  if (templatesLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-xl p-5 h-40 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {templates.map((tpl) => {
        const Icon = ICONS[tpl.category?.toLowerCase()] || FiFileText;
        return (
          <div
            key={tpl.id}
            className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                <Icon className="text-gray-600" size={16} />
              </div>
              <p className="font-semibold text-gray-900 mt-3">{tpl.name}</p>
              <p className="text-sm text-gray-500 mt-1">{tpl.description}</p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  BADGE_STYLES[tpl.category] || "bg-gray-100 text-gray-600"
                }`}
              >
                {tpl.category}
              </span>
              <button
                type="button"
                onClick={() => loadTemplateIntoCompose(tpl)}
                className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:underline"
              >
                Use <FiArrowUpRight size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
