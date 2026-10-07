"use client";
import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useContent } from "@/components/content/SiteContentProvider";
import { mediaUrl } from "@/lib/api";

const Hero = () => {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);
  const hero = useContent("home.hero");

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  // The home page's only H1. Visible over the video if enabled, otherwise
  // present for search engines and screen readers only.
  const heading = hero.heading ? (
    <h1
      className={
        hero.show_heading && hero.visible && hero.video
          ? "absolute inset-x-0 bottom-0 z-20 px-6 pt-24 pb-10 sm:pb-16 text-center text-white text-xl sm:text-3xl md:text-5xl font-bold tracking-tight bg-gradient-to-t from-black/70 to-transparent pointer-events-none"
          : "sr-only"
      }
    >
      {hero.heading}
    </h1>
  ) : null;

  if (!hero.visible || !hero.video) return heading;

  return (
    <section className="relative w-full overflow-hidden bg-black mt-10 h-[30vh] sm:h-[40vh] md:h-screen">
      {/* VIDEO BACKGROUND */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        poster={mediaUrl(hero.poster) || undefined}
        key={hero.video}
        className="absolute inset-0 w-full h-full object-cover object-center z-10"
      >
        <source src={mediaUrl(hero.video)} />
        Your browser does not support the video tag.
      </video>

      {heading}

      {/* MUTE BUTTON */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleMute}
        aria-label={isMuted ? "Unmute video" : "Mute video"}
        className="absolute bottom-5 right-5 sm:bottom-10 sm:right-10 z-20 p-2 sm:p-3 bg-white/20 backdrop-blur-md rounded-full text-white border border-white/30 hover:bg-white/40 transition-all"
      >
        {isMuted ? (
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
          </svg>
        )}
      </motion.button>
    </section>
  );
};

export default Hero;
