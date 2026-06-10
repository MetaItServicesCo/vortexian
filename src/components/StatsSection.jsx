"use client";
import React from "react";
import { motion } from "framer-motion";
import { Briefcase, Users, UserCheck, Star } from "lucide-react";
import Image from "next/image";
const StatsSection = () => {
  const stats = [
    {
      label: "Projects Completed",
      value: "8600",
      icon: <Briefcase size={30} />,
    },
    { label: "Active Clients", value: "680", icon: <Users size={30} /> },
    { label: "Expert People", value: "102", icon: <UserCheck size={30} /> },
    { label: "Happy Clients", value: "7430", icon: <Star size={30} /> },
  ];

  return (
    <section className="relative py-24 px-6 md:px-20 lg:px-32 font-sans overflow-hidden">
      {/* 1. Background Image with Dark Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20 text-center text-white">
          {stats.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 150 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{
                delay: index * 0.2,
                duration: 0.9,
                type: "spring",
                stiffness: 120,
              }}
              className="flex flex-col items-center group"
            >
              {/* Hexagon Icon Container */}
              <div className="relative mb-6 w-20 h-20 flex items-center justify-center">
                {/* CSS Hexagon Shape */}
                <div className="absolute inset-0 bg-white rotate-45 rounded-xl group-hover:rotate-[135deg] transition-transform duration-700"></div>
                <div className="relative z-10 text-[#1D1D7E] group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
              </div>

              {/* Number and Label */}
              <h3 className="text-3xl md:text-4xl font-bold mb-1 tracking-tight">
                {item.value}
              </h3>
              <p className="text-sm font-medium text-gray-300 uppercase tracking-widest border-t border-gray-500 pt-2 px-4">
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* --- FLOATING CTA BANNER --- */}
        <motion.div
          initial={{ opacity: 0, y: 150 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 1 }}
          className="relative mt-12 bg-gradient-to-r from-[#1D1D7E] via-[#3B82F6] to-[#5DB4D1] rounded-[30px] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl overflow-hidden"
        >
          {/* Abstract Light Bulb Decoration */}
          <div className="absolute top-4 left-1/3 opacity-20 text-white animate-pulse">
            <svg width="40" height="40" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-1.3l-.85-.6C7.8 13.15 7 11.18 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.18-.8 4.15-2.15 5.1z" />
            </svg>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          
            <div className="hidden lg:block -mb-12 position-relative">
              <img
                src="/assets/images/girl.png"
                alt="Representative"
                className="h-[300px] w-full object-contain position-absolute top-[-100px] left-0 transform hover:scale-105 transition-transform duration-700"
              />
            </div>

            <div className="text-white">
              <h4 className="text-2xl md:text-3xl font-bold leading-tight">
                Let’s Discuss How to <br /> Make your Business Better.
              </h4>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#111133] text-white px-8 py-4 font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-[#111133] transition-all duration-300"
          >
            Discover More
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;
