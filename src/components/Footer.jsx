"use client";
import React from "react";
import Link from "next/link";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaInstagram,
  FaPinterestP,
  FaWhatsapp,
} from "react-icons/fa";
import { Mail } from "lucide-react";
import FooterNewsletterBox from "./FooterNewsletterBox";

const Footer = () => {
  return (
    <footer className="bg-[#111111] text-white relative overflow-hidden">
      {/* Background Pattern Overlay (Optional - image_803b5c.png ke background jesa look dene ke liye) */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

      {/* --- TOP CONTACT BAR --- */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-around items-center md:items-center gap-6">
          {/* WhatsApp */}
          <div className="flex items-center w-full md:w-auto max-w-xs md:max-w-none mx-auto md:mx-0 gap-4 group cursor-pointer">
            <div className="w-14 h-14 flex items-center justify-center border-2 border-[#5DB4D1] rounded-full text-[#5DB4D1] shrink-0 group-hover:bg-[#5DB4D1] group-hover:text-white transition-all duration-300">
              <FaWhatsapp size={26} />
            </div>
            <span className="text-base sm:text-lg font-medium break-all text-left">
              +92-(3354)-018789
            </span>
          </div>

          {/* Email */}
          <div className="flex items-center w-full md:w-auto max-w-xs md:max-w-none mx-auto md:mx-0 gap-4 group cursor-pointer">
            <div className="w-14 h-14 flex items-center justify-center border-2 border-[#5DB4D1] rounded-full text-[#5DB4D1] shrink-0 group-hover:bg-[#5DB4D1] group-hover:text-white transition-all duration-300">
              <Mail size={26} />
            </div>
            <span className="text-base sm:text-lg font-medium break-all text-left">
              info@vortexiantech.com
            </span>
          </div>
        </div>
      </div>

      {/* --- MAIN FOOTER CONTENT --- */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 relative z-10">
        {/* About Section */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold border-l-4 border-[#5DB4D1] pl-3">
            About
          </h3>
          <p className="text-gray-400 leading-relaxed max-w-sm">
            We work with a passion of taking challenges and creating new ones in
            advertising sector.
          </p>
          <div className="flex gap-3">
            {[FaFacebookF, FaLinkedinIn, FaInstagram, FaPinterestP].map(
              (Icon, index) => (
                <Link
                  key={index}
                  href="#"
                  className="w-10 h-10 rounded-full bg-black border border-gray-700 flex items-center justify-center hover:bg-[#5DB4D1] hover:border-[#5DB4D1] transition-all duration-300"
                >
                  <Icon size={16} />
                </Link>
              ),
            )}
          </div>

          {/* Registered By Section */}
          <div className="pt-6 space-y-4">
            <h4 className="font-semibold text-gray-300 uppercase tracking-wider text-sm">
              Registered by
            </h4>
            <div className="flex gap-4 items-center">
              {/* Placeholder logos for FBR and SECP */}
              <div className="bg-white/10 p-2 rounded backdrop-blur-sm">
                <img
                  src="/assets/images/257769.svg"
                  alt="FBR"
                  className="h-14 object-contain"
                />
              </div>
              <div className="bg-white/10 p-2 rounded backdrop-blur-sm">
                <img
                  src="/assets/images/SECP-Logo.png"
                  alt="SECP"
                  className="h-14 object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Explore Section */}
        <div className="space-y-6 lg:pl-12">
          <h3 className="text-xl font-bold border-l-4 border-[#5DB4D1] pl-3">
            Explore
          </h3>
          <ul className="space-y-4 text-gray-400">
            <li>
              <Link href="/career" className="hover:text-[#5DB4D1] transition">
                Careers
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-[#5DB4D1] transition">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-[#5DB4D1] transition">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter Section */}
        <FooterNewsletterBox />
      </div>

      {/* --- COPYRIGHT BAR --- */}
      <div className="bg-black py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>
            © 2025 Vortexian Tech | Designed & Developed By Primemax Digital
          </p>
          <div className="flex items-center gap-4">
            {/* Floating Chat Icon placeholder (Bottom Left in image) */}
            <div className="bg-white text-black p-2 rounded-full cursor-pointer hover:bg-[#5DB4D1] transition">
              <Mail size={18} />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
