"use client";
import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Parallax } from "swiper/modules";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

// React Icons
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import {
  HiOutlineArrowNarrowLeft,
  HiOutlineArrowNarrowRight,
} from "react-icons/hi";

// Swiper Styles
import "swiper/css";

const TeamSlider = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH LIVE ROSTER CHANNELS FROM DATABASE ---
  useEffect(() => {
    async function getTeamRoster() {
      try {
        const response = await fetch("http://localhost:8000/api/team/teams", {
          cache: "no-store",
        });
        if (response.ok) {
          const dataset = await response.json();
          setTeamMembers(dataset);
        }
        console.log("Fetched Team Roster:", teamMembers);
      } catch (error) {
        console.error(
          "Pipeline failure compiling public team view state:",
          error,
        );
      } finally {
        setLoading(false);
      }
    }
    getTeamRoster();
  }, []);

  if (loading) {
    return (
      <div className="w-full py-32 bg-white flex items-center justify-center font-sans text-sm font-black uppercase tracking-widest text-[#1D1D7E]">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Synced Roster
        Loading...
      </div>
    );
  }

  // Fallback layout block states if array is empty
  if (teamMembers.length === 0) return null;

  return (
    <section className="bg-white py-24 px-6 md:px-20 lg:px-32 font-sans overflow-hidden relative">
      {/* Decorative Background Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] font-black text-slate-100/60 uppercase pointer-events-none select-none tracking-tighter -z-10">
        Vortexian
      </div>

      <div className="max-w-[1200px] mx-auto relative z-10">
        {/* --- HEADER PANELS WITH DYNAMIC TYPOGRAPHY --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div>
            <span className="text-[#5DB4D1] text-xs font-black uppercase tracking-[0.3em] mb-3 block">
              Meet The Minds
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-black tracking-tighter uppercase leading-none">
              Architects of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1D1D7E] to-[#5DB4D1]">
                Digital Innovation
              </span>
            </h2>
          </div>

          {/* Premium Minimalist Arrow Navigation Controls */}
          <div className="flex gap-3">
            <button className="team-prev-btn w-12 h-12 flex items-center justify-center border border-gray-200 bg-white text-gray-600 hover:bg-[#1D1D7E] hover:text-white hover:border-[#1D1D7E] transition-all duration-300 rounded-xl cursor-pointer shadow-sm group focus:outline-none">
              <HiOutlineArrowNarrowLeft
                size={20}
                className="group-hover:-translate-x-1 transition-transform"
              />
            </button>
            <button className="team-next-btn w-12 h-12 flex items-center justify-center border border-gray-200 bg-white text-gray-600 hover:bg-[#1D1D7E] hover:text-white hover:border-[#1D1D7E] transition-all duration-300 rounded-xl cursor-pointer shadow-sm group focus:outline-none">
              <HiOutlineArrowNarrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        </div>

        {/* --- FIXED CAROUSEL BOUNDARIES --- */}
        <div className="overflow-hidden rounded-[2.5rem]">
          <Swiper
            modules={[Navigation, Autoplay, Parallax]}
            navigation={{
              prevEl: ".team-prev-btn",
              nextEl: ".team-next-btn",
            }}
            parallax={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            speed={1000}
            slidesPerView={1}
            loop={true}
            allowTouchMove={true}
            grabCursor={true}
            watchSlidesProgress={true}
            className="team-swiper"
          >
            {teamMembers.map((member) => (
              <SwiperSlide key={member._id}>
                <div className="p-1">
                  {/* Modern Split-Card Container */}
                  <div className="w-full bg-slate-50 border border-gray-100 rounded-[2.5rem] p-6 md:p-8 flex flex-col md:flex-row gap-8 md:gap-10 items-stretch min-h-[400px] shadow-xl shadow-slate-100/50 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(29,29,126,0.12)] group">
                    {/* LEFT PANE: IMAGE FRAME */}
                    <div className="w-full md:w-[35%] relative rounded-3xl overflow-hidden min-h-[220px] md:h-[400px] bg-[#1D1D7E]/5 border border-gray-200/50 shadow-inner group-hover:border-[#5DB4D1]/40 transition-colors duration-500">
                      <img
                        src={member.image}
                        alt={member.name}
                        data-swiper-parallax="-100"
                        className="w-full h-full object-cover transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1) group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                    </div>

                    {/* RIGHT PANE: TEXT DETAILS COMPLEX */}
                    <div className="flex-1 flex flex-col py-4 md:pr-6 space-y-6 overflow-hidden relative">
                      {/* Floating Social Icons Row with Dynamic Visibility Filters */}
                      <div
                        data-swiper-parallax="-450"
                        className="absolute top-0 right-0 flex flex-col gap-2.5 transition-transform duration-500 translate-y-2 group-hover:translate-y-0"
                      >
                        {member.facebook && (
                          <motion.a
                            href={member.facebook}
                            target="_blank"
                            className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200/80 rounded-xl text-gray-500 hover:text-white hover:bg-[#1877F2] transition-all duration-300 shadow-sm hover:scale-105"
                          >
                            <span className="text-sm">
                              <FaFacebookF />
                            </span>
                          </motion.a>
                        )}
                        {member.instagram && (
                          <motion.a
                            href={member.instagram}
                            target="_blank"
                            className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200/80 rounded-xl text-gray-500 hover:text-white hover:bg-[#E4405F] transition-all duration-300 shadow-sm hover:scale-105"
                          >
                            <span className="text-sm">
                              <FaInstagram />
                            </span>
                          </motion.a>
                        )}
                        {member.linkedin && (
                          <motion.a
                            href={member.linkedin}
                            target="_blank"
                            className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200/80 rounded-xl text-gray-500 hover:text-white hover:bg-[#0A66C2] transition-all duration-300 shadow-sm hover:scale-105"
                          >
                            <span className="text-sm">
                              <FaLinkedinIn />
                            </span>
                          </motion.a>
                        )}
                      </div>

                      <div className="pr-12">
                        <div
                          className="flex items-center gap-2 mb-2"
                          data-swiper-parallax="-150"
                        >
                          <span className="text-[#5DB4D1] text-[11px] font-black tracking-widest uppercase">
                            {member.role}
                          </span>
                          <div className="h-[1.5px] bg-[#5DB4D1]/40 flex-grow max-w-[60px]" />
                        </div>
                        <h3
                          data-swiper-parallax="-250"
                          className="text-2xl md:text-4xl font-black text-[#1D1D7E] tracking-tight uppercase transition-colors duration-300 group-hover:text-black"
                        >
                          {member.name}
                        </h3>
                      </div>

                      {/* FIXED: Directly outputting live description string state safely from Mongo document properties */}
                      <p
                        data-swiper-parallax="-350"
                        className="text-black-500 text-sm md:text-base font-medium leading-relaxed max-w-xl pr-6 whitespace-pre-line"
                      >
                        {member.description}
                      </p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default TeamSlider;
