"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";
import Link from "next/link";

const categories = [
  "All",
  "Web Development",
  "Graphic Design",
  "UI/UX Design",
  "App Development",
];

const PortfolioGrid = ({ initialProjects = [] }) => {
  const [filter, setFilter] = useState("All");

  // Filter logic: Safe check lower casing
  const safeProjects = Array.isArray(initialProjects) ? initialProjects : [];

  const filteredProjects =
    filter === "All"
      ? safeProjects
      : safeProjects.filter(
          (p) => p.category_node?.toLowerCase() === filter.toLowerCase(),
        );
  console.log(initialProjects, "Initial Projects in PortfolioGrid");
  return (
    <section className="py-24 px-6 md:px-20 lg:px-32 bg-[#F9FAFB] font-sans text-neutral-900">
      <div className="max-w-7xl mx-auto">
        {/* --- FILTER BUTTONS --- */}
        <div className="flex flex-wrap justify-center gap-4 mb-16 relative z-20">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 rounded text-sm font-bold transition-all uppercase tracking-widest cursor-pointer focus:outline-none ${
                filter === cat
                  ? "bg-[#1D1D7E] text-white shadow-lg"
                  : "bg-white text-gray-500 hover:text-[#1D1D7E] border border-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* --- PROJECTS GRID --- */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-20 text-sm font-bold uppercase tracking-widest text-neutral-400">
            No projects found inside {filter} category.
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10"
          >
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.6 }}
                  className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer"
                >
                  <Link
                    href={`/portfolio/${project.id}`}
                    className="absolute inset-0 z-30"
                  >
                    <span className="sr-only">
                      View {project.project_title}
                    </span>
                  </Link>

                  {/* Image Container */}
                  <div className="relative h-[300px] overflow-hidden bg-neutral-100">
                    <img
                      src={
                        project.primary_image
                          ? `${project.primary_image}`
                          : "https://placehold.co/600x400?text=No+Image+Found"
                      }
                      alt={project.primary_image_alt || project.project_title || "Portfolio project"}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src =
                          "https://placehold.co/600x400?text=No+Image+Found";
                      }}
                    />

                    <div className="absolute inset-0 bg-[#1D1D7E]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center z-10">
                      <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-[#1D1D7E] transform translate-y-10 group-hover:translate-y-0 transition-transform duration-500 shadow-md">
                        <FiArrowUpRight size={28} />
                      </div>
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="p-6 relative z-20 bg-white">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#5DB4D1] text-[10px] font-black uppercase tracking-[3px]">
                        {project.category_node || "Uncategorized"}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400 border border-gray-100 px-1.5 py-0.5 rounded-md font-bold">
                        {project.deployment_year || "N/A"}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mt-2 group-hover:text-[#1D1D7E] transition-colors line-clamp-1 uppercase tracking-tight">
                      {project.project_title || "Untitled Project"}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default PortfolioGrid;
