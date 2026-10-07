"use client";
import React from "react";
import { motion } from "framer-motion";
import { useContent } from "@/components/content/SiteContentProvider";
import { mediaUrl } from "@/lib/api";
import RichText from "@/components/content/RichText";

const AboutSection = () => {
  const about = useContent("home.about");
  if (!about.visible) return null;

  return (
    <section className="bg-white py-20 px-6 md:px-20 lg:px-32 relative overflow-hidden font-sans">
      {/* Background Subtle Pattern */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/p6-mini.png')]"></div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row  gap-16 relative z-10">
        {/* --- LEFT CONTENT SIDE --- */}
        <motion.div
          initial={{ opacity: 0, x: -150 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="flex-1 space-y-6"
        >
          {/* Small Top Line */}
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 40 }}
            viewport={{ once: false }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="h-[2px] bg-[#5DB4D1]"
          ></motion.div>

          <h2 className="text-4xl md:text-5xl font-extrabold text-[#111] tracking-tight">
            {about.heading}
          </h2>

          <RichText
            html={about.body_html}
            className="text-gray-700 leading-relaxed text-[15px] md:text-[16px] [&_strong]:text-gray-900"
          />
        </motion.div>

        {/* --- RIGHT IMAGE SIDE (FIXED SCALING SYSTEM) --- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 150 }}
          whileInView={{ opacity: 1, scale: 1, x: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="flex-1 w-full"
        >
        
          <div className="relative w-full h-[350px] md:h-[450px] lg:h-[450px] rounded-[40px] overflow-hidden shadow-2xl border-white border-[10px] bg-slate-50">
            {about.image && (
              // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded image
              <img
                src={mediaUrl(about.image)}
                alt={about.image_alt || about.heading}
                className="w-full h-full object-cover transform hover:scale-103 transition-transform duration-700 object-center"
              />
            )}
          </div>

          {/* Floating Decorative Glow Elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#5DB4D1]/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#1D1D7E]/10 rounded-full blur-3xl -z-10"></div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
