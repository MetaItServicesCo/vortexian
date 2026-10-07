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
import { useSettings } from "@/components/content/SiteContentProvider";

const SocialFloatingButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const settings = useSettings();

  // Only channels with a value in Basic Info are shown
  const socials = [
    settings.phone && {
      label: "Call us",
      icon: <FaPhoneAlt size={20} />,
      color: "bg-emerald-500",
      link: `tel:${settings.phone.replace(/[^\d+]/g, "")}`,
    },
    settings.whatsapp && {
      label: "WhatsApp",
      icon: <FaWhatsapp size={20} />,
      color: "bg-green-500",
      link: `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`,
    },
    settings.messenger && {
      label: "Messenger",
      icon: <FaFacebookMessenger size={20} />,
      color: "bg-blue-600",
      link: settings.messenger,
    },
    settings.linkedin && { label: "LinkedIn", icon: <FaLinkedinIn size={20} />, color: "bg-sky-700", link: settings.linkedin },
  ].filter(Boolean);

  if (socials.length === 0) return null;

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
                aria-label={item.label}
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
        aria-label={isOpen ? "Close contact options" : "Open contact options"}
        className="p-4 bg-black text-white rounded-full shadow-2xl hover:bg-gray-800 transition-all active:scale-90"
      >
        {isOpen ? <FaTimes size={24} /> : <FaCommentDots size={24} />}
      </button>
    </div>
  );
};

export default SocialFloatingButton;
