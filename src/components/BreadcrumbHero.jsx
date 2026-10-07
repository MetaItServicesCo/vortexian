"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useContent } from "@/components/content/SiteContentProvider";
import { mediaUrl } from "@/lib/api";

// headingAs="p" on pages that render their own <h1> (one H1 per page for SEO)
const BreadcrumbHero = ({ title, currentPage, headingAs = "h1" }) => {
  const Heading = headingAs === "h1" ? motion.h1 : motion.p;
  const banner = useContent("page_banner");
  return (
    <section className="relative h-[300px] md:h-[400px] w-full flex items-center justify-center overflow-hidden font-sans">
      {/* 1. Background Image with Dark Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: banner.background_image ? `url('${mediaUrl(banner.background_image)}')` : undefined,
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-black/50 transition-opacity"></div>
      </div>

      {/* 2. Content Container (Full Width for Corner Positioning) */}
      <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-6 md:px-20 flex flex-col justify-center items-center">
        {/* Page Title - Always Center */}
        <Heading
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-white text-4xl md:text-5xl font-bold uppercase tracking-[6px]"
        >
          {title}
        </Heading>

        {/* --- SEO FRIENDLY BREADCRUMB (Aligned to Bottom Left Corner) --- */}
        <nav
          aria-label="Breadcrumb"
          className="absolute bottom-10 left-6 md:left-20"
        >
          <ol className="flex items-center gap-3 text-[11px] md:text-[16px] font-bold tracking-widest text-white/90 uppercase">
            <li>
              <Link href="/" className="hover:text-[#5DB4D1] transition-colors">
                HOME
              </Link>
            </li>
            <li className="text-white/30 font-light">/</li>
            <li className="text-white/60 cursor-default" aria-current="page">
              {currentPage}
            </li>
          </ol>
        </nav>
      </div>

      {/* Decorative Line at the very bottom */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/5"></div>
    </section>
  );
};

export default BreadcrumbHero;
