"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

const testimonials = [
  {
    id: 1,
    text: "Partnering with Vortexian Tech has been a game-changer for our business. Their tailored payroll management system not only streamlined our processes but also significantly reduced errors and compliance issues. The team's dedication and expertise are truly unmatched.",
    name: "David Coper",
    role: "HAPPY CUSTOMER",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 2,
    text: "Vortexian Tech's creative design team transformed our brand identity, giving us a fresh and modern look that resonates with our target audience. Their attention to detail and innovative approach exceeded our expectations. We've seen a noticeable increase in engagement.",
    name: "Aleesha Rose",
    role: "HAPPY CUSTOMER",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: 3,
    text: "The technology solutions provided by Vortexian Tech helped us scale our operations globally. Their support is 24/7, and their technical proficiency in modern stacks like MERN is evident in every deliverable.",
    name: "John Smith",
    role: "HAPPY CUSTOMER",
    image: "https://randomuser.me/api/portraits/men/45.jpg",
  },
];

const TestimonialSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // 1 for next, -1 for prev

  const slideNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) =>
      prev + 1 === testimonials.length ? 0 : prev + 1,
    );
  }, []);

  const slidePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1,
    );
  }, []);

  // Auto-slide logic
  useEffect(() => {
    const timer = setInterval(slideNext, 5000); // 5 seconds interval
    return () => clearInterval(timer);
  }, [slideNext]);

  // Get visible pair
  const nextIndex = (currentIndex + 1) % testimonials.length;

  return (
    <section className="bg-[#F8F9FA] py-24 px-6 md:px-20 lg:px-32 overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* --- LEFT SIDE: TEXT & NAV --- */}
        <div className="lg:col-span-4 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-[2px] bg-[#1D1D7E]"></div>
              <span className="text-[#5DB4D1] font-bold text-sm uppercase tracking-widest">
                Our Testimonials
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#111] leading-tight">
              What They&apos;re <br /> Talking About us.
            </h2>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            <button
              onClick={slidePrev}
              className="w-14 h-14 flex items-center justify-center bg-white border border-gray-200 hover:bg-[#1D1D7E] hover:text-white transition-all shadow-sm"
            >
              <ArrowLeft size={24} />
            </button>
            <button
              onClick={slideNext}
              className="w-14 h-14 flex items-center justify-center bg-gray-500 text-white hover:bg-[#1D1D7E] transition-all shadow-sm"
            >
              <ArrowRight size={24} />
            </button>
          </div>
        </div>

        {/* --- RIGHT SIDE: SLIDING CARDS --- */}
        <div className="lg:col-span-8 relative h-[450px] md:h-[350px]">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={currentIndex}
              custom={direction}
              initial={{ x: direction > 0 ? 400 : -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction > 0 ? -400 : 400, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="flex flex-col md:flex-row gap-6 h-full"
            >
              {/* Har waqt 2 cards dikhane ke liye logic (Desktop) */}
              {[testimonials[currentIndex], testimonials[nextIndex]].map(
                (item, idx) => (
                  <div
                    key={item.id}
                    className={`bg-white p-8 rounded-sm shadow-xl relative flex flex-col justify-between flex-1 ${idx === 1 ? "hidden md:flex" : "flex"}`}
                  >
                    {/* Quote Icon Watermark */}
                    <div className="absolute bottom-10 right-8 text-gray-100 font-serif text-8xl opacity-30 select-none">
                      &rdquo;&rdquo;
                    </div>

                    <p className="text-gray-600 text-sm md:text-[15px] leading-relaxed relative z-10 italic">
                      {item.text}
                    </p>

                    <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-100">
                      {/* Hexagon Profile Container */}
                      <div className="relative w-16 h-16 shrink-0">
                        <div className="absolute inset-0 bg-[#E87B35] rotate-45 rounded-xl"></div>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="absolute inset-0 w-full h-full object-cover p-1 rotate-0 rounded-lg"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#111]">{item.name}</h4>
                        <p className="text-[10px] text-[#5DB4D1] font-bold tracking-widest">
                          {item.role}
                        </p>
                      </div>
                    </div>

                    {/* Speech Bubble Arrow */}
                    <div className="absolute -bottom-4 left-10 w-0 h-0 border-l-[15px] border-l-transparent border-t-[20px] border-t-white border-r-[15px] border-r-transparent"></div>
                  </div>
                ),
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSlider;
