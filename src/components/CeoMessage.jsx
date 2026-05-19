"use client";
import React from "react";
import { motion } from "framer-motion";

const CeoMessage = () => {
  return (
    <section className="bg-white py-20 px-6 md:px-20 lg:px-32 font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        {/* --- LEFT SIDE: CEO IMAGE --- */}
        <motion.div
          initial={{ opacity: 0, x: -150 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 1.2 }}
          className="flex-1 flex justify-center lg:justify-end"
        >
          <div className="relative max-w-[400px]">
            {/* Grayscale image effect as seen in image_e6388b.png */}
            <img
              src="/images/ceo-portrait.png"
              alt="CEO Farina Sadiq"
              className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-700 ease-in-out rounded-sm shadow-sm"
            />
          </div>
        </motion.div>

        {/* --- RIGHT SIDE: CONTENT --- */}
        <motion.div
          initial={{ opacity: 0, x: 150 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          className="flex-[1.5] space-y-6"
        >
          {/* Main Heading */}
          <h2 className="text-[#1D1D7E] text-2xl md:text-3xl lg:text-[34px] font-bold leading-tight tracking-tight">
            A Visionary Message from Our CEO: Pioneering Innovation at Vortexian
            Tech
          </h2>

          {/* Quote Block with Blue Sidebar Line */}
          <div className="relative pl-8 border-l-[5px] border-[#1D1D7E] py-2">
            <p className="text-gray-800 text-[15px] md:text-[16px] leading-[1.8] font-medium text-justify">
              At Vortexian Tech, we are driven by a relentless passion for
              innovation and excellence. Our commitment to pushing the
              boundaries of technology is at the heart of everything we do. From
              developing cutting-edge solutions to fostering a culture of
              collaboration and creativity, we strive to empower businesses and
              individuals alike to thrive in a digital world. As we continue to
              grow and evolve, our focus remains on delivering exceptional value
              to our clients, partners, and employees. Together, we are shaping
              the future of technology and creating opportunities for growth and
              success.
            </p>

            {/* CEO Name & Signature Title */}
            <div className="mt-8">
              <h4 className="text-[#1D1D7E] text-[18px] font-bold tracking-wide">
                CEO: Farina Sadiq
              </h4>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CeoMessage;
