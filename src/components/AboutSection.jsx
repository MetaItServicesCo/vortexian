"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import AboutImage from "../../public/assets/images/home-about.jpg";

const AboutSection = () => {
  return (
    <section className="bg-white py-20 px-6 md:px-20 lg:px-32 relative overflow-hidden font-sans">
      {/* Background Subtle Pattern */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/p6-mini.png')]"></div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row  gap-16 relative z-10">
        {/* --- LEFT CONTENT SIDE --- */}
        <motion.div
          initial={{ opacity: 0, x: -150 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="flex-1 space-y-6"
        >
          {/* Small Top Line */}
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 40 }}
            viewport={{ once: false }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="h-[2px] bg-[#5DB4D1]"
          ></motion.div>

          <h2 className="text-4xl md:text-5xl font-extrabold text-[#111] tracking-tight">
            About Us
          </h2>

          <div className="space-y-6 text-gray-700 leading-relaxed text-[15px] md:text-[16px]">
            <p>
              Welcome to <span className="font-bold">Vortexian Tech</span>, your
              all-in-one solution for navigating the complexities of modern
              business. Our diverse range of capabilities encompasses everything
              from payroll management and creative design to marketing
              strategies, technology solutions, and expert consultancy services.
              With a focus on innovation and efficiency, we empower businesses
              to streamline their operations, elevate their brand presence, and
              drive sustainable growth. At{" "}
              <span className="font-bold">Vortexian Tech</span>, we understand
              that every business is unique, which is why we offer tailored
              solutions to meet your specific needs and objectives.
            </p>

            <p>
              Whether you&apos;re looking to optimize your payroll processes,
              unleash your creative potential, amplify your marketing efforts,
              harness the power of technology, or find the right talent to fuel
              your success, our dedicated team is here to guide you every step
              of the way. With our comprehensive capabilities and unwavering
              commitment to excellence, trust Vortexian Tech to be your trusted
              partner in achieving your business goals. At{" "}
              <span className="font-bold">Vortexian Tech</span>, your success is
              our priority, and we are dedicated to turning your challenges into
              opportunities. We pride ourselves on building lasting
              relationships with our clients, driven by trust, transparency, and
              a shared vision for the future. Join us and experience the
              transformative power of innovation and efficiency, propelling your
              business to new heights.
            </p>
          </div>
        </motion.div>

        {/* --- RIGHT IMAGE SIDE (FIXED SCALING SYSTEM) --- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 150 }}
          whileInView={{ opacity: 1, scale: 1, x: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="flex-1 w-full"
        >
        
          <div className="relative w-full h-[350px] md:h-[450px] lg:h-[450px] rounded-[40px] overflow-hidden shadow-2xl border-white border-[10px] bg-slate-50">
            <Image
              src={AboutImage}
              alt="Team Meeting at Vortexian Tech"
              sizes="(max-w-7xl) 50vw, 100vw"
              className="object-cover transform hover:scale-103 transition-transform duration-700 object-center h-full"
              
            />
          </div>

          {/* Floating Decorative Glow Elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#5DB4D1]/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#1D1D7E]/10 rounded-full blur-3xl -z-10"></div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
