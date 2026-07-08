"use client";

import { useState, useMemo, useEffect } from "react";
import { FiSend, FiX } from "react-icons/fi";
import useNewsletterStore from "@/store/newsletterStore";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

// Next.js (Turbopack) ke liye Dynamic import
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function ComposeTab() {
  const composeForm = useNewsletterStore((s) => s.composeForm);
  const setComposeField = useNewsletterStore((s) => s.setComposeField);
  const sendNewsletterNow = useNewsletterStore((s) => s.sendNewsletterNow);
  const sendTest = useNewsletterStore((s) => s.sendTest);
  const sending = useNewsletterStore((s) => s.sending);
  const sendingTest = useNewsletterStore((s) => s.sendingTest);
  const selectedSubscribers = useNewsletterStore((s) => s.selectedSubscribers);
  const subscribers = useNewsletterStore((s) => s.subscribers);

  const [toast, setToast] = useState(null);

  // Quill Modules (Formats handle karne ke liye alag se array ki zaroorat nahi)
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline", "link"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["image"],
      ],
    }),
    [],
  );

  const recipientsCount =
    composeForm.audience === "all"
      ? subscribers.length
      : selectedSubscribers.length;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSendNow = async () => {
    if (!composeForm.subject.trim() || !composeForm.content.trim()) {
      showToast("Subject and content are both required.", "error");
      return;
    }
    const ok = await sendNewsletterNow();
    showToast(
      ok
        ? "Newsletter sent successfully!"
        : "Failed to send, please try again.",
      ok ? "success" : "error",
    );
  };

  const handleSendTest = async () => {
    if (!composeForm.subject.trim() || !composeForm.content.trim()) {
      showToast("Subject and content are both required.", "error");
      return;
    }
    const ok = await sendTest();
    showToast(
      ok ? "Test email sent!" : "Failed to send test email.",
      ok ? "success" : "error",
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 relative">
      {toast && (
        <div
          className={`absolute top-4 right-4 text-xs px-3 py-2 rounded-lg shadow-md z-50 ${toast.type === "success" ? "bg-gray-900 text-white" : "bg-red-600 text-white"}`}
        >
          {toast.message}
        </div>
      )}

      <h3 className="font-semibold text-gray-900">Send Newsletter</h3>

      <div className="mt-5">
        <label className="text-sm font-medium text-gray-700">
          Subject Line
        </label>
        <input
          type="text"
          value={composeForm.subject}
          onChange={(e) => setComposeField("subject", e.target.value)}
          placeholder="e.g. New Blog: 7 Retention Strategies That Work"
          className="mt-1.5 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          required
        />
      </div>

      <div className="mt-4">
        <label className="text-sm font-medium text-gray-700">
          Email Content
        </label>
        <div className="mt-1.5 h-64 mb-12">
          <ReactQuill
            theme="snow"
            value={composeForm.content}
            onChange={(val) => setComposeField("content", val)}
            modules={modules}
            className="h-full"
            placeholder="Write your message here... You can add images and links."
          />
        </div>
      </div>

      {/* Audience Section */}
      <div className="mt-5">
        <label className="text-sm font-medium text-gray-700">Audience</label>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setComposeField("audience", "all")}
            className={`text-left border rounded-lg px-4 py-3 transition-colors ${composeForm.audience === "all" ? "border-gray-900" : "border-gray-200"}`}
          >
            <span className="text-sm font-medium text-gray-900">
              All Subscribers
            </span>
            <p className="text-xs text-gray-500 mt-1">
              Send to all {subscribers.length} people
            </p>
          </button>
          <button
            type="button"
            onClick={() => setComposeField("audience", "selected")}
            className={`text-left border rounded-lg px-4 py-3 transition-colors ${composeForm.audience === "selected" ? "border-gray-900" : "border-gray-200"}`}
          >
            <span className="text-sm font-medium text-gray-900">
              Selected Subscribers
            </span>
            <p className="text-xs text-gray-500 mt-1">
              {selectedSubscribers.length} selected
            </p>
          </button>
        </div>
      </div>

      {/* Schedule Section */}
      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">
            Schedule for later
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setComposeField("scheduleEnabled", !composeForm.scheduleEnabled)
          }
          className={`w-10 h-5 rounded-full relative transition-colors ${composeForm.scheduleEnabled ? "bg-gray-900" : "bg-gray-200"}`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${composeForm.scheduleEnabled ? "translate-x-5" : "translate-x-0.5"}`}
          />
        </button>
      </div>

      {composeForm.scheduleEnabled && (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="datetime-local"
            value={composeForm.scheduleDate}
            onChange={(e) => setComposeField("scheduleDate", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-grow"
          />
          <button
            onClick={() => setComposeField("scheduleEnabled", false)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
          >
            <FiX size={20} />
          </button>
        </div>
      )}

      {/* Footer Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          Recipients:{" "}
          <span className="font-medium text-gray-900">{recipientsCount}</span>
        </p>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleSendTest}
            disabled={sendingTest}
            className="border border-gray-300 p-2 rounded-lg text-sm hover:bg-gray-50"
          >
            Send Test
          </button>
          <button
            type="button"
            onClick={handleSendNow}
            disabled={sending}
            className="bg-gray-900 text-white p-2 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-gray-800"
          >
            <FiSend size={14} />{" "}
            {sending
              ? "Sending..."
              : composeForm.scheduleEnabled
                ? "Schedule"
                : "Send Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
