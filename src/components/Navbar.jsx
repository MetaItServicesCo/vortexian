"use client";
import React, { useState } from "react";
import Link from "next/link";
import { FaFacebook, FaLinkedinIn, FaInstagram, FaXTwitter, FaYoutube } from "react-icons/fa6";
import { Mail, Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import { useContent, useServicesMenu, useSettings } from "@/components/content/SiteContentProvider";
import { mediaUrl } from "@/lib/api";
import { OTHER_SERVICES_PATH, hasOwnCards } from "@/lib/otherServices";

const TOP_BAR_SOCIALS = [
  { key: "facebook", Icon: FaFacebook, label: "Facebook" },
  { key: "linkedin", Icon: FaLinkedinIn, label: "LinkedIn" },
  { key: "instagram", Icon: FaInstagram, label: "Instagram" },
  { key: "twitter", Icon: FaXTwitter, label: "X" },
  { key: "youtube", Icon: FaYoutube, label: "YouTube" },
];

const linksToServices = (item) => (item.href || "").replace(/\/+$/, "") === "/services";

// The menu item linking to /services lists the categories switched on in
// Dashboard → Categories, each opening its services ("Show in Services menu"
// on). Category names aren't links. "Others" is one "Other Services" link to
// /other-services, which lists those services (and the cards added in
// Dashboard → Other Services Page). The Header setting "Services dropdown lists
// your services automatically" turns this off (hand-made links instead).
function withServicesDropdown(menu, header, groups, hasOwnOtherCards) {
  if (header.services_menu_auto === false) return menu;
  const serviceLink = (s) => ({ label: s.service_title, href: `/services/${encodeURIComponent(s.url_slug)}` });
  const main = groups.filter((g) => g.name !== "Others");
  const children = main.map((g) => ({ label: g.name, children: g.services.map(serviceLink) }));
  if (main.length < groups.length || hasOwnOtherCards) children.push({ label: "Other Services", href: OTHER_SERVICES_PATH });
  return menu.map((item) => (linksToServices(item) ? { ...item, children } : item));
}

// Menu items may have no link of their own (dropdown-only parents)
function MenuLink({ href, children, ...props }) {
  if (!href) return <span {...props}>{children}</span>;
  return <Link href={href} {...props}>{children}</Link>;
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const settings = useSettings();
  const header = useContent("header");
  const servicesMenu = useServicesMenu();
  const otherServices = useContent("other_services");
  const menu = withServicesDropdown(header.menu || [], header, servicesMenu, hasOwnCards(otherServices));
  const socials = TOP_BAR_SOCIALS.filter((s) => settings[s.key]);

  return (
    <nav className="w-full fixed top-0 z-50 shadow-sm">
      {/* --- TOP BAR --- */}
      {header.show_top_bar && (
        <div className="bg-[#5DB4D1] text-white py-2 px-4 md:px-12 flex justify-between items-center text-sm min-h-9">
          <div className="flex items-center gap-2">
            {settings.email && (
              <>
                <Mail size={16} />
                <a href={`mailto:${settings.email}`} className="hidden sm:inline hover:text-gray-200">
                  {settings.email}
                </a>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            {socials.map(({ key, Icon, label }) => (
              <a key={key} href={settings[key]} target="_blank" rel="noopener noreferrer" aria-label={label} className="hover:text-gray-200 transition">
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* --- MAIN NAVIGATION --- */}
      <div className="bg-white py-4 px-4 md:px-12 flex justify-between items-center ">
        {/* Logo Section */}
        <div className="flex items-center">
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element -- logo is admin-uploaded */}
            <img
              src={mediaUrl(settings.logo, "/assets/images/logo-f.png")}
              alt={settings.logo_alt || `${settings.site_name} logo`}
              width={200}
              height={90}
              className="object-contain w-[200px] h-[90px]"
            />
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8 font-semibold text-[#002B5B]">
          {menu.map((item, i) =>
            item.children?.length ? (
              <div key={i} className="group relative cursor-pointer flex items-center gap-1 hover:text-[#5DB4D1] transition">
                <MenuLink href={item.href}>{item.label}</MenuLink> <ChevronDown size={16} />
                <div className="absolute top-full left-0 hidden group-hover:block group-focus-within:block bg-white shadow-lg p-4 min-w-48 w-max max-w-64 border-t-2 border-[#5DB4D1]" data-menu-level="1">
                  <ul className="flex flex-col gap-2 text-sm text-slate-700">
                    {item.children.map((child, j) =>
                      child.children?.length ? (
                        // Category: hover (or focus) opens its services to the right
                        <li key={j} className="group/sub relative" data-menu-category="">
                          <span tabIndex={0} className="flex items-center justify-between gap-3 hover:text-[#5DB4D1] outline-none focus:text-[#5DB4D1]">
                            {child.label} <ChevronRight size={14} aria-hidden="true" />
                          </span>
                          <div className="absolute left-full -top-4 hidden group-hover/sub:block group-focus-within/sub:block pl-4">
                            <ul className="flex flex-col gap-2 bg-white shadow-lg p-4 min-w-52 w-max max-w-72 border-t-2 border-[#5DB4D1]" data-menu-level="2">
                              {child.children.map((grand, k) => (
                                <li key={k} className="hover:text-[#5DB4D1]">
                                  <MenuLink href={grand.href}>{grand.label}</MenuLink>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </li>
                      ) : (
                        <li key={j} className="hover:text-[#5DB4D1]">
                          <MenuLink href={child.href}>{child.label}</MenuLink>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            ) : (
              <MenuLink key={i} href={item.href} className="hover:text-[#5DB4D1] transition">
                {item.label}
              </MenuLink>
            )
          )}
        </div>

        {/* Get A Quote Button */}
        {header.cta_label && (
          <div className="hidden lg:block">
            <Link
              href={header.cta_link || "/contact"}
              className="inline-block bg-[#1D1D42] text-white px-8 py-3 font-bold hover:bg-[#5DB4D1] transition uppercase tracking-wider"
            >
              {header.cta_label}
            </Link>
          </div>
        )}

        {/* Mobile Hamburger Icon */}
        <div className="lg:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className="text-[#002B5B] focus:outline-none"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* --- MOBILE MENU --- */}
      {isOpen && (
        <div className="lg:hidden bg-white w-full border-b shadow-xl absolute top-full left-0 max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col p-6 gap-4 font-semibold text-[#002B5B]">
            {menu.map((item, i) => (
              <div key={i} className="flex flex-col gap-2">
                <MenuLink href={item.href} onClick={() => setIsOpen(false)}>
                  {item.label}
                </MenuLink>
                {item.children?.map((child, j) =>
                  child.children?.length ? (
                    <div key={j} className="pl-4 flex flex-col gap-2" data-menu-category="">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{child.label}</span>
                      {child.children.map((grand, k) => (
                        <MenuLink key={k} href={grand.href} onClick={() => setIsOpen(false)} className="pl-3 text-sm font-medium text-slate-600">
                          {grand.label}
                        </MenuLink>
                      ))}
                    </div>
                  ) : (
                    <MenuLink key={j} href={child.href} onClick={() => setIsOpen(false)} className="pl-4 text-sm font-medium text-slate-600">
                      {child.label}
                    </MenuLink>
                  )
                )}
              </div>
            ))}
            {header.cta_label && (
              <Link
                href={header.cta_link || "/contact"}
                onClick={() => setIsOpen(false)}
                className="bg-[#1D1D42] text-white px-6 py-3 mt-2 font-bold text-center uppercase"
              >
                {header.cta_label}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
