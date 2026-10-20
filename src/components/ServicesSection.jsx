"use client";
import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion"; // Animation library
import { Users, Megaphone, Paintbrush, Cpu, Headset } from "lucide-react";
import CardCarousel from "@/components/ui/CardCarousel";
import { useContent } from "@/components/content/SiteContentProvider";
import DynamicIcon, { ICONS } from "@/components/content/DynamicIcon";
import { OTHER_SERVICES_PATH, isOtherService } from "@/lib/otherServices";

const ServicesSection = ({ services: apiServices = [] }) => {
  const section = useContent("home.services");
  const reduceMotion = useReducedMotion();
  const fallbackServices = [
    {
      id: "01",
      title: "Staffing Capabilities",
      icon: <Users size={32} />,
      hoverBg: "hover:bg-[#17147B]",
      gridSpan: "lg:col-span-2",
    },
    {
      id: "02",
      title: "Marketing and Advertising Capabilities",
      icon: <Megaphone size={32} />,
      hoverBg: "hover:bg-[#D47253]",
      gridSpan: "lg:col-span-2",
    },
    {
      id: "03",
      title: "Creative Capabilities",
      icon: <Paintbrush size={32} />,
      hoverBg: "hover:bg-[#17147B]",
      gridSpan: "lg:col-span-2",
    },
    {
      id: "04",
      title: "Technology Capabilities",
      icon: <Cpu size={32} />,
      hoverBg: "hover:bg-[#D47253]",
      gridSpan: "lg:col-span-3",
    },
    {
      id: "05",
      title: "Consultancy",
      icon: <Headset size={32} />,
      hoverBg: "hover:bg-[#17147B]",
      gridSpan: "lg:col-span-3",
    },
  ];

  const services = apiServices.length
    ? apiServices.map((item, index) => ({
        id: String(index + 1).padStart(2, "0"),
        title: item.service_title,
        href: isOtherService(item) ? OTHER_SERVICES_PATH : item.url_slug ? `/services/${encodeURIComponent(item.url_slug)}` : "/services",
        icon: <DynamicIcon name={ICONS[item.lucide_icon] ? item.lucide_icon : "Headset"} size={32} />,
        hoverBg: index % 2 === 0 ? "hover:bg-[#17147B]" : "hover:bg-[#D47253]",
        gridSpan: index < 3 ? "lg:col-span-2" : "lg:col-span-3",
      }))
    : fallbackServices;

  // Animation Variants
  // const containerVariants = {
  //   hidden: { opacity: 0 },
  //   visible: {
  //     opacity: 1,
  //     transition: {
  //       staggerChildren: 0.7, 
  //     },
  //   },
  // };

  // const cardVariants = {
  //   hidden: { opacity: 0, y: 150 },
  //   visible: {
  //     opacity: 1,
  //     y: 0,
  //     transition: { duration: 0.9, ease: "easeOut" },
  //   },
  // };

  if (!section.visible) return null;

  return (
    <section className="bg-[#F2F2F2] py-20 px-6 md:px-20 lg:px-32 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* --- HEADER SECTION WITH ANIMATION --- */}
        <motion.div
          // initial={{ opacity: 0, x: -150 }}
          // whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.9 }}
          className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-12"
        >
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: 32 }}
                viewport={{ once: false }}
                transition={{ delay: 0.9, duration: 0.9, ease: "easeInOut" }}
                className="h-[2px] bg-[#5DB4D1]"
              ></motion.div>
              <span className="text-[#5DB4D1] font-bold text-sm uppercase tracking-widest">
                {section.eyebrow}
              </span>
            </div>
            <h2 className="text-[32px] md:text-5xl font-[600] text-black tracking-tight leading-tight">
              {section.heading}
            </h2>
          </div>
          <div className="lg:max-w-xs pt-4">
            <p className="text-gray-600 text-sm font-medium leading-relaxed">
              {section.text}
            </p>
          </div>
        </motion.div>

        {/* --- SERVICES CAROUSEL: grows sideways as services are added --- */}
        <CardCarousel
          items={services}
          label={section.heading || "Our services"}
          itemName="services"
          renderItem={(service) => (
            <motion.div
              whileHover={reduceMotion ? undefined : { y: -7 }}
              className={`group relative bg-white h-[260px] p-6 flex flex-col justify-end transition-colors duration-500 ease-in-out cursor-pointer overflow-hidden shadow-sm focus-within:ring-4 focus-within:ring-[#5DB4D1]/50 ${service.hoverBg}`}
              data-service-card=""
            >
              {/* Background Number (drifts at its own speed while swiping) */}
              <span data-swiper-parallax="-35%" data-swiper-parallax-opacity="0.4" className="absolute top-8 right-8 text-[100px] font-bold text-gray-100 opacity-20 group-hover:opacity-10 group-hover:text-white transition-[color,opacity,scale] duration-700 pointer-events-none group-hover:scale-110">
                {service.id}
              </span>

              {/* Horizontal Strip */}
              <div className="absolute top-24 left-0 w-full h-8 bg-[#F8F9FA] group-hover:bg-white/10 transition-colors duration-500"></div>

              {/* Floating Icon Container */}
              <div className="absolute top-14 left-10 w-20 h-20 bg-white rounded-full shadow-md flex items-center justify-center text-black z-20 group-hover:rotate-[360deg] transition-all duration-700">
                {service.icon}
              </div>

              {/* Service Title */}
              <div className="relative z-10">
                <h3 className="text-[25px] font-bold text-[#111] leading-[1.2] group-hover:text-white transition-colors duration-500 max-w-[280px]">
                  {service.title}
                </h3>
              </div>

              {/* Whole card is the link (one link per card, named after the service) */}
              <Link href={service.href || "/services"} aria-label={`Explore ${service.title}`} className="absolute inset-0 z-40 outline-none" />

              {/* Decorative Corner */}
              <div className="absolute bottom-0 right-0 w-12 h-12 border-r-4 border-b-4 border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-50 group-hover:scale-100"></div>
            </motion.div>
          )}
        />
      </div>
    </section>
  );
};

export default ServicesSection;
