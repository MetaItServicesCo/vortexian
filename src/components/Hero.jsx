"use client";
import React from "react";

const Hero = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      {/* --- VIDEO BACKGROUND ONLY --- */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-10"
      >
        {/* FIXED: Changed to a standard string URL relative to the public folder.
          Turbopack will not throw errors because it skips checking static asset links!
        */}
        <source src="/assets/video/video-6mb.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </section>
  );
};

export default Hero;
