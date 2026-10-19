"use client";

import React, { useEffect, useState } from "react";
import { mediaUrl } from "@/lib/api";
import { useContent } from "@/components/content/SiteContentProvider";
import CardCarousel from "@/components/ui/CardCarousel";

// Shown until testimonials are added from the admin dashboard
const fallbackTestimonials = [
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

function toSlide(t) {
  const role = [t.client_designation, t.company].filter(Boolean).join(", ");
  return {
    id: t.id,
    text: t.testimonial_text,
    name: t.client_name,
    imageAlt: t.profile_image_alt || t.client_name,
    role: role ? role.toUpperCase() : "HAPPY CUSTOMER",
    image: mediaUrl(
      t.profile_image,
      `https://ui-avatars.com/api/?name=${encodeURIComponent(t.client_name)}&background=1D1D7E&color=fff`
    ),
  };
}

export default function TestimonialSlider() {
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);
  const section = useContent("home.testimonials");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/testimonials/", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setTestimonials(data.map(toSlide));
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  if (!section.visible) return null;

  return (
    <section className="bg-[#F8F9FA] py-24 px-6 md:px-20 lg:px-32 overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* LEFT SIDE */}
        <div className="lg:col-span-4 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-[2px] bg-[#5DB4D1]"></div>

              <span className="text-[#5DB4D1] font-bold text-sm uppercase tracking-widest">
                {section.eyebrow}
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-[#111] leading-tight whitespace-pre-line">
              {section.heading}
            </h2>
          </div>
        </div>

        {/* RIGHT SIDE: same carousel as the other home sections; moves on its own (pause button, pauses on hover) */}
        <div className="lg:col-span-8 min-w-0">
          <CardCarousel
            key={testimonials.map((t) => t.id).join("-")}
            items={testimonials}
            getKey={(item) => item.id}
            label={(section.heading || "Testimonials").replace(/\s+/g, " ")}
            itemName="testimonials"
            perView={2}
            autoplay={5000}
            renderItem={(item) => (
              <div className="h-full pb-6">
                <div className="bg-white p-8 rounded-sm shadow-xl relative flex flex-col justify-between h-full min-h-[320px]" data-testimonial-card="">
                  {/* Quote Icon Watermark */}
                  <div className="absolute bottom-10 right-8 text-gray-100 font-serif text-8xl opacity-30 select-none" aria-hidden="true">
                    &rdquo;&rdquo;
                  </div>

                  <p className="text-gray-600 text-sm md:text-[15px] leading-relaxed relative z-10 italic">
                    {item.text}
                  </p>

                  <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-100">
                    {/* EXACT SAME PROFILE DESIGN */}
                    <div className="relative w-16 h-16 shrink-0">
                      <div className="absolute inset-0 bg-[#E87B35] rotate-45 rounded-xl"></div>

                      {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded or external avatar */}
                      <img
                        src={item.image}
                        alt={item.imageAlt || item.name}
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

                  {/* EXACT SAME BOTTOM ARROW */}
                  <div className="absolute -bottom-4 left-10 w-0 h-0 border-l-[15px] border-l-transparent border-t-[20px] border-t-white border-r-[15px] border-r-transparent"></div>
                </div>
              </div>
            )}
          />
        </div>
      </div>
    </section>
  );
}
