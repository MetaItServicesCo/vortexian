"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Heart,
  Users,
  Utensils,
  Cake,
  Handshake,
  BookOpen,
  Wallet,
  GraduationCap,
  Dumbbell,
} from "lucide-react";

const EmployeePerks = () => {
  const perks = [
    {
      title: "Compensation",
      icon: <DollarSign size={24} />,
      desc: "Competitive salary and performance bonuses. The company covers conferences, certifications, courses, and internet service.",
      span: "lg:col-span-2",
    },
    {
      title: "Health & Wellness",
      icon: <Heart size={24} />,
      desc: "We offer top-tier international medical coverage and pays for 100% of the insurance cost for its employees.",
      span: "lg:col-span-2",
    },
    {
      title: "Family",
      icon: <Users size={24} />,
      desc: "Parental leave, flexible vacation time and time-off policies. Kids + pet friendly office and liberal WFH policies.",
      span: "lg:col-span-2",
    },
    {
      title: "Food",
      icon: <Utensils size={24} />,
      desc: "We provide catered, gourmet meals every weekday and stock an impressive supply of cold-pressed juices and snacks.",
      span: "lg:col-span-2",
    },
    {
      title: "Birthday Celebrations",
      icon: <Cake size={24} />,
      desc: "Birthday celebrations include company-sponsored parties, gifts, and paid time off, ensuring all employees feel valued.",
      span: "lg:col-span-2",
    },
    {
      title: "All Hands",
      icon: <Handshake size={24} />,
      desc: "Weekly meetings dedicated to English proficiency and company news, plus a monthly Tech-Lunch meeting.",
      span: "lg:col-span-2",
    },
    {
      title: "Access to Course and Certification",
      icon: <BookOpen size={24} />,
      desc: "Employees have access to courses and certifications fully funded by the company, encouraging continuous development.",
      span: "lg:col-span-3",
    },
    {
      title: "Employee Loan",
      icon: <Wallet size={24} />,
      desc: "Employee loan programs offer financial assistance with favorable terms, helping staff manage personal expenses.",
      span: "lg:col-span-3",
    },
    {
      title: "Paid Trainings",
      icon: <GraduationCap size={24} />,
      desc: "The company provides paid trainings to employees, ensuring ongoing professional development and skill enhancement.",
      span: "lg:col-span-3",
    },
    {
      title: "Gym Membership",
      icon: <Dumbbell size={24} />,
      desc: "The company provides paid trainings to enhance employee skills and knowledge, supporting professional advancement.",
      span: "lg:col-span-3",
    },
  ];

  return (
    <section className="bg-[#1D1D7E] py-20 px-6 md:px-20 lg:px-32">
      <div className="max-w-7xl mx-auto">
        {/* --- HEADER --- */}
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          className="text-center mb-16"
        >
          <div className="w-10 h-[2px] bg-[#5DB4D1] mx-auto mb-4"></div>
          <h2 className="text-white text-3xl md:text-5xl font-extrabold uppercase tracking-tight">
            What We Do For Our <br /> Employees
          </h2>
        </motion.div>

        {/* --- GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {perks.map((perk, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -10 }}
              className={`group relative bg-white p-8 pt-20 flex flex-col min-h-[280px] shadow-lg transition-all duration-500 ease-out overflow-hidden ${perk.span} hover:shadow-2xl`}
            >
              {/* --- INDUSTRY LEVEL GRADIENT BG (Hidden by default, shows on hover) --- */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#5DB4D1] via-[#2A2A8E] to-[#5DB4D1] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />

              {/* Horizontal Strip */}
              <div className="absolute top-12 left-0 w-full h-6 bg-[#F8F9FA] group-hover:bg-white/10 transition-colors duration-500 z-10"></div>

              {/* Floating Icon */}
              <div className="absolute top-6 left-8 w-14 h-14 bg-white rounded-full shadow-md flex items-center justify-center text-black z-20 group-hover:bg-[#5DB4D1] group-hover:text-white transition-all duration-500 group-hover:scale-110">
                {perk.icon}
              </div>

              {/* Content */}
              <div className="relative z-20 transition-colors duration-500">
                <h3 className="text-xl font-bold text-black mb-3 group-hover:text-white transition-colors">
                  {perk.title}
                </h3>
                <p className="text-gray-600 text-xs md:text-sm leading-relaxed group-hover:text-white/80 transition-colors">
                  {perk.desc}
                </p>
              </div>

              {/* Decorative Corner Light (Hover only) */}
              <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-[#5DB4D1]/40 transition-all duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EmployeePerks;
