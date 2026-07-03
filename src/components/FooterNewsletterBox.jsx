"use client";
import React, { useState } from "react";
import { FiLoader } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

const FooterNewsletterBox = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        "/api/newsletter/subscribe",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Successfully subscribed!");
        setEmail("");
      } else {
        // backend error (like already subscribed)
        toast.error(data.detail || data.message || "Subscription failed");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="bottom-right" />

      <h3 className="text-xl font-bold border-l-4 border-[#5DB4D1] pl-3">
        Newsletter
      </h3>

      <p className="text-gray-400">
        Subscribe our newsletter to get our latest update & news
      </p>

      <form onSubmit={handleSubscribe} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-4 py-4 bg-white text-black outline-none focus:ring-2 focus:ring-[#5DB4D1]"
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#6C757D] hover:bg-[#5DB4D1] hover:text-black text-white font-bold py-4 uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <FiLoader className="animate-spin text-sm" />
              Processing...
            </>
          ) : (
            "Send"
          )}
        </button>
      </form>
    </div>
  );
};

export default FooterNewsletterBox;
