"use client";
import React from "react";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react"; // Alternative icon if 3D image is not available

const WhoWeAre = () => {
  return (
    <section className="bg-white py-20 px-6 md:px-20 lg:px-32 font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
        {/* --- LEFT SIDE: CONTENT --- */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex-[1.2] space-y-6"
        >
          <h2 className="text-[#1D1D7E] text-3xl md:text-[38px] font-bold tracking-tight">
            Who We Are?
          </h2>

          <p className="text-gray-800 text-[15px] md:text-[16px] leading-[1.8] font-medium text-justify">
            Welcome to <span className="font-bold">Vortexian Tech</span>, where
            our commitment to driving businesses towards unparalleled success is
            unwavering. We understand that in today’s rapidly evolving
            landscape, businesses require multifaceted support to thrive. That’s
            why we offer a comprehensive suite of services spanning staffing,
            payroll management, creativity, marketing, technology solutions,
            consultancy, and lead generation. Each of these capabilities is
            meticulously designed to address the diverse needs of our clients,
            empowering them to navigate challenges with confidence and seize
            opportunities with clarity.
          </p>
        </motion.div>

        {/* --- RIGHT SIDE: 3D ICON / IMAGE --- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 1,
            type: "spring",
            stiffness: 100,
          }}
          className="flex-1 flex justify-center items-center"
        >
          <div className="relative group">
            {/* 3D Question Mark Image Placeholder */}
            {/* Aap yahan apni actual 3D image use kar sakte hain */}
            <motion.div
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="drop-shadow-[0_35px_35px_rgba(29,29,126,0.15)]"
            >
              {/* Using a stylized icon as a placeholder for the 3D mark */}
              <div className="text-[#5DB4D1] text-[200px] md:text-[300px]">
                <HelpCircle size="1em" strokeWidth={1} />
              </div>
            </motion.div>

            {/* Subtle shadow glow below the icon */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-32 h-6 bg-black/5 blur-2xl rounded-full"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhoWeAre;
