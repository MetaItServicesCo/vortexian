"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";

function getImageUrl(img) {
  if (!img) return "/placeholder-avatar.jpg";
  if (img.startsWith("http")) return img;
  return `${API_BASE}${img}`;
}

export default function TestimonialSlider() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const res = await fetch(`${API_BASE}/api/testimonial/public`, {
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to fetch testimonials");

        const data = await res.json();
        setTestimonials(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log("Testimonial fetch error:", err);
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTestimonials();
  }, []);

  // ---------------- LOADING / EMPTY STATE ----------------
  if (loading) {
    return (
      <section className="bg-[#F8F9FA] py-24 px-6 md:px-20 lg:px-32">
        <div className="max-w-7xl mx-auto text-center text-gray-400 text-sm">
          Loading testimonials...
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null; // koi testimonial nahi hai to section hi hide kar dein
  }

  return (
    <section className="bg-[#F8F9FA] py-24 px-6 md:px-20 lg:px-32 overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* LEFT SIDE */}
        <div className="lg:col-span-4 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-[2px] bg-[#1D1D7E]"></div>

              <span className="text-[#5DB4D1] font-bold text-sm uppercase tracking-widest">
                Our Testimonials
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-[#111] leading-tight">
              What They&apos;re
              <br />
              Talking About us.
            </h2>
          </div>

          {/* Navigation */}
          <div className="flex gap-4">
            <button className="testimonial-prev w-14 h-14 flex items-center justify-center bg-white border border-gray-200 hover:bg-[#1D1D7E] hover:text-white transition-all duration-300 shadow-sm">
              <ArrowLeft size={24} />
            </button>

            <button className="testimonial-next w-14 h-14 flex items-center justify-center bg-gray-500 text-white hover:bg-[#1D1D7E] transition-all duration-300 shadow-sm">
              <ArrowRight size={24} />
            </button>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="lg:col-span-8 relative h-[450px] md:h-[350px]">
          <Swiper
            modules={[Navigation, Autoplay]}
            navigation={{
              prevEl: ".testimonial-prev",
              nextEl: ".testimonial-next",
            }}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            loop={testimonials.length > 1}
            speed={800}
            spaceBetween={24}
            breakpoints={{
              0: {
                slidesPerView: 1,
              },
              768: {
                slidesPerView: 2,
              },
            }}
          >
            {testimonials.map((item) => (
              <SwiperSlide key={item.id} className="pb-8">
                <div className="bg-white p-8 rounded-sm shadow-xl relative flex flex-col justify-between h-[320px]">
                  {/* Quote Icon Watermark */}
                  <div className="absolute bottom-10 right-8 text-gray-100 font-serif text-8xl opacity-30 select-none">
                    &rdquo;&rdquo;
                  </div>

                  <p className="text-gray-600 text-sm md:text-[15px] leading-relaxed relative z-10 italic line-clamp-6">
                    {item.testimonial_text}
                  </p>

                  <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-100">
                    {/* EXACT SAME PROFILE DESIGN */}
                    <div className="relative w-16 h-16 shrink-0">
                      <div className="absolute inset-0 bg-[#E87B35] rotate-45 rounded-xl"></div>

                      <img
                        src={getImageUrl(item.profile_image)}
                        alt={item.full_name}
                        className="absolute inset-0 w-full h-full object-cover p-1 rotate-0 rounded-lg"
                      />
                    </div>

                    <div>
                      <h4 className="font-bold text-[#111]">
                        {item.full_name}
                      </h4>

                      <p className="text-[10px] text-[#5DB4D1] font-bold tracking-widest">
                        {(item.designation || "HAPPY CUSTOMER").toUpperCase()}
                        {item.company ? ` · ${item.company.toUpperCase()}` : ""}
                      </p>
                    </div>
                  </div>

                  {/* EXACT SAME BOTTOM ARROW */}
                  <div className="absolute -bottom-4 left-10 w-0 h-0 border-l-[15px] border-l-transparent border-t-[20px] border-t-white border-r-[15px] border-r-transparent"></div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
