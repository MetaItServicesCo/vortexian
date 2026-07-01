"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPhoneCall, FiMail, FiChevronDown, FiLoader } from "react-icons/fi";
import { IoCloseOutline } from "react-icons/io5";
import toast, { Toaster } from "react-hot-toast";

const QuoteForm = () => {
  // Input tracking states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [contactPref, setContactPref] = useState("Email");
  const [url, setUrl] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [message, setMessage] = useState("");
  const [projectFile, setProjectFile] = useState(null);

  // Services Dropdown States
  const [selectedServices, setSelectedServices] = useState([
    "SEO & Website Optimization",
    "Content Creation & Copywriting",
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const availableServices = [
    "Digital Marketing",
    "Web Development",
    "App Development",
    "UI/UX Design",
    "Cloud Solutions",
    "Lead Generation",
  ];

  const toggleService = (service) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter((s) => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  // --- API TRANSMISSION HANDLER ---
  // --- API TRANSMISSION HANDLER ---
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (
      !firstName ||
      !lastName ||
      !phone ||
      !email ||
      !completionDate ||
      !message
    ) {
      toast.error("Please fill in all mandatory fields marked with (*)");
      return;
    }

    if (selectedServices.length === 0) {
      toast.error("Please request at least one service.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("phone", phone);
      formData.append("email", email);
      formData.append("preferred_contact_method", contactPref);

      // Backend me service string hai
      formData.append("service", selectedServices.join(", "));

      formData.append("website_url", url || "");
      formData.append("completion_date", completionDate || "");
      formData.append("message", message);

      // File upload
      if (projectFile) {
        formData.append("file", projectFile);
      }

      const response = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Form Submission Response:", data);
      if (response.ok) {
        toast.success(data.message || "Contact request submitted successfully");

        // Reset Form
        setFirstName("");
        setLastName("");
        setPhone("");
        setEmail("");
        setContactPref("Email");
        setUrl("");
        setCompletionDate("");
        setMessage("");
        setProjectFile(null);
        setSelectedServices([]);
      } else {
        toast.error(data.detail || data.message || "Failed to submit form");
      }
    } catch (error) {
      console.error("Contact Form Error:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  const labelStyles =
    "block text-[#5DB4D1] text-[13px] font-bold uppercase tracking-wider mb-2";
  const inputStyles =
    "w-full bg-[#F5F5F5] border border-transparent p-3.5 rounded-md outline-none focus:ring-2 focus:ring-[#5DB4D1] focus:bg-white focus:border-transparent transition-all text-gray-700 text-base font-medium shadow-inner";

  return (
    <section className="bg-white py-20 px-6 md:px-20 lg:px-32 font-sans relative">
      <Toaster position="top-center" />
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-32">
        {/* --- LEFT SIDE: FULL FORM --- */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex-[2]"
        >
          <div className="mb-10">
            <h2 className="text-[#1D1D7E] text-4xl sm:text-5xl font-black mb-4 tracking-tight uppercase leading-none">
              Get a Quote
            </h2>
            <p className="text-gray-600 text-base font-medium leading-relaxed mt-4">
              Discover how Vortexian Tech can transform your business with our
              advanced IT solutions. Contact us now for a quote and elevate your
              technology strategy today.
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* 1. First & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelStyles}>
                  First Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  className={inputStyles}
                  placeholder="Enter first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className={labelStyles}>
                  Last Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  className={inputStyles}
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* 2. Phone Number */}
            <div>
              <label className={labelStyles}>
                Phone no. <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                className={inputStyles}
                placeholder="+92 ..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            {/* 3. Email */}
            <div>
              <label className={labelStyles}>
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                className={inputStyles}
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* 4. Method of Contact (Radio Buttons) */}
            <div className="space-y-3">
              <label className={labelStyles}>
                Preferred Method of Contact{" "}
                <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-wrap gap-6 items-center">
                {["Phone", "Email", "other"].map((item) => (
                  <label
                    key={item}
                    className="flex items-center gap-3 text-[#5DB4D1] text-sm font-bold uppercase tracking-wider cursor-pointer group w-fit"
                  >
                    <input
                      type="radio"
                      name="contact_pref"
                      value={item}
                      checked={contactPref === item}
                      onChange={(e) => setContactPref(e.target.value)}
                      className="w-4 h-4 accent-[#1D1D7E] scale-110 cursor-pointer"
                    />
                    <span className="group-hover:text-[#1D1D7E] transition-colors">
                      {item}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 5. Custom Multi-Select Services */}
            <div className="relative">
              <label className={labelStyles}>
                Services <span className="text-red-400">*</span>
              </label>
              <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full border border-gray-200 p-2.5 flex flex-wrap gap-2 items-center rounded-md cursor-pointer min-h-[54px] bg-white hover:border-[#5DB4D1] transition-all shadow-sm"
              >
                {selectedServices.map((service) => (
                  <div
                    key={service}
                    className="bg-[#1D1D7E] text-white text-[10px] px-3 py-1.5 flex items-center gap-2 rounded-full font-black uppercase tracking-widest shadow-sm hover:bg-red-950 transition-colors"
                  >
                    {service}
                    <IoCloseOutline
                      size={16}
                      className="cursor-pointer text-[#5DB4D1] hover:text-white transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleService(service);
                      }}
                    />
                  </div>
                ))}
                <div className="flex-grow flex justify-between items-center ml-2">
                  <span className="text-gray-400 text-sm font-semibold italic">
                    {selectedServices.length === 0
                      ? "Choose desired dynamic service channels"
                      : ""}
                  </span>
                  <FiChevronDown
                    className={`text-gray-400 text-lg transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  />
                </div>
              </div>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-30 w-full mt-1.5 bg-white border border-gray-100 shadow-2xl rounded-xl max-h-52 overflow-y-auto divide-y divide-gray-50 border-t-4 border-t-[#1D1D7E]"
                  >
                    {availableServices.map((service) => (
                      <div
                        key={service}
                        onClick={() => toggleService(service)}
                        className={`p-3.5 text-sm font-semibold cursor-pointer transition-all ${selectedServices.includes(service) ? "bg-blue-50/70 text-[#1D1D7E] font-black pl-5" : "hover:bg-gray-50 text-gray-700"}`}
                      >
                        {service}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 6. URL */}
            <div>
              <label className={labelStyles}>Website URL</label>
              <input
                type="url"
                className={inputStyles}
                placeholder="https://yourwebsite.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            {/* 7. File Upload */}
            <div>
              <label className={labelStyles}>
                Upload Project File <span className="text-red-400">*</span>
              </label>
              <div className="mt-2 flex items-center gap-4">
                <label className="bg-[#666666] text-white px-8 py-3 text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-black transition-all rounded-md inline-block shadow-md">
                  Choose File
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setProjectFile(e.target.files[0])}
                  />
                </label>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate max-w-xs">
                  {projectFile
                    ? `Targeted: ${projectFile.name}`
                    : "No documentation asset selected"}
                </span>
              </div>
            </div>

            {/* 8. Completion Date */}
            <div>
              <label className={labelStyles}>
                Project Completion Date / Time{" "}
                <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                className={inputStyles}
                placeholder="e.g. June 2026"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                required
              />
            </div>

            {/* 9. Message */}
            <div>
              <label className={labelStyles}>
                Message <span className="text-red-400">*</span>
              </label>
              <textarea
                rows="6"
                className={`${inputStyles} resize-none`}
                placeholder="Tell us about your project requirement specifications..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              ></textarea>
            </div>

            {/* 10. Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ backgroundColor: "#1D1D7E", scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="bg-[#2185F2] text-white px-12 py-4 font-black rounded-xl transition-all shadow-xl shadow-blue-500/10 text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin text-base" /> Executing
                  Submission...
                </>
              ) : (
                "Submit Request Quote"
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* --- RIGHT SIDE: CONTACT DETAILS --- */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex-1 space-y-12 lg:pt-20"
        >
          <h2 className="text-[#1D1D7E] text-3xl font-black tracking-tight uppercase border-b-2 border-gray-100 pb-3">
            Contact Details
          </h2>
          <div className="space-y-12">
            <div className="flex flex-col gap-3 group">
              <div className="w-14 h-14 bg-gray-50 border border-gray-100 flex items-center justify-center rounded-2xl text-[#1D1D7E] group-hover:bg-[#1D1D7E] group-hover:text-white transition-all duration-500 shadow-sm group-hover:scale-105 group-hover:shadow-[0_10px_25px_rgba(29,29,126,0.15)]">
                <FiPhoneCall size={22} />
              </div>
              <h4 className="text-slate-400 text-xs font-black uppercase tracking-widest mt-2">
                Phone Operations
              </h4>
              <p className="text-[#1D1D7E] font-black text-xl hover:text-[#5DB4D1] transition-colors cursor-pointer">
                +92 335 4018789
              </p>
            </div>

            <div className="flex flex-col gap-3 group">
              <div className="w-14 h-14 bg-gray-50 border border-gray-100 flex items-center justify-center rounded-2xl text-[#1D1D7E] group-hover:bg-[#1D1D7E] group-hover:text-white transition-all duration-500 shadow-sm group-hover:scale-105 group-hover:shadow-[0_10px_25px_rgba(29,29,126,0.15)]">
                <FiMail size={22} />
              </div>
              <h4 className="text-slate-400 text-xs font-black uppercase tracking-widest mt-2">
                Enterprise Mailbox
              </h4>
              <p className="text-[#1D1D7E] font-black text-xl hover:text-[#5DB4D1] transition-colors cursor-pointer">
                info@vortexiantech.com
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default QuoteForm;
