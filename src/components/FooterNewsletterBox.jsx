"use client";
import React, { useState } from "react";
import { FiLoader } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

const FooterNewsletterBox = () => {
  const [formData, setFormData] = useState({
    email: "",
    companyName: "",
    designation: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Successfully subscribed!");
        setFormData({ email: "", companyName: "", designation: "" }); // Reset form
      } else {
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
          name="email"
          required
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Email Address"
          className="w-full px-4 py-2 bg-white text-black outline-none focus:ring-3 focus:ring-[#5DB4D1]"
        />
        
        <input
          type="text"
          name="companyName"
          value={formData.companyName}
          onChange={handleInputChange}
          placeholder="Company Name"
          className="w-full px-4 py-2 bg-white text-black outline-none focus:ring-3 focus:ring-[#5DB4D1]"
        />

        <input
          type="text"
          name="designation"
          value={formData.designation}
          onChange={handleInputChange}
          placeholder="who are you? (e.g. CEO, Founder, etc.)"
          className="w-full px-4 py-2 bg-white text-black outline-none focus:ring-3 focus:ring-[#5DB4D1]"
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#6C757D] hover:bg-[#5DB4D1] hover:text-black text-white font-bold py-2 uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
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