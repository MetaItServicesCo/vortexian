"use client";
import React, { useState } from "react";
import {
  FaPhoneAlt,
  FaWhatsapp,
  FaFacebookMessenger,
  FaLinkedinIn,
  FaTimes,
  FaCommentDots,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const SocialFloatingButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const socials = [
    {
      icon: <FaPhoneAlt size={20} />,
      color: "bg-emerald-500",
      link: "tel:+923000000000",
    },
    {
      icon: <FaWhatsapp size={20} />,
      color: "bg-green-500",
      link: "https://wa.me/yournumber",
    },
    {
      icon: <FaFacebookMessenger size={20} />,
      color: "bg-blue-600",
      link: "#",
    },
    { icon: <FaLinkedinIn size={20} />, color: "bg-sky-700", link: "#" },
  ];

  return (
    <div className="fixed bottom-20 left-6 z-50 flex flex-col items-center gap-3">
      {/* Social Icons List (Show/Hide with Animation) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="flex flex-col gap-3 mb-2"
          >
            {socials.map((item, index) => (
              <a
                key={index}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-4 text-white rounded-full shadow-lg ${item.color} transition-transform hover:scale-110`}
              >
                {item.icon}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 bg-black text-white rounded-full shadow-2xl hover:bg-gray-800 transition-all active:scale-90"
      >
        {isOpen ? <FaTimes size={24} /> : <FaCommentDots size={24} />}
      </button>
    </div>
  );
};

export default SocialFloatingButton;
