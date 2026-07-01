"use client";

import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Parallax } from "swiper/modules";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import {
  HiOutlineArrowNarrowLeft,
  HiOutlineArrowNarrowRight,
} from "react-icons/hi";

import "swiper/css";

/* ✅ SINGLE IMAGE HELPER (FINAL FIX) */
const getImageUrl = (path) => {
  if (!path) return "/default-user.png";

  // already full URL
  if (path.startsWith("http")) return path;

  // clean duplicate slashes + build correct FastAPI URL
  return `/${path.replace(/^\/+/, "")}`;
};

const TeamSlider = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getTeamRoster() {
      try {
        const response = await fetch("/api/team/teams", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch team members");
        }

        const data = await response.json();

        /* ✅ CLEAN MAPPING (NO IMAGE LOGIC HERE) */
        const formattedData = data.map((member) => ({
          id: member.id,
          name: member.full_name,
          role: member.designation,
          description: member.bio_description,
          image: member.profile_image, // 👈 RAW ONLY
          facebook: member.facebook_link,
          instagram: member.instagram_link,
          linkedin: member.linkedin_link,
        }));

        setTeamMembers(formattedData);
      } catch (error) {
        console.error("Error fetching team members:", error);
      } finally {
        setLoading(false);
      }
    }

    getTeamRoster();
  }, []);

  if (loading) {
    return (
      <div className="w-full py-32 bg-white flex items-center justify-center font-sans text-sm font-black uppercase tracking-widest text-[#1D1D7E]">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Synced Roster Loading...
      </div>
    );
  }

  if (teamMembers.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        No team members found.
      </div>
    );
  }

  return (
    <section className="bg-white py-24 px-6 md:px-20 lg:px-32 font-sans overflow-hidden relative">
      {/* Background Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] font-black text-slate-100/60 uppercase pointer-events-none select-none tracking-tighter -z-10">
        Vortexian
      </div>

      <div className="max-w-[1200px] mx-auto relative z-10">
        {/* Header */}
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

          <div className="flex gap-3">
            <button className="team-prev-btn w-12 h-12 flex items-center justify-center border border-gray-200 bg-white text-gray-600 hover:bg-[#1D1D7E] hover:text-white transition-all duration-300 rounded-xl">
              <HiOutlineArrowNarrowLeft size={20} />
            </button>

            <button className="team-next-btn w-12 h-12 flex items-center justify-center border border-gray-200 bg-white text-gray-600 hover:bg-[#1D1D7E] hover:text-white transition-all duration-300 rounded-xl">
              <HiOutlineArrowNarrowRight size={20} />
            </button>
          </div>
        </div>

        {/* Slider */}
        <div className="overflow-hidden rounded-[2.5rem]">
          <Swiper
            modules={[Navigation, Autoplay, Parallax]}
            navigation={{
              prevEl: ".team-prev-btn",
              nextEl: ".team-next-btn",
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            parallax={true}
            spaceBetween={40}
            speed={1000}
            slidesPerView={1}
            loop={teamMembers.length > 1}
            grabCursor={true}
            watchSlidesProgress={true}
            className="team-swiper"
          >
            {teamMembers.map((member) => (
              <SwiperSlide key={member.id}>
                <div className="p-1">
                  <div className="w-full bg-slate-50 border border-gray-100 rounded-[2.5rem] p-6 md:p-8 flex flex-col md:flex-row gap-8 md:gap-10 items-stretch min-h-[400px] shadow-xl hover:-translate-y-2 transition-all duration-500 group">
                    {/* IMAGE */}
                    <div className="w-full md:w-[35%] relative rounded-3xl overflow-hidden min-h-[220px] md:h-[400px] bg-[#1D1D7E]/5 border border-gray-200/50">
                      <img
                        src={getImageUrl(member.image)}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    </div>

                    {/* CONTENT */}
                    <div className="flex-1 flex flex-col py-4 md:pr-6 space-y-6 relative">
                      {/* Social */}
                      <div className="absolute top-0 right-0 flex flex-col gap-2.5">
                        {member.facebook && (
                          <motion.a
                            href={member.facebook}
                            target="_blank"
                            className="w-9 h-9 flex items-center justify-center bg-white border rounded-xl hover:bg-[#1877F2] hover:text-white"
                          >
                            <FaFacebookF />
                          </motion.a>
                        )}

                        {member.instagram && (
                          <motion.a
                            href={member.instagram}
                            target="_blank"
                            className="w-9 h-9 flex items-center justify-center bg-white border rounded-xl hover:bg-[#E4405F] hover:text-white"
                          >
                            <FaInstagram />
                          </motion.a>
                        )}

                        {member.linkedin && (
                          <motion.a
                            href={member.linkedin}
                            target="_blank"
                            className="w-9 h-9 flex items-center justify-center bg-white border rounded-xl hover:bg-[#0A66C2] hover:text-white"
                          >
                            <FaLinkedinIn />
                          </motion.a>
                        )}
                      </div>

                      <div className="pr-12">
                        <span className="text-[#5DB4D1] text-xs font-black uppercase">
                          {member.role}
                        </span>

                        <h3 className="text-2xl md:text-4xl font-black text-[#1D1D7E] uppercase">
                          {member.name}
                        </h3>
                      </div>

                      <p className="text-gray-700 text-sm md:text-base font-medium leading-relaxed whitespace-pre-line">
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
