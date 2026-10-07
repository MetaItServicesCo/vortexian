"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useContent } from "@/components/content/SiteContentProvider";
import RichText from "@/components/content/RichText";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

const CareerForm = () => {
  const inputStyles =
    "w-full bg-[#F3F4F6] border-none p-4 rounded-sm outline-none focus:ring-2 focus:ring-[#5DB4D1] transition-all duration-300";
  const labelStyles = "block text-[#5DB4D1] text-[14px] font-medium mb-2";

  const intro = useContent("career.intro");
  const [companyName, setCompanyName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [cv, setCv] = useState(null);
  const [agree, setAgree] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!cv) {
      setError("CV/Resume required.");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("linkedin_url", linkedinUrl);
      formData.append("company_name", companyName);
      formData.append("email", email);
      formData.append("show_contact_public", agree);
      formData.append("cv", cv);

      const res = await fetch(`${API_BASE_URL}/api/career/`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Error ${res.status}`);
      }

      setSuccess(true);
      setCompanyName("");
      setFirstName("");
      setLastName("");
      setEmail("");
      setLinkedinUrl("");
      setCv(null);
      setAgree(false);
      e.target.reset();
    } catch (err) {
      setError(
        err.message || "Your Application is not submitted try again later",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white py-20 px-6 md:px-20 lg:px-32 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          className="mb-12 space-y-4"
        >
          <h2 className="text-[#1D1D7E] text-2xl md:text-3xl font-bold tracking-tight">
            {intro.heading}
          </h2>

          <RichText html={intro.text_html} className="text-gray-800 text-[15px] leading-relaxed max-w-6xl" />
        </motion.div>

        {/* FORM */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
          className="space-y-10"
        >
          <h3 className="text-black text-3xl font-bold">
            Personal informations
          </h3>

          {/* Success Message */}
          {success && (
            <div className="p-4 bg-green-100 text-green-700 rounded-sm">
              Your Application is submitted successfully, shortly we&apos;ll reach
              you!
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-100 text-red-600 rounded-sm">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Company Name */}
            <motion.div>
              <label className={labelStyles}>Company Name</label>
              <input
                type="text"
                className={inputStyles}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </motion.div>

            {/* First & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div>
                <label className={labelStyles}>
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={inputStyles}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </motion.div>

              <motion.div>
                <label className={labelStyles}>
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={inputStyles}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </motion.div>
            </div>

            {/* Email */}
            <motion.div>
              <label className={labelStyles}>Email address</label>
              <input
                type="email"
                className={inputStyles}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </motion.div>

            {/* LinkedIn */}
            <motion.div>
              <label className={labelStyles}>
                Linkedin URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                className={inputStyles}
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                required
              />
            </motion.div>

            {/* CV / FILE UPLOAD */}
            <motion.div>
              <label className={labelStyles}>
                Upload CV / Resume <span className="text-red-500">*</span>
              </label>

              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="w-full bg-[#F3F4F6] p-3 rounded-sm outline-none file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-[#5DB4D1] file:text-white file:font-semibold hover:file:bg-[#1D1D7E] transition-all duration-300"
                onChange={(e) => setCv(e.target.files[0])}
                // required
              />
            </motion.div>

            {/* Checkbox */}
            <motion.div className="flex items-center gap-3 pt-4">
              <input
                type="checkbox"
                id="agree"
                className="w-4 h-4 accent-[#5DB4D1]"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <label htmlFor="agree" className="text-[#5DB4D1] text-[14px]">
                Agree to show contact information in public posting (optional)
              </label>
            </motion.div>

            {/* Submit */}
            <div className="flex justify-end pt-10">
              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={{ backgroundColor: "#1D1D7E" }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#666666] text-white px-12 py-3 font-bold uppercase tracking-widest text-sm disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default CareerForm;
