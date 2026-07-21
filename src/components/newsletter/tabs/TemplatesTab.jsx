"use client";

import { useEffect, useState } from "react";
import {
  FiFileText,
  FiTrendingUp,
  FiVolume2,
  FiRadio,
  FiArrowUpRight,
  FiPlus,
  FiX,
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

const CATEGORIES = ["Editorial", "Insightful", "Official", "Promotional"];

const EMPTY_DRAFT = { title: "", subject: "", category: "Editorial", body: "" };

const INPUT =
  "mt-1.5 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10";

export default function TemplatesTab() {
  const templates = useNewsletterStore((s) => s.templates);
  const templatesLoading = useNewsletterStore((s) => s.templatesLoading);
  const templatesLoaded = useNewsletterStore((s) => s.templatesLoaded);
  const fetchTemplates = useNewsletterStore((s) => s.fetchTemplates);
  const addTemplate = useNewsletterStore((s) => s.addTemplate);
  const savingTemplate = useNewsletterStore((s) => s.savingTemplate);
  const templateError = useNewsletterStore((s) => s.templateError);
  const clearTemplateError = useNewsletterStore((s) => s.clearTemplateError);
  const loadTemplateIntoCompose = useNewsletterStore(
    (s) => s.loadTemplateIntoCompose,
  );
  const composeForm = useNewsletterStore((s) => s.composeForm);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [toast, setToast] = useState(null);

  // Load once, so the tab works even if the parent page never fetched.
  useEffect(() => {
    if (!templatesLoaded) fetchTemplates();
  }, [templatesLoaded, fetchTemplates]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !savingTemplate) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, savingTemplate]);

  const list = Array.isArray(templates) ? templates : [];
  const setField = (field, value) =>
    setDraft((d) => ({ ...d, [field]: value }));

  const isValid =
    draft.title.trim() && draft.subject.trim() && draft.body.trim();

  const hasComposeDraft = Boolean(composeForm.subject || composeForm.content);

  const openModal = () => {
    clearTemplateError();
    setDraft(EMPTY_DRAFT);
    setOpen(true);
  };

  const closeModal = () => {
    if (savingTemplate) return;
    setOpen(false);
  };

  const fillFromCompose = () =>
    setDraft((d) => ({
      ...d,
      subject: composeForm.subject || d.subject,
      body: composeForm.content || d.body,
    }));

  const handleSave = async () => {
    if (!isValid || savingTemplate) return;

    const ok = await addTemplate({
      title: draft.title.trim(),
      subject: draft.subject.trim(),
      body: draft.body,
      category: draft.category,
    });

    if (ok) {
      setOpen(false);
      setDraft(EMPTY_DRAFT);
      setToast("Template saved");
      setTimeout(() => setToast(null), 2500);
    }
  };

  const renderContent = () => {
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

    if (list.length === 0) {
      return (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mx-auto">
            <FiFileText className="text-gray-500" size={18} />
          </div>
          <p className="font-semibold text-gray-900 mt-3">No templates yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Write a subject and body once, then reuse them on every send.
          </p>
          <button
            type="button"
            onClick={openModal}
            className="mt-4 inline-flex items-center gap-1.5 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            <FiPlus size={15} /> Create your first template
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {list.map((tpl) => {
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
                <p className="font-semibold text-gray-900 mt-3">{tpl.title}</p>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {tpl.subject}
                </p>
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
  };

  return (
    <div>
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 text-xs px-3 py-2 rounded-lg shadow-lg bg-gray-900 text-white">
          {toast}
        </div>
      )}

      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Templates</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Reusable starting points for a newsletter.
          </p>
        </div>
        <button
          type="button"
          onClick={openModal}
          className="flex items-center gap-1.5 bg-gray-900 text-white text-sm font-medium px-3.5 py-2 rounded-lg hover:bg-gray-800 whitespace-nowrap shrink-0"
        >
          <FiPlus size={15} /> New template
        </button>
      </div>

      {!open && templateError && list.length > 0 && (
        <p className="mb-3 text-sm text-red-600">{templateError}</p>
      )}

      {renderContent()}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <button
            type="button"
            aria-label="Close"
            onClick={closeModal}
            className="absolute inset-0 bg-gray-900/40"
          />

          <div className="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white border border-gray-200 rounded-t-2xl sm:rounded-2xl shadow-xl">
            <div className="flex items-start justify-between gap-4 p-5 sm:p-6 pb-0">
              <div>
                <h3 className="font-semibold text-gray-900">New template</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Use <code className="text-gray-700">{"{{name}}"}</code> in the
                  body to greet each subscriber.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 p-1 -m-1 shrink-0"
                aria-label="Close"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="p-5 sm:p-6 pt-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="Monthly product update"
                  className={INPUT}
                />
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  value={draft.category}
                  onChange={(e) => setField("category", e.target.value)}
                  className={INPUT}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  {hasComposeDraft && (
                    <button
                      type="button"
                      onClick={fillFromCompose}
                      className="text-xs font-medium text-gray-900 hover:underline"
                    >
                      Fill from compose draft
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={draft.subject}
                  onChange={(e) => setField("subject", e.target.value)}
                  placeholder="What's new this month"
                  className={INPUT}
                />
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700">
                  Body
                </label>
                <textarea
                  rows={8}
                  value={draft.body}
                  onChange={(e) => setField("body", e.target.value)}
                  placeholder={
                    "Hi {{name}},\n\nHere's what shipped this month..."
                  }
                  className={`${INPUT} resize-y font-mono`}
                />
              </div>

              {templateError && (
                <p className="mt-4 text-sm text-red-600">{templateError}</p>
              )}
            </div>

            <div className="flex gap-2 p-5 sm:p-6 pt-0">
              <button
                type="button"
                onClick={closeModal}
                disabled={savingTemplate}
                className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!isValid || savingTemplate}
                className="flex-1 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {savingTemplate ? "Saving..." : "Save template"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
