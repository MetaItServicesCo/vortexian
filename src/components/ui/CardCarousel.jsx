"use client";
import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Keyboard, Parallax } from "swiper/modules";
import "swiper/css";
import { ArrowLeft, ArrowRight } from "lucide-react";

// Swipeable row of cards used by the home page sections (Our Services, Employee Perks):
// 3 cards on desktop, 2 on tablet, 1 + a peek of the next on phones; drag/swipe, arrows,
// keyboard, accent progress bar. Cards rise in together the first time the row scrolls into
// view; cards out of view wait smaller and fainter and grow in as they arrive (globals.css).
// Elements with data-swiper-parallax inside a card drift while swiping. Reduced motion: still.
// tone: "light" (on light backgrounds) or "dark" (on the navy background).
const BUTTON = {
  light: "border-gray-300 bg-white text-[#1D1D7E] shadow-sm hover:bg-[#1D1D7E] hover:text-white hover:border-[#1D1D7E] disabled:hover:bg-white disabled:hover:text-[#1D1D7E] disabled:hover:border-gray-300",
  dark: "border-white/30 bg-white/5 text-white hover:bg-white hover:text-[#1D1D7E] hover:border-white disabled:hover:bg-white/5 disabled:hover:text-white disabled:hover:border-white/30",
};
const TRACK = { light: "bg-gray-300/70", dark: "bg-white/20" };

export default function CardCarousel({ items, renderItem, label, itemName = "items", tone = "light", getKey = (_, i) => i }) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef(null);
  const swiperRef = useRef(null);
  const progressRef = useRef(null);
  const shown = useInView(rootRef, { once: true, margin: "-80px" });
  const [ends, setEnds] = useState({ start: true, end: false });

  const sync = (swiper) => {
    if (progressRef.current) progressRef.current.style.transform = `scaleX(${Math.max(0.04, Math.min(1, swiper.progress || 0))})`;
    setEnds({ start: swiper.isBeginning, end: swiper.isEnd });
  };
  const buttonClass = `w-12 h-12 flex items-center justify-center rounded-full border transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#5DB4D1]/50 disabled:opacity-35 disabled:cursor-not-allowed ${BUTTON[tone]}`;

  return (
    <div ref={rootRef} className="card-carousel" role="region" aria-roledescription="carousel" aria-label={label}>
      <Swiper
        modules={[Keyboard, A11y, Parallax]}
        slidesPerView="auto"
        spaceBetween={16}
        breakpoints={{ 768: { spaceBetween: 20 } }}
        speed={reduceMotion ? 0 : 750}
        parallax={!reduceMotion}
        grabCursor
        watchSlidesProgress
        keyboard={{ enabled: true, onlyInViewport: true }}
        onSwiper={(swiper) => { swiperRef.current = swiper; }}
        onInit={sync}
        onSlideChange={sync}
        onProgress={sync}
        onResize={sync}
        className="!overflow-visible md:!overflow-hidden"
      >
        {items.map((item, index) => (
          <SwiperSlide key={getKey(item, index)} className="card-slide">
            <motion.div
              className="h-full"
              initial={reduceMotion ? false : { opacity: 0, y: 48 }}
              animate={reduceMotion || shown ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.7, delay: Math.min(index, 4) * 0.09, ease: [0.22, 1, 0.36, 1] }}
            >
              {renderItem(item, index)}
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="mt-8 flex items-center gap-5">
        <div className={`relative h-[3px] flex-1 overflow-hidden rounded-full ${TRACK[tone]}`} aria-hidden="true">
          <span ref={progressRef} className="absolute inset-y-0 left-0 w-full origin-left bg-[#5DB4D1] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ transform: "scaleX(0.04)" }} />
        </div>
        <div className="flex shrink-0 gap-3">
          <button type="button" aria-label={`Previous ${itemName}`} disabled={ends.start} onClick={() => swiperRef.current?.slidePrev()} className={buttonClass}>
            <ArrowLeft size={20} />
          </button>
          <button type="button" aria-label={`Next ${itemName}`} disabled={ends.end} onClick={() => swiperRef.current?.slideNext()} className={buttonClass}>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
