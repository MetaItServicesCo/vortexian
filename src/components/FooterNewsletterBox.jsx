"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { FiLoader } from "react-icons/fi";

const FooterNewsletterBox = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const resData = await response.json();

      if (response.ok) {
        toast.success(resData.message || "Subscription activated!");
        setEmail(""); // Clear text field parameters hook input values
      } else {
        // Handle explicit 409 duplicated conflict statuses or wrong format inputs warnings
        toast.error(resData.message || "Failed activating entry logs.");
      }
    } catch (err) {
      toast.error("Network interface communication failure exception.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Universal Toaster instance injected to display clean toast alerts above footer grids layering layout */}
      <Toaster position="bottom-right" />

      <h3 className="text-xl font-bold border-l-4 border-[#5DB4D1] pl-3">
        Newsletter
      </h3>
      <p className="text-gray-400">
        Subscribe our newsletter to get our latest update & news
      </p>

      {/* CONNECTED ACTION PIPELINE */}
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
          className="w-full bg-[#6C757D] hover:bg-[#5DB4D1] hover:text-black text-white font-bold py-4 transition-colors duration-300 uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {submitting ? (
            <>
              <FiLoader className="animate-spin text-sm" /> Processing Node...
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
