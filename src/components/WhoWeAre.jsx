"use client";
import React from "react";
import { motion } from "framer-motion";
import { useContent } from "@/components/content/SiteContentProvider";
import { mediaUrl } from "@/lib/api";
import RichText from "@/components/content/RichText";
import { HelpCircle } from "lucide-react"; // Alternative icon if 3D image is not available

const WhoWeAre = () => {
  const section = useContent("about.who");
  if (!section.visible) return null;

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
            {section.heading}
          </h2>

          <RichText
            html={section.body_html}
            className="text-gray-800 text-[15px] md:text-[16px] leading-[1.8] font-medium text-justify [&_strong]:text-[#1D1D7E]"
          />
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
          {section.image ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded image
            <img src={mediaUrl(section.image)} alt="" className="w-full max-w-md h-auto object-contain" />
          ) : (
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
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default WhoWeAre;
