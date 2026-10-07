"use client";
import React from "react";
import { motion } from "framer-motion";
import { useContent } from "@/components/content/SiteContentProvider";
import { mediaUrl } from "@/lib/api";
import RichText from "@/components/content/RichText";

const CeoMessage = () => {
  const ceo = useContent("about.ceo");
  if (!ceo.visible) return null;

  return (
    <section className="bg-white py-20 px-6 md:px-20 lg:px-32 font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        {/* --- LEFT SIDE: CEO IMAGE --- */}
        <motion.div
          initial={{ opacity: 0, x: -150 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 1.2 }}
          className="flex-1 flex justify-center lg:justify-end"
        >
          <div className="relative max-w-[400px]">
            {/* Grayscale image effect as seen in image_e6388b.png */}
            {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded photo */}
            <img
              src={mediaUrl(ceo.image)}
              alt={ceo.image_alt || ceo.name}
              className="w-full h-auto transition-all duration-700 ease-in-out rounded-sm shadow-"
            />
          </div>
        </motion.div>

        {/* --- RIGHT SIDE: CONTENT --- */}
        <motion.div
          initial={{ opacity: 0, x: 150 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          className="flex-[1.5] space-y-6"
        >
          {/* Main Heading */}
          <h2 className="text-[#1D1D7E] text-2xl md:text-3xl lg:text-[34px] font-bold leading-tight tracking-tight">
            {ceo.heading}
          </h2>

          {/* Quote Block with Blue Sidebar Line */}
          <div className="relative pl-8 border-l-[5px] border-[#1D1D7E] py-2">
            <RichText
              html={ceo.message_html}
              className="text-gray-800 text-[15px] md:text-[16px] leading-[1.8] font-medium text-justify"
            />

            {/* CEO Name & Signature Title */}
            <div className="mt-8">
              {ceo.name && (
                <h4 className="text-[#1D1D7E] text-[18px] font-bold tracking-wide">
                  {ceo.name}
                </h4>
              )}
              {ceo.email && (
                <h4 className="text-[#1D1D7E] text-[18px] font-bold tracking-wide">
                  {ceo.email}
                </h4>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CeoMessage;
