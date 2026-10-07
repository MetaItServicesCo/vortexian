"use client";

import { useContent } from "@/components/content/SiteContentProvider";
import { mediaUrl } from "@/lib/api";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroBanner() {
  const banner = useContent("blog.banner");
  if (!banner.visible) return null;

  return (
    <section className="bg-[#f5f5f7] py-16 lg:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-[32px] bg-[#2D145E]"
        >
          {/* Animated Background Shapes */}

          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 40,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -right-40 -top-40 w-[700px] h-[700px] rounded-full border-[100px] border-[#49327a]"
          />

          <motion.div
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 35,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute right-10 top-0 w-[400px] h-[400px] rounded-full border-[70px] border-[#3c246f]"
          />

          <div className="relative z-10 grid lg:grid-cols-2 items-center">
            {/* Left Image */}

            <motion.div
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 1,
                delay: 0.2,
              }}
              className="relative flex justify-center lg:justify-start"
            >
              <motion.div
                animate={{
                  y: [0, -15, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative h-[300px] sm:h-[400px] lg:h-[400px] w-full"
              >
                {banner.image && (
                  // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded image
                  <img
                    src={mediaUrl(banner.image)}
                    alt=""
                    className="absolute inset-0 w-full h-full object-contain object-bottom"
                  />
                )}
              </motion.div>
            </motion.div>

            {/* Right Content */}

            <motion.div
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 1,
                delay: 0.4,
              }}
              className="px-6 pb-12 lg:pb-0 lg:px-12"
            >
              <motion.h2
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{
                  delay: 0.6,
                  duration: 0.8,
                }}
                className="text-white text-2xl md:text-3xl lg:text-5xl font-bold leading-tight"
              >
                {banner.heading}
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.8,
                  duration: 0.8,
                }}
                className="flex flex-col sm:flex-row gap-4 mt-10"
              >
                {/* Hire Button */}

                <motion.div
                  whileHover={{
                    scale: 1.08,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                >
                  <Link
                    href={banner.primary_link || "/contact"}
                    className="inline-flex items-center gap-3 bg-white text-[#2D145E] px-8 py-4 rounded-2xl font-semibold shadow-lg"
                  >
                    {banner.primary_label}
                    <motion.div
                      animate={{
                        x: [0, 5, 0],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                      }}
                    >
                      <ArrowRight size={20} />
                    </motion.div>
                  </Link>
                </motion.div>

                {/* Job Button */}

                <motion.div
                  whileHover={{
                    scale: 1.08,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                >
                  <Link
                    href={banner.secondary_link || "/career"}
                    className="inline-flex items-center gap-3 bg-[#1FC400] text-white px-8 py-4 rounded-2xl font-semibold shadow-lg"
                  >
                    {banner.secondary_label}
                    <motion.div
                      animate={{
                        x: [0, 5, 0],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                      }}
                    >
                      <ArrowRight size={20} />
                    </motion.div>
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
