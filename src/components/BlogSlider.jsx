"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import {
  User,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Calendar,
  FileText,
} from "lucide-react";
import { getPublicBlogs, blogImageUrl } from "@/lib/api/blog";

import "swiper/css";
import "swiper/css/navigation";

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/* Loading placeholder that mirrors the real card's shape */
const SkeletonCard = () => (
  <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden flex flex-col min-h-[460px] h-full">
    <div className="h-48 bg-gray-100 animate-pulse" />
    <div className="p-8 md:p-10 flex flex-col flex-grow">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-10 h-10 bg-gray-100 rounded-full animate-pulse" />
        <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
      </div>
      <div className="h-5 w-full bg-gray-100 rounded animate-pulse mb-2" />
      <div className="h-5 w-4/5 bg-gray-100 rounded animate-pulse mb-5" />
      <div className="space-y-2">
        <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
        <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
        <div className="h-3 w-2/3 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
  </div>
);

const BlogSlider = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await getPublicBlogs();
        if (cancelled) return;

        const list = Array.isArray(data) ? data : [];
        // Newest first — the API's order isn't guaranteed.
        list.sort(
          (a, b) =>
            new Date(b.created_at || 0) - new Date(a.created_at || 0) ||
            (b.id || 0) - (a.id || 0),
        );
        setPosts(list);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Couldn't load blog posts.");
        console.error("[BlogSlider] fetch failed:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Swiper's loop breaks (and warns) when there are fewer slides than
  // slidesPerView, so only enable it once there's enough to actually rotate.
  const canLoop = posts.length > 3;

  const Header = (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-center mb-2 gap-6">
        <div className="text-left">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-[2px] bg-[#1D1D7E]" />
            <span className="text-[#5DB4D1] font-bold text-sm uppercase tracking-widest">
              From The Blog
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black max-w-[600px] text-[#111] tracking-tight leading-[1.1]">
            Latest News &amp; Articles from the Blog.
          </h2>
        </div>
      </div>

      {posts.length > 1 && (
        <div className="flex gap-3 self-start md:self-end z-20">
          <button
            type="button"
            aria-label="Previous"
            className="swiper-prev-btn w-12 h-12 rounded-xl border border-gray-200 bg-white text-gray-600 flex items-center justify-center hover:bg-[#1D1D7E] hover:text-white hover:border-[#1D1D7E] transition-all duration-300 cursor-pointer shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            aria-label="Next"
            className="swiper-next-btn w-12 h-12 rounded-xl border border-gray-200 bg-white text-gray-600 flex items-center justify-center hover:bg-[#1D1D7E] hover:text-white hover:border-[#1D1D7E] transition-all duration-300 cursor-pointer shadow-sm"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </>
  );

  return (
    <section className="bg-white py-20 px-6 md:px-20 lg:px-32 font-sans overflow-hidden relative">
      <div className="max-w-7xl mx-auto">
        {Header}

        <div className="relative overflow-visible">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <p className="text-gray-500">{error}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="py-16 text-center">
              <FileText className="mx-auto text-gray-300" size={40} />
              <p className="text-gray-500 mt-3 font-medium">
                No articles published yet.
              </p>
            </div>
          ) : (
            <Swiper
              modules={[Autoplay, Navigation]}
              spaceBetween={32}
              slidesPerView={1}
              loop={canLoop}
              speed={600}
              allowTouchMove
              grabCursor
              navigation={{
                prevEl: ".swiper-prev-btn",
                nextEl: ".swiper-next-btn",
              }}
              autoplay={
                canLoop
                  ? {
                      delay: 4000,
                      disableOnInteraction: false,
                      pauseOnMouseEnter: true,
                    }
                  : false
              }
              breakpoints={{
                768: { slidesPerView: Math.min(2, posts.length) },
                1024: { slidesPerView: Math.min(3, posts.length) },
              }}
              className="standard-blog-swiper"
            >
              {posts.map((post) => {
                const href = `/blog/${post.slug}`;
                const image = blogImageUrl(post.featured_image);

                return (
                  <SwiperSlide key={post.id} className="h-auto py-4">
                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden flex flex-col min-h-[460px] transition-all duration-500 hover:-translate-y-2 hover:border-[#5DB4D1]/40 hover:shadow-[0_20px_40px_-15px_rgba(93,180,209,0.15)] group h-full">
                      {/* Cover */}
                      <Link
                        href={href}
                        className="block relative h-48 bg-gray-100 overflow-hidden"
                      >
                        {image ? (
                          <img
                            src={image}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText className="text-gray-300" size={32} />
                          </div>
                        )}

                        {post.category && (
                          <span className="absolute top-4 left-4 bg-white/95 backdrop-blur text-[#1D1D7E] text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                            {post.category}
                          </span>
                        )}
                      </Link>

                      {/* Body */}
                      <div className="p-8 md:p-10 flex flex-col flex-grow">
                        <div className="flex items-center gap-2 mb-5">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 overflow-hidden border-2 border-white shadow-sm transition-transform duration-500 group-hover:scale-105">
                            <User size={20} />
                          </div>
                          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                            by{" "}
                            <span className="text-[#5DB4D1] font-extrabold transition-colors duration-300 group-hover:text-[#1D1D7E]">
                              {post.author || "admin"}
                            </span>
                          </span>
                        </div>

                        <Link href={href}>
                          <h3 className="text-xl md:text-2xl font-black text-[#1D1D7E] leading-tight mb-4 hover:text-[#5DB4D1] cursor-pointer transition-colors duration-300 line-clamp-3">
                            {post.title}
                          </h3>
                        </Link>

                        <p className="text-sm text-gray-600 leading-relaxed flex-grow font-medium line-clamp-5">
                          {post.excerpt}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="bg-[#F8F9FA] px-8 py-5 flex justify-between items-center text-[10px] font-black tracking-widest uppercase border-t border-gray-50 mt-auto transition-colors duration-300 group-hover:bg-slate-50">
                        <Link
                          href={href}
                          className="flex items-center gap-2 text-[#5DB4D1] font-black transition-colors duration-300 group-hover:text-[#1D1D7E] cursor-pointer"
                        >
                          <ArrowRight
                            size={14}
                            className="transition-transform duration-300 group-hover:translate-x-1.5"
                          />{" "}
                          Read More
                        </Link>

                        {post.created_at && (
                          <span className="flex items-center gap-2 text-gray-400 font-black">
                            <Calendar size={13} />
                            {formatDate(post.created_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          )}
        </div>
      </div>
    </section>
  );
};

export default BlogSlider;