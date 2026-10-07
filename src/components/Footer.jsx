"use client";
import React from "react";
import Link from "next/link";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaInstagram,
  FaPinterestP,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { Mail, Phone, MapPin } from "lucide-react";
import FooterNewsletterBox from "./FooterNewsletterBox";
import { useContent, useFooterPages, useSettings } from "@/components/content/SiteContentProvider";
import { mediaUrl } from "@/lib/api";

const SOCIALS = [
  { key: "facebook", Icon: FaFacebookF, label: "Facebook" },
  { key: "linkedin", Icon: FaLinkedinIn, label: "LinkedIn" },
  { key: "instagram", Icon: FaInstagram, label: "Instagram" },
  { key: "pinterest", Icon: FaPinterestP, label: "Pinterest" },
  { key: "twitter", Icon: FaXTwitter, label: "X" },
  { key: "youtube", Icon: FaYoutube, label: "YouTube" },
];

const linkClass = "hover:text-[#5DB4D1] transition";

const Footer = () => {
  const settings = useSettings();
  const footer = useContent("footer");
  const pages = useFooterPages();
  const socials = SOCIALS.filter((s) => settings[s.key]);
  const copyright = (footer.copyright || "").replace("{year}", new Date().getFullYear());
  const whatsappHref = settings.whatsapp ? `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}` : null;

  return (
    <footer className="bg-[#111111] text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

      {/* --- TOP CONTACT BAR --- */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-around items-center gap-6">
          {settings.phone && (
            <a href={whatsappHref || `tel:${settings.phone}`} target={whatsappHref ? "_blank" : undefined} rel="noopener noreferrer" className="flex items-center gap-4 group">
              <div className="p-3 border-2 border-[#5DB4D1] rounded-full text-[#5DB4D1] group-hover:bg-[#5DB4D1] group-hover:text-white transition-all duration-300">
                {whatsappHref ? <FaWhatsapp size={24} /> : <Phone size={24} />}
              </div>
              <span className="text-lg font-medium">{settings.phone}</span>
            </a>
          )}

          {settings.email && (
            <a href={`mailto:${settings.email}`} className="flex items-center gap-4 group">
              <div className="p-3 border-2 border-[#5DB4D1] rounded-full text-[#5DB4D1] group-hover:bg-[#5DB4D1] group-hover:text-white transition-all duration-300">
                <Mail size={24} />
              </div>
              <span className="text-lg font-medium">{settings.email}</span>
            </a>
          )}

          {settings.address && (
            <div className="flex items-center gap-4">
              <div className="p-3 border-2 border-[#5DB4D1] rounded-full text-[#5DB4D1]">
                <MapPin size={24} />
              </div>
              <span className="text-base font-medium whitespace-pre-line max-w-xs">{settings.address}</span>
            </div>
          )}
        </div>
      </div>

      {/* --- MAIN FOOTER CONTENT --- */}
      <div className={`max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10 ${pages.length ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
        {/* About Section */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold border-l-4 border-[#5DB4D1] pl-3">
            {footer.about_heading}
          </h3>
          <p className="text-gray-400 leading-relaxed max-w-sm whitespace-pre-line">
            {footer.about_text}
          </p>
          {socials.length > 0 && (
            <div className="flex gap-3">
              {socials.map(({ key, Icon, label }) => (
                <a
                  key={key}
                  href={settings[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-full bg-black border border-gray-700 flex items-center justify-center hover:bg-[#5DB4D1] hover:border-[#5DB4D1] transition-all duration-300"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          )}

          {footer.registered_logos?.length > 0 && (
            <div className="pt-6 space-y-4">
              <h4 className="font-semibold text-gray-300 uppercase tracking-wider text-sm">
                {footer.registered_heading}
              </h4>
              <div className="flex gap-4 items-center flex-wrap">
                {footer.registered_logos.map((logo, i) => (
                  <div key={i} className="bg-white/10 p-2 rounded backdrop-blur-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded logo */}
                    <img src={mediaUrl(logo.image)} alt={logo.alt || ""} className="h-14 object-contain" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Explore Section */}
        <div className="space-y-6 lg:pl-12">
          <h3 className="text-xl font-bold border-l-4 border-[#5DB4D1] pl-3">
            {footer.explore_heading}
          </h3>
          <ul className="space-y-4 text-gray-400">
            {(footer.explore_links || []).map((link, i) => (
              <li key={i}>
                <Link href={link.href || "/"} className={linkClass}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Custom pages (legal etc.), managed under Dashboard → Pages */}
        {pages.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold border-l-4 border-[#5DB4D1] pl-3">
              {footer.pages_heading}
            </h3>
            <ul className="space-y-4 text-gray-400">
              {pages.map((page) => (
                <li key={page.slug}>
                  <Link href={`/${page.slug}`} className={linkClass}>{page.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Newsletter Section */}
        <FooterNewsletterBox heading={footer.newsletter_heading} text={footer.newsletter_text} />
      </div>

      {/* --- COPYRIGHT BAR --- */}
      <div className="bg-black py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>{copyright}</p>
          {settings.email && (
            <a href={`mailto:${settings.email}`} aria-label="Email us" className="bg-white text-black p-2 rounded-full hover:bg-[#5DB4D1] transition">
              <Mail size={18} />
            </a>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
