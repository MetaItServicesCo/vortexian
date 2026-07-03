"use client";
import React, { useState } from "react";
import Link from "next/link";
// Dono libraries se icons import karein
import { FaFacebook, FaLinkedinIn } from "react-icons/fa";
import { Mail, Menu, X, ChevronDown } from "lucide-react";
import Logo from "../../public/assets/images/logo-f.png";
import Image from "next/image";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full fixed top-0 z-50 shadow-sm">
      {/* --- TOP BAR --- */}
      <div className="bg-[#5DB4D1] text-white py-2 px-4 md:px-12 flex justify-between items-center text-sm">
        <div className="flex items-center gap-2">
          <Mail size={16} />
          <span className="hidden sm:inline">info@vortexiantech.com</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="#" className="hover:text-gray-200 transition">
            <FaFacebook size={18} />
          </Link>
          <Link href="#" className="hover:text-gray-200 transition">
            {/* Lucide wala Linkedin icon agar use karna hai */}
            <FaLinkedinIn size={18} />
          </Link>
        </div>
      </div>

      {/* --- MAIN NAVIGATION --- */}
      <div className="bg-white py-4 px-4 md:px-12 flex justify-between items-center ">
        {/* Logo Section */}
        <div className="flex items-center">
          <Link href="/">
            <Image
              src={Logo} // Direct import object pass karein, Next.js background mein khud .src nikal lega
              alt="Vortexian Tech Logo"
              width={200} // Pixels dynamic range standard
              height={90}
              priority // Target LCP image optimizations parameters
              className="object-contain w-[200px] h-[90px]"
            />
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8 font-semibold text-[#002B5B]">
          <Link href="/" className="hover:text-[#5DB4D1] transition">
            HOME
          </Link>

          <div className="group relative cursor-pointer flex items-center gap-1 hover:text-[#5DB4D1] transition">
            <Link href="/services">SERVICES</Link> <ChevronDown size={16} />
            <div className="absolute top-full left-0 hidden group-hover:block bg-white shadow-lg p-4 w-48 border-t-2 border-[#5DB4D1]">
              <ul className="flex flex-col gap-2 text-sm text-slate-700">
                <li className="hover:text-[#5DB4D1]">Web Development</li>
                <li className="hover:text-[#5DB4D1]">Digital Marketing</li>
              </ul>
            </div>
          </div>

          <Link href="/career" className="hover:text-[#5DB4D1] transition">
            CAREER
          </Link>

          <div className="group relative cursor-pointer flex items-center gap-1 hover:text-[#5DB4D1] transition">
            ABOUT <ChevronDown size={16} />
            <div className="absolute top-full left-0 hidden group-hover:block bg-white shadow-lg p-4 w-48 border-t-2 border-[#5DB4D1]">
              <ul className="flex flex-col gap-2 text-sm text-slate-700">
                <li className="hover:text-[#5DB4D1]">
                  <Link href="/about">About Us</Link>
                </li>
                <li className="hover:text-[#5DB4D1]">
                  <Link href="/portfolio">Portfolio</Link>
                </li>
                <li className="hover:text-[#5DB4D1]">
                  <Link href="/blog">Blog</Link>
                </li>
              </ul>
            </div>
          </div>

          <Link href="/contact" className="hover:text-[#5DB4D1] transition">
            CONTACT US
          </Link>
        </div>

        {/* Get A Quote Button */}
        <div className="hidden lg:block">
          <Link
            href="/contact"
            className="bg-[#1D1D42] text-white px-8 py-3 font-bold hover:bg-[#5DB4D1] transition uppercase tracking-wider rounded-sm"
          >
            Get A Quote
          </Link>
        </div>

        {/* Mobile Hamburger Icon */}
        <div className="lg:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-[#002B5B] focus:outline-none"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* --- MOBILE MENU --- */}
      {isOpen && (
        <div className="lg:hidden bg-white w-full border-b shadow-xl absolute top-full left-0">
          <div className="flex flex-col p-6 gap-4 font-semibold text-[#002B5B]">
            <Link href="/" onClick={() => setIsOpen(false)}>
              HOME
            </Link>
            <Link href="/services" onClick={() => setIsOpen(false)}>
              SERVICES
            </Link>
            <Link href="/career" onClick={() => setIsOpen(false)}>
              CAREER
            </Link>
            <Link href="/about" onClick={() => setIsOpen(false)}>
              ABOUT
            </Link>
            <Link href="/contact" onClick={() => setIsOpen(false)}>
              CONTACT US
            </Link>
            <button className="bg-[#1D1D42] text-white px-6 py-3 mt-2 font-bold">
              GET A QUOTE
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
