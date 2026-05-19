"use client";
import React, { useState, useEffect } from "react";
import { motion, animate } from "framer-motion";

// --- COUNTER COMPONENT ---
const RollingNumber = ({ value, isFirstLoad }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isFirstLoad) {
      // Sirf pehli baar reload par 0 se animate hoga
      const controls = animate(0, parseInt(value), {
        duration: 1.5,
        ease: "circOut",
        onUpdate: (latest) => setDisplayValue(Math.floor(latest)),
      });
      return () => controls.stop();
    } else {
      // Baad mein sirf normal update hoga bina 0 se start kiye
      setDisplayValue(parseInt(value));
    }
  }, [value, isFirstLoad]);

  return <span>{String(displayValue).padStart(2, "0")}</span>;
};

const RecruitmentBanner = () => {
  const [currentTime, setCurrentTime] = useState(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    // 2 seconds baad isFirstLoad ko false kar denge taake loop khatam ho jaye
    const timeout = setTimeout(() => setIsFirstLoad(false), 2000);

    const updateTime = () => {
      const now = new Date();
      setCurrentTime({
        days: String(now.getDate()).padStart(2, "0"),
        hours: String(now.getHours()).padStart(2, "0"),
        minutes: String(now.getMinutes()).padStart(2, "0"),
        seconds: String(now.getSeconds()).padStart(2, "0"),
      });
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);

    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, []);

  if (!currentTime) return null;

  return (
    <section className="bg-white py-16 px-4 md:px-20 lg:px-32 font-sans overflow-hidden">
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center lg:items-start justify-between gap-12">
        {/* --- LEFT SIDE --- */}
        <motion.div
          initial={{ opacity: 0, x: -160 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex-1 text-center lg:text-left"
        >
          <div className="relative inline-block mb-2">
            <h2 className="text-[32px] md:text-[44px] font-bold text-[#111] leading-[1.1] tracking-tight">
              <span className="relative">
                RECRUIT
                <motion.span
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ delay: 1.2, duration: 1 }}
                  className="absolute bottom-0 left-0 h-[2px] bg-black"
                ></motion.span>
              </span>{" "}
              <span className="text-[#1D1D7E]">WORKFORCES</span> FOR COUNTRYWIDE
              PROJECTS
            </h2>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="text-[17px] md:text-[20px] font-bold text-black mt-8 mb-8"
          >
            Offering Limited Time Discount On Recruitment Services
          </motion.p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#1D1D7E] text-white px-10 py-5 text-[13px] font-bold uppercase tracking-wider hover:bg-black transition-all shadow-lg"
          >
            Get In Touch
          </motion.button>
        </motion.div>

        {/* --- RIGHT SIDE --- */}
        <div className="flex items-center gap-2 md:gap-3 mt-4">
          {[
            { label: "DATE", val: currentTime.days },
            { label: "HOURS", val: currentTime.hours },
            { label: "MINUTES", val: currentTime.minutes },
            { label: "SECONDS", val: currentTime.seconds },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5, y: 100 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{
                duration: 0.9,
                delay: index * 0.2,
                type: "spring",
                stiffness: 120,
              }}
              whileHover={{ y: -7 }}
              className="flex flex-col shadow-[0px_20px_40px_rgba(0,0,0,0.25)] rounded-xl overflow-hidden w-[75px] md:w-[115px] cursor-default"
            >
              <div className="bg-[#5DB4D1] h-[65px] md:h-[100px] flex items-center justify-center border-b border-white/20">
                <div className="text-white text-2xl md:text-5xl font-bold">
                  {/* Ab seconds normal chalenge pehli animation ke baad */}
                  <RollingNumber value={item.val} isFirstLoad={isFirstLoad} />
                </div>
              </div>
              <div className="bg-black h-[45px] md:h-[65px] flex items-center justify-center">
                <span className="text-white text-[9px] md:text-[11px] font-bold tracking-widest">
                  {item.label}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecruitmentBanner;
