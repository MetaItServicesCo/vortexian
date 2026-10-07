"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useContent } from "@/components/content/SiteContentProvider";

const CtaBanner = () => {
  const cta = useContent("home.cta");
  if (!cta.visible) return null;

  return (
    <section className="py-12 px-6 md:px-20 lg:px-32 bg-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-7xl mx-auto relative rounded-[30px] overflow-hidden shadow-xl bg-gradient-to-r from-[#5DB4D1] via-[#3B82F6] to-[#1D1D7E] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8"
      >
        {/* --- LEFT TEXT CONTENT --- */}
        <div className="text-white space-y-2 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            {cta.heading}
          </h2>
          <p className="text-lg md:text-xl font-medium opacity-90">
            {cta.text}
          </p>
        </div>

        {/* --- RIGHT BUTTON CONTENT --- */}
        <div className="shrink-0">
          {cta.button_label && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href={cta.button_link || "/contact"}
                className="inline-block bg-[#111133] hover:bg-black text-white px-10 py-4 font-bold text-sm uppercase tracking-widest transition-colors duration-300 shadow-lg rounded-sm"
              >
                {cta.button_label}
              </Link>
            </motion.div>
          )}
        </div>

        {/* Subtle Decorative Light Effect (Optional) */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] -z-10 rounded-full"></div>
      </motion.div>
    </section>
  );
};

export default CtaBanner;
