"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { FiLoader } from "react-icons/fi";

const ContactSection = () => {
  const [loading, setLoading] = useState(false);

  const handleFormPost = async (e) => {
    e.preventDefault();
    setLoading(true);

    const inputs = e.target.elements;

    const payload = {
      full_name: inputs[0].value,
      company_name: inputs[1].value,
      website_url: inputs[2].value,
      email: inputs[3].value,
      phone_number: inputs[4].value,
      designation: inputs[5].value,
      subject: inputs[6].value,
      message: inputs[7].value,
    };

    try {
      const response = await fetch(
        "/api/contact-us/contact-us",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Message sent successfully!");
        e.target.reset();
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white py-20 px-4 md:px-10 lg:px-20 font-sans overflow-hidden">
      <Toaster position="top-center" />

      <div className="max-w-[1300px] mx-auto flex flex-col lg:flex-row shadow-2xl rounded-sm overflow-hidden">
        {/* LEFT SIDE (SAME DESIGN) */}
        <motion.div
          initial={{ opacity: 0, x: -180 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.4 }}
          className="relative flex-1 bg-gradient-to-br from-[#5DB4D1] via-[#3B82F6] to-[#1D1D7E] p-8 md:p-20 text-white"
        >
          <div className="relative z-10">
            <div className="mb-10">
              <div className="flex flex-col gap-1 mb-4">
                <div className="w-8 h-[2.5px] bg-[#1D1D7E]"></div>
                <span className="text-[12px] font-bold uppercase tracking-widest">
                  Contact Us
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold">
                Drop us a Line.
              </h2>
            </div>

            {/* FORM (NO DESIGN CHANGE) */}
            <form
              onSubmit={handleFormPost}
              className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8"
            >
              <input
                type="text"
                placeholder="Full name"
                className="w-full bg-white p-4 text-gray-800 outline-none rounded-sm"
                required
              />

              <input
                type="text"
                placeholder="Company Name"
                className="w-full bg-white p-4 text-gray-800 outline-none rounded-sm"
                required
              />

              <input
                type="text"
                placeholder="Website URL"
                className="w-full bg-white p-4 text-gray-800 outline-none rounded-sm"
              />

              <input
                type="email"
                placeholder="Email address"
                className="w-full bg-white p-4 text-gray-800 outline-none rounded-sm"
                required
              />

              <input
                type="text"
                placeholder="Phone number"
                className="w-full bg-white p-4 text-gray-800 outline-none rounded-sm"
                required
              />

              <input
                type="text"
                placeholder="Designation"
                className="w-full bg-white p-4 text-gray-800 outline-none rounded-sm"
                required
              />

              <input
                type="text"
                placeholder="Subject"
                className="md:col-span-2 w-full bg-white p-4 text-gray-800 outline-none rounded-sm"
                required
              />

              <textarea
                placeholder="Write message"
                rows="4"
                className="md:col-span-2 w-full bg-white p-4 text-gray-800 outline-none rounded-sm resize-none"
                required
              />

              {/* BUTTON SAME STYLE */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#1D1D7E] text-white px-10 py-4 font-bold uppercase text-xs tracking-widest hover:bg-black transition-all w-fit flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <FiLoader className="animate-spin" /> Processing...
                  </>
                ) : (
                  "Send A Message"
                )}
              </motion.button>
            </form>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-16 bg-[#1D1D7E]/40 hidden lg:flex items-center justify-center">
            <p className="rotate-90 whitespace-nowrap text-[16px] font-bold tracking-[3px] text-white opacity-80">
              Office Hours: Monday- Friday 8:00 AM - 5:00 PM (CST)
            </p>
          </div>
        </motion.div>

        {/* RIGHT IMAGE (SAME) */}
        <motion.div
          initial={{ opacity: 0, x: 180 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.4 }}
          className="lg:w-1/4 hidden lg:block"
        >
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80"
            alt="Office Team"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
