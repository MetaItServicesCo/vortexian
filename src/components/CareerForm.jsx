"use client";
import React from "react";
import { motion } from "framer-motion";

const CareerForm = () => {
  const inputStyles =
    "w-full bg-[#F3F4F6] border-none p-4 rounded-sm outline-none focus:ring-2 focus:ring-[#5DB4D1] transition-all duration-300";
  const labelStyles = "block text-[#5DB4D1] text-[14px] font-medium mb-2";

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
            Explore Exciting Career Opportunities at Vortexian Tech
          </h2>

          <p className="text-gray-800 text-[15px] leading-relaxed max-w-6xl">
            Join the dynamic team at Vortexian Tech and embark on a rewarding
            career in the forefront of technology innovation.
          </p>
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

          <form className="space-y-6">
            {/* Company Name */}
            <motion.div>
              <label className={labelStyles}>Company Name</label>
              <input type="text" className={inputStyles} />
            </motion.div>

            {/* First & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div>
                <label className={labelStyles}>
                  First Name <span className="text-red-500">*</span>
                </label>
                <input type="text" className={inputStyles} required />
              </motion.div>

              <motion.div>
                <label className={labelStyles}>
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input type="text" className={inputStyles} required />
              </motion.div>
            </div>

            {/* Email */}
            <motion.div>
              <label className={labelStyles}>Email address</label>
              <input type="email" className={inputStyles} />
            </motion.div>

            {/* LinkedIn */}
            <motion.div>
              <label className={labelStyles}>
                Linkedin URL <span className="text-red-500">*</span>
              </label>
              <input type="url" className={inputStyles} required />
            </motion.div>

            {/* ✅ CV / FILE UPLOAD (NEW FIELD) */}
            <motion.div>
              <label className={labelStyles}>
                Upload CV / Resume <span className="text-red-500">*</span>
              </label>

              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="w-full bg-[#F3F4F6] p-3 rounded-sm outline-none file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-[#5DB4D1] file:text-white file:font-semibold hover:file:bg-[#1D1D7E] transition-all duration-300"
                required
              />
            </motion.div>

            {/* Checkbox */}
            <motion.div className="flex items-center gap-3 pt-4">
              <input
                type="checkbox"
                id="agree"
                className="w-4 h-4 accent-[#5DB4D1]"
              />
              <label htmlFor="agree" className="text-[#5DB4D1] text-[14px]">
                Agree to show contact information in public posting (optional)
              </label>
            </motion.div>

            {/* Submit */}
            <div className="flex justify-end pt-10">
              <motion.button
                whileHover={{ backgroundColor: "#1D1D7E" }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#666666] text-white px-12 py-3 font-bold uppercase tracking-widest text-sm"
              >
                Next
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default CareerForm;
