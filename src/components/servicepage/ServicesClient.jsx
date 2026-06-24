"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Layers, Code, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const iconMap = {
  Layers: <Layers className="w-5 h-5" />,
  Code: <Code className="w-5 h-5" />,
  Share2: <Share2 className="w-5 h-5" />,
};

// ✅ Image URL helper
const getImageUrl = (url) => {
  if (!url) return "https://placehold.co/600x400?text=Vortexian";
  if (url.startsWith("/uploads/")) return `http://127.0.0.1:8000${url}`;
  return url;
};

export default function ServicesClient({ servicesData }) {
  const [activeTab, setActiveTab] = useState("ALL");

  const categories = [
    "ALL",
    ...new Set(
      servicesData.map((s) => s.category_stack?.toUpperCase() || "MARKETING"),
    ),
  ];

  const filteredServices =
    activeTab === "ALL"
      ? servicesData
      : servicesData.filter(
          (s) => s.category_stack?.toUpperCase() === activeTab,
        );

  return (
    <div className="space-y-16">
      <div className="flex flex-wrap items-center justify-start gap-2 bg-white/[0.08] border border-white/[0.09] p-2 rounded-2xl max-w-max backdrop-blur-md">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveTab(category)}
            className={`px-6 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 relative cursor-pointer ${
              activeTab === category
                ? "text-black z-10"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {category}
            {activeTab === category && (
              <motion.div
                layoutId="activeTabGlow"
                className="absolute inset-0 bg-[#5DB4D1] rounded-xl -z-10 shadow-[0_0_20px_rgba(93,180,209,0.4)]"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredServices.map((service) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              key={service.id}
              className="group relative bg-gradient-to-br from-[#1D1D7E]/40 to-[#5DB4D1]/60 p-8 rounded-[2.5rem] border border-white/[0.08] hover:border-[#5DB4D1]/90 flex flex-col justify-between min-h-[440px] transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(93,180,209,0.15)] overflow-hidden backdrop-blur-sm"
            >
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#5DB4D1]/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div>
                {/* ✅ Image */}
                <div className="relative w-full h-44 rounded-2xl overflow-hidden mb-6">
                  <img
                    src={getImageUrl(service.image_showcase_url)}
                    alt={service.service_title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="flex justify-between items-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-[#5DB4D1] group-hover:bg-white group-hover:text-[#1D1D7E] transition-all duration-500 group-hover:scale-110">
                    {iconMap[service.lucide_icon] || <Layers className="w-5 h-5" />}
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50 bg-white/[0.05] border border-white/[0.08] px-3 py-1.5 rounded-xl">
                    {service.category_stack}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-white tracking-tight mb-4 group-hover:text-[#5DB4D1] transition-colors duration-300">
                  {service.service_title}
                </h3>
                <p className="text-white/70 text-xs sm:text-sm leading-relaxed font-medium group-hover:text-white transition-colors duration-300">
                  {service.short_description}
                </p>

                <div className="flex flex-wrap gap-2 mt-6">
                  {[service.feature_1, service.feature_2, service.feature_3]
                    .filter(Boolean)
                    .map((feat, i) => (
                      <span
                        key={i}
                        className="text-[10px] text-white/60 font-bold uppercase tracking-wider bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 rounded-lg group-hover:bg-white/10 group-hover:text-white transition-all duration-300"
                      >
                        {feat}
                      </span>
                    ))}
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-white/[0.08] flex items-center justify-between">
                <Link
                  href={`/services/${service.url_slug}`}
                  prefetch={true}
                  className="text-xs font-black tracking-widest uppercase text-white/80 group-hover:text-[#5DB4D1] transition-all duration-300 border-b-2 border-transparent group-hover:border-[#5DB4D1]/30 pb-1"
                >
                  Explore Capability
                </Link>
                <div className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/50 group-hover:bg-[#5DB4D1] group-hover:text-black transition-all duration-500 group-hover:translate-x-1 group-hover:-translate-y-1">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}