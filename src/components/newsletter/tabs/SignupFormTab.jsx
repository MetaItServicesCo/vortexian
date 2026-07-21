"use client";

import { useState } from "react";
import { FiCheckCircle } from "react-icons/fi";
import useNewsletterStore from "@/store/newsletterStore";

export default function SignupFormTab() {
  const signupForm = useNewsletterStore((s) => s.signupForm);
  const setSignupField = useNewsletterStore((s) => s.setSignupField);
  const setSignupBullets = useNewsletterStore((s) => s.setSignupBullets);
  const saveSignupForm = useNewsletterStore((s) => s.saveSignupForm);
  const savingSignupForm = useNewsletterStore((s) => s.savingSignupForm);

  const [toast, setToast] = useState(null);

  const handleSave = async () => {
    const ok = await saveSignupForm();
    setToast(ok ? "Saved!" : "Save failed.");
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6">
        <h3 className="font-semibold text-gray-900">Signup Form Preview</h3>
        <p className="text-sm text-gray-500 mt-0.5">
          Embed this on your website.
        </p>

        <div className="mt-4 border border-gray-200 rounded-xl p-5">
          <p className="font-semibold text-gray-900">
            {signupForm.heading || "Stay Updated"}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {signupForm.intro || "Subscribe to receive:"}
          </p>

          <ul className="mt-3 space-y-2">
            {(signupForm.bullets || []).map((bullet, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <FiCheckCircle className="text-gray-400 shrink-0" size={15} />
                {bullet}
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="you@company.com"
              disabled
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50"
            />
            <button
              type="button"
              disabled
              className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg whitespace-nowrap"
            >
              {signupForm.button_text || "Subscribe"}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 relative">
        {toast && (
          <div className="absolute top-4 right-4 text-xs px-3 py-2 rounded-lg shadow-md bg-gray-900 text-white">
            {toast}
          </div>
        )}

        <h3 className="font-semibold text-gray-900">Copy</h3>
        <p className="text-sm text-gray-500 mt-0.5">
          Edit the text used in the signup box.
        </p>

        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700">Heading</label>
          <input
            type="text"
            value={signupForm.heading || ""}
            onChange={(e) => setSignupField("heading", e.target.value)}
            className="mt-1.5 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700">
            Intro line
          </label>
          <input
            type="text"
            value={signupForm.intro || ""}
            onChange={(e) => setSignupField("intro", e.target.value)}
            className="mt-1.5 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700">
            Bullets (one per line)
          </label>
          <textarea
            rows={5}
            value={(signupForm.bullets || []).join("\n")}
            onChange={(e) => setSignupBullets(e.target.value)}
            className="mt-1.5 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700">
            Button text
          </label>
          <input
            type="text"
            value={signupForm.button_text || ""}
            onChange={(e) => setSignupField("button_text", e.target.value)}
            placeholder="Subscribe"
            className="mt-1.5 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={savingSignupForm}
          className="mt-5 w-full bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
        >
          {savingSignupForm ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
