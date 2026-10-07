"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useContent } from "@/components/content/SiteContentProvider";
import { mediaUrl } from "@/lib/api";

export default function BlogHero() {
  const hero = useContent("blog.hero");
  const badges = (hero.badges || []).map((b) => b.text).filter(Boolean);

  return (
    <section className="relative bg-[#f4f4f8] overflow-hidden min-h-[520px] flex items-center py-14 mt-4">
      {/* Decorative Background Circles */}
      <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-[#6B21D4]/5 pointer-events-none" />
      <div className="absolute bottom-0 right-[30%] w-40 h-40 rounded-full bg-[#22c55e]/5 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 lg:px-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: -90 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative inline-block mb-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#1a1a2e] leading-tight">
              {hero.heading}
            </h1>
            <svg
              className="absolute -bottom-2 left-0 w-full"
              viewBox="0 0 400 12"
              fill="none"
            >
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5 }}
                d="M2 8 C60 2, 150 10, 240 5 C310 1, 360 9, 398 5"
                stroke="#22c55e"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <p className="text-lg md:text-xl font-bold text-[#1a1a2e] mt-6 mb-8">
            {hero.subheading}
          </p>

          <div className="flex flex-wrap gap-4">
            {/* Hire Talent Button with Auto-Glow */}
            <motion.div
              className="relative overflow-hidden rounded-lg bg-[#6B21D4]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute inset-0 bg-white/20"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <Link
                href={hero.primary_link || "/contact"}
                className="relative flex items-center gap-2 text-white font-semibold px-7 py-3"
              >
                {hero.primary_label}
              </Link>
            </motion.div>

            {/* Find Job Button with Auto-Glow */}
            <motion.div
              className="relative overflow-hidden rounded-lg bg-[#22c55e]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute inset-0 bg-white/20"
                animate={{ x: ["-100%", "100%"] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 1,
                }}
              />
              <Link
                href={hero.secondary_link || "/career"}
                className="relative flex items-center gap-2 text-white font-semibold px-7 py-3"
              >
                {hero.secondary_label}
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* RIGHT VISUAL */}
        {/* RIGHT VISUAL */}
        <div className="relative flex items-center justify-center min-h-[400px]">
          {/* Rotating Purple Circle */}
          <motion.div
            // animate={{ rotate:  }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full bg-[#6B21D4] overflow-hidden flex items-center justify-center"
          >
            {/* CENTER IMAGE */}
           {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded image */}
           {hero.image && <img src={mediaUrl(hero.image)} alt="" className="w-full h-full object-cover opacity-90" />}
          </motion.div>

          {/* Dashed Ring (Position absolute rakha hai taake image ke upar/peeche adjust ho) */}
          <div className="absolute w-[350px] h-[350px] md:w-[450px] md:h-[450px] rounded-full border-2 border-dashed border-[#22c55e]/50 pointer-events-none" />

          {/* Floating Badges */}
          {badges[0] && (
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="absolute left-0 top-1/2 -translate-y-12 bg-white p-4 rounded-xl shadow-lg flex items-center gap-3 z-20"
          >
            <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs">
              Q
            </div>
            <span className="font-bold text-sm">{badges[0]}</span>
          </motion.div>
          )}

          {badges[1] && (
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 5 }}
            className="absolute right-0 top-10 bg-white p-4 rounded-xl shadow-lg flex items-center gap-3 z-20"
          >
            <div className="w-8 h-8 bg-green-500 rounded-full" />
            <span className="font-bold text-sm">{badges[1]}</span>
          </motion.div>
          )}

          {badges[2] && (
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 4.5 }}
            className="absolute right-0 bottom-10 bg-[#f0ebfc] p-4 rounded-xl shadow-lg flex items-center gap-3 z-20"
          >
            <div className="w-8 h-8 bg-[#6B21D4]/20 rounded-full" />
            <span className="font-bold text-sm">{badges[2]}</span>
          </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
