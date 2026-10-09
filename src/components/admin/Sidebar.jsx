"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiHome,
  FiLayers,
  FiMail,
  FiFileText,
  FiSend,
  FiUsers,
  FiBriefcase,
  FiImage,
  FiInbox,
  FiRss,
  FiStar,
  FiUserCheck,
  FiInfo,
  FiEdit3,
  FiFile,
  FiChevronRight,
  FiLogOut,
  FiTrash2,
} from "react-icons/fi";

const menuItems = [
  { label: "Overview", icon: FiHome, href: "/dashboard" },
  { label: "Basic Info", icon: FiInfo, href: "/dashboard/content/settings" },
  { label: "Site Content", icon: FiEdit3, href: "/dashboard/content" },
  { label: "Pages", icon: FiFile, href: "/dashboard/pages" },
  { label: "Manage Services", icon: FiLayers, href: "/dashboard/services" },
  { label: "Home Page Enquiries", icon: FiMail, href: "/dashboard/quotes" },
  { label: "Quote Requests", icon: FiInbox, href: "/dashboard/contacts" },
  { label: "Newsletter", icon: FiSend, href: "/dashboard/newsletter" },
  { label: "Team Management", icon: FiUsers, href: "/dashboard/team" },
  { label: "Portfolio", icon: FiBriefcase, href: "/dashboard/portfolio" },
  { label: "Blog", icon: FiFileText, href: "/dashboard/blog" },
  { label: "News Feed", icon: FiRss, href: "/dashboard/newsfeed" },
  // { label: "Media Library", icon: FiImage, href: "/dashboard/media" },
  { label: "Testimonials", icon: FiStar, href: "/dashboard/testimonials" },
  { label: "Career", icon: FiUserCheck, href: "/dashboard/career" },
  { label: "Recently deleted", icon: FiTrash2, href: "/dashboard/trash" },
];

// On phones/tablets the sidebar is an off-canvas drawer (open/onClose from the layout)
const Sidebar = ({ open = false, onClose = () => {} }) => {
  const pathname = usePathname();
  // Longest matching prefix wins, so /dashboard/blog/edit/3 highlights "Blog"
  const activeHref = menuItems
    .map((item) => item.href)
    .filter((href) => pathname === href || pathname.startsWith(href + "/"))
    .sort((a, b) => b.length - a.length)[0];
  const router = useRouter();
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin_email");
    router.push("/login");
  };
  return (
    <aside
      id="admin-sidebar"
      className={`fixed inset-y-0 left-0 z-40 w-[280px] h-screen flex flex-col transition-transform duration-200 md:sticky md:top-0 md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"} bg-gradient-to-b from-[#0f0f2d] via-[#1a1a4e] to-[#0e1a3a] border-r border-[#5DB4D1]/10 overflow-hidden`}
    >
      {/* Top glow */}
      <div className="absolute -top-14 -left-14 w-52 h-52 bg-[#5DB4D1]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Logo Section */}
      <div className="px-6 pt-8 pb-6 relative shrink-0">
        <div className="flex items-center gap-3 ">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5DB4D1] to-[#1D1D7E] flex items-center justify-center text-white font-black text-base shadow-lg shadow-[#5DB4D1]/30 shrink-0">
            V
          </div>
          <div>
            <p className="text-white font-extrabold text-sm tracking-widest leading-none">
              VORTEXIAN
            </p>
            <p className="text-[#5DB4D1] text-[9px] font-bold tracking-[0.2em] uppercase mt-1">
              Admin Panel
            </p>
          </div>
        </div>
        <div className="mt-6 h-px bg-gradient-to-r from-[#5DB4D1]/30 to-transparent" />
      </div>

      {/* Section label */}
      <p className="px-6 pb-2 text-[9px] font-bold tracking-[0.18em] uppercase text-white/30 shrink-0">
        Navigation
      </p>

      {/* Nav Items — SCROLLABLE */}
      <nav
        className="flex-1 px-3 flex flex-col gap-1 overflow-y-auto min-h-0
        [&::-webkit-scrollbar]:w-[3px]
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:bg-[#5DB4D1]/20
        [&::-webkit-scrollbar-thumb]:rounded-full
        hover:[&::-webkit-scrollbar-thumb]:bg-[#5DB4D1]/40"
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === activeHref;

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all duration-200 group
                ${
                  isActive
                    ? "bg-gradient-to-r from-[#5DB4D1]/20 to-[#5DB4D1]/5 border-[#5DB4D1]/25"
                    : "border-transparent hover:bg-white/5 hover:border-white/[0.08]"
                }`}
            >
              {isActive && (
                <span className="absolute left-0 top-[20%] h-[60%] w-[3px] bg-[#5DB4D1] rounded-r-full" />
              )}

              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200
                ${
                  isActive
                    ? "bg-[#5DB4D1]/20 text-[#5DB4D1]"
                    : "bg-white/5 text-white/50 group-hover:text-white/70"
                }`}
              >
                <Icon size={15} />
              </div>

              <span
                className={`flex-1 text-[13px] transition-colors duration-200
                ${
                  isActive
                    ? "text-white font-semibold"
                    : "text-white/55 font-medium group-hover:text-white/75"
                }`}
              >
                {item.label}
              </span>

              {isActive && (
                <FiChevronRight size={13} className="text-[#5DB4D1]/70" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions (Log Out) */}
      <div className="px-3 pb-6 pt-4 relative shrink-0">
        <div className="mb-3 h-px bg-gradient-to-r from-[#5DB4D1]/15 to-transparent" />

        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-transparent hover:bg-red-500/[0.08] hover:border-red-500/20 transition-all duration-200 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400/70 group-hover:text-red-400 group-hover:bg-red-500/20 shrink-0 transition-all">
            <FiLogOut size={15} />
          </div>
          <span className="text-red-400/80 text-[13px] font-semibold group-hover:text-red-400 transition-colors duration-200">
            Log Out
          </span>
        </button>
      </div>

      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#1D1D7E]/40 rounded-full blur-3xl pointer-events-none" />
    </aside>
  );
};

export default Sidebar;
