"use client";
import React from "react";
import Link from "next/link";
import { useContent } from "@/components/content/SiteContentProvider";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import {
  User,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Import Swiper production structural styles
import "swiper/css";
import "swiper/css/navigation";

// Shown until blog posts are published from the admin dashboard
const fallbackPosts = [
  {
    id: 1,
    author: "admin",
    title:
      "10 Best Ways 20four7VA Email & Calendar Management Transform Your Productivity",
    excerpt:
      "Why Email & Calendar Management Is a Game-Changer In 2025, time is your most valuable asset. Entrepreneurs, executives, and remote teams are juggling endless emails, meetings, and tasks, often losing hours to administrative chaos. What if you could reclaim that time and focus on what truly drives your success?",
  },
  {
    id: 2,
    author: "admin",
    title: "Top 10 Issues Faced by Digital Marketing Agencies 2025",
    excerpt:
      "In this article, we explore the Top 10 Issues Faced by Digital Marketing Agencies 2025, offering actionable insights to help you streamline operations, enhance client satisfaction, and stay ahead of the competition. Whether you're a seasoned agency leader or an emerging player, these strategies will empower you.",
  },
  {
    id: 3,
    author: "admin",
    title: "10 Best HR Outsourcing Services & Companies in USA",
    excerpt:
      "Navigating HR outsourcing can be daunting, especially when managing payroll, compliance, and employee relations. To simplify your search, we've evaluated the Top 10 HR outsourcing Services providers Companies In USA that excel in streamlining processes, ensuring compliance, and empowering businesses.",
  },
  {
    id: 4,
    author: "admin",
    title: "Future of AI in Web Development",
    excerpt:
      "Exploring how artificial intelligence is reshaping the landscape of modern web design and coding practices in the upcoming year. AI engines are automating component mapping, rendering structural layout patterns, and mutating continuous lifecycle operational loops natively.",
  },
];

const BlogSlider = ({ posts = [] }) => {
  const section = useContent("home.blog");
  const hasLivePosts = posts.length > 0;
  const blogPosts = hasLivePosts ? posts.slice(0, 8) : fallbackPosts;

  if (!section.visible) return null;

  return (
    <section className="bg-white py-20 px-6 md:px-20 lg:px-32 font-sans overflow-hidden relative">
      <div className="max-w-7xl mx-auto">
        {/* --- HEADER PANELS WITH NAVIGATION CONTROLS --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-center mb-2 gap-6">
          <div className="text-left">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-[2px] bg-[#1D1D7E]"></div>
              <span className="text-[#5DB4D1] font-bold text-sm uppercase tracking-widest">
                {section.eyebrow}
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black max-w-[600px] text-[#111] tracking-tight leading-[1.1]">
              {section.heading}
            </h2>
          </div>

          {/* Premium Minimalist Arrow Triggers */}
        </div>
        <div className="flex gap-3 self-start md:self-end z-20">
          <button className="swiper-prev-btn w-12 h-12 rounded-xl border border-gray-200 bg-white text-gray-600 flex items-center justify-center hover:bg-[#1D1D7E] hover:text-white hover:border-[#1D1D7E] transition-all duration-300 cursor-pointer shadow-sm">
            <ChevronLeft size={20} />
          </button>
          <button className="swiper-next-btn w-12 h-12 rounded-xl border border-gray-200 bg-white text-gray-600 flex items-center justify-center hover:bg-[#1D1D7E] hover:text-white hover:border-[#1D1D7E] transition-all duration-300 cursor-pointer shadow-sm">
            <ChevronRight size={20} />
          </button>
        </div>
        {/* --- STANDARD SLIDE CAROUSEL (Stop & Go Mode) --- */}
        <div className="relative overflow-visible">
          {/* REMOVED INLINE JSX COMMENTS TO FIX COMPILER ERRORS */}
          <Swiper
            modules={[Autoplay, Navigation]}
            spaceBetween={32}
            slidesPerView={1}
            loop={true}
            speed={600}
            allowTouchMove={true}
            grabCursor={true}
            navigation={{
              prevEl: ".swiper-prev-btn",
              nextEl: ".swiper-next-btn",
            }}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="standard-blog-swiper"
          >
            {blogPosts.map((post) => (
              <SwiperSlide key={post.id} className="h-auto py-4">
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden flex flex-col min-h-[460px] transition-all duration-500 hover:-translate-y-2 hover:border-[#5DB4D1]/40 hover:shadow-[0_20px_40px_-15px_rgba(93,180,209,0.15)] group h-full">
                  {/* Card Content Layer */}
                  <div className="p-8 md:p-10 flex flex-col flex-grow">
                    {/* Author Section */}
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 overflow-hidden border-2 border-white shadow-sm transition-transform duration-500 group-hover:scale-105">
                        <User size={20} />
                      </div>
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                        by{" "}
                        <span className="text-[#5DB4D1] font-extrabold transition-colors duration-300 group-hover:text-[#1D1D7E]">
                          {post.author}
                        </span>
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl md:text-2xl font-black text-[#1D1D7E] leading-tight mb-4 hover:text-[#5DB4D1] transition-colors duration-300 line-clamp-3">
                      <Link href={hasLivePosts ? `/blog/${post.id}` : "/blog"}>
                        {post.title}
                      </Link>
                    </h3>

                    {/* Excerpt */}
                    <p className="text-sm text-gray-600 leading-relaxed flex-grow font-medium line-clamp-5">
                      {post.excerpt}
                    </p>
                  </div>

                  {/* Footer Action Bars */}
                  <div className="bg-[#F8F9FA] px-8 py-5 flex justify-between items-center text-[10px] font-black tracking-widest uppercase border-t border-gray-50 mt-auto transition-colors duration-300 group-hover:bg-slate-50">
                    <Link
                      href={hasLivePosts ? `/blog/${post.id}` : "/blog"}
                      className="flex items-center gap-2 text-[#5DB4D1] font-black transition-colors duration-300 group-hover:text-[#1D1D7E]"
                    >
                      <ArrowRight
                        size={14}
                        className="transition-transform duration-300 group-hover:translate-x-1.5"
                      />{" "}
                      Read More
                    </Link>
                    {post.category && (
                      <span className="text-gray-400">{post.category}</span>
                    )}
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

export default BlogSlider;
