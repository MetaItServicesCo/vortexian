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
        {/* --- HEADER CONTENT --- */}
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
            career in the forefront of technology innovation. We&apos;re looking
            for passionate individuals who thrive in a collaborative environment
            and are eager to make an impact. Explore our current openings and
            start your journey with us today. Visit our careers page to learn
            more about opportunities that match your skills and aspirations.
          </p>
        </motion.div>

        {/* --- FORM SECTION --- */}
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
            <motion.div
              initial={{ opacity: 0, x: -80 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className={labelStyles}>Company Name</label>
              <input type="text" className={inputStyles} />
            </motion.div>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -80 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label className={labelStyles}>
                  First Name <span className="text-red-500">*</span>
                </label>
                <input type="text" className={inputStyles} required />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 80 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <label className={labelStyles}>
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input type="text" className={inputStyles} required />
              </motion.div>
            </div>

            {/* Email Address */}
            <motion.div
              initial={{ opacity: 0, x: -80 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
            >
              <label className={labelStyles}>Email address</label>
              <input type="email" className={inputStyles} />
            </motion.div>

            {/* Linkedin URL */}
            <motion.div
              initial={{ opacity: 0, x: -80 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 }}
            >
              <label className={labelStyles}>
                Linkedin URL <span className="text-red-500">*</span>
              </label>
              <input type="url" className={inputStyles} required />
            </motion.div>

            {/* Optional Checkbox */}
            <motion.div
              initial={{ opacity: 0, x: -80 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="flex items-center gap-3 pt-4"
            >
              <input
                type="checkbox"
                id="agree"
                className="w-4 h-4 accent-[#5DB4D1] cursor-pointer"
              />
              <label
                htmlFor="agree"
                className="text-[#5DB4D1] text-[14px] cursor-pointer"
              >
                Agree to show contact information in public posting (optional)
              </label>
            </motion.div>

            {/* Submit Button (Next) */}
            <div className="flex justify-end pt-10">
              <motion.button
                whileHover={{ backgroundColor: "#1D1D7E" }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#666666] text-white px-12 py-3 font-bold uppercase tracking-widest text-sm transition-colors duration-300"
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
