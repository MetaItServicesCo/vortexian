"use client";
import React from "react";
import { motion } from "framer-motion";
import { useContent } from "@/components/content/SiteContentProvider";
import { mediaUrl } from "@/lib/api";
import RichText from "@/components/content/RichText";
import { Search } from "lucide-react"; // Alternative for the magnifying glass

const WhyChooseUs = () => {
  const section = useContent("about.why");
  if (!section.visible) return null;

  return (
    <section className="bg-white py-20 px-6 md:px-20 lg:px-32 font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-24">
        {/* --- RIGHT SIDE: CONTENT --- */}
        <motion.div
          initial={{ opacity: 0, x: 150 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 1.2 }}
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

        {/* --- LEFT SIDE: 3D MAGNIFYING GLASS IMAGE --- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 1.4 }}
          className="flex-1 flex justify-center items-center relative"
        >
          {section.image ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded image
            <img src={mediaUrl(section.image)} alt={section.image_alt || ""} className="w-full max-w-md h-auto object-contain" />
          ) : (
          <div className="relative group">
            {/* 3D Image Placeholder */}
            {/* Aap yahan apni actual PNG image use kar sakte hain jo image_dc3157.png jaisi ho */}
            <motion.div
              animate={{
                rotate: [0, 5, 0, -5, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative z-10 drop-shadow-2xl"
            >
              <div className="text-[#3B82F6] text-[250px] md:text-[350px]">
                {/* Lucide Search icon as a base for 3D styling */}
                <Search
                  size="1em"
                  strokeWidth={1.5}
                  className="filter drop-shadow-xl"
                />
              </div>

              {/* Red User Dot focus (Simulated center focus) */}
              <div className="absolute top-[35%] left-[35%] w-12 h-12 md:w-16 md:h-16 bg-red-500 rounded-full blur-[1px] opacity-80 border-4 border-white shadow-inner"></div>
            </motion.div>

            {/* Background "Blurry Users" placeholder (Light gray circles) */}
            <div className="absolute inset-0 flex items-center justify-center -z-10 opacity-20 gap-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-10 h-10 md:w-16 md:h-16 bg-gray-400 rounded-full blur-sm"
                ></div>
              ))}
            </div>
          </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
