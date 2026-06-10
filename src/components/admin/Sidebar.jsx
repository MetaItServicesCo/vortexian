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
  FiChevronRight,
  FiLogOut,
} from "react-icons/fi";

const menuItems = [
  { label: "Overview", icon: FiHome, href: "/dashboard" },
  { label: "Manage Services", icon: FiLayers, href: "/dashboard/services" }, // Layers icon for services blocks
  { label: "Contact Us", icon: FiMail, href: "/dashboard/quotes" }, // Mail icon for contact quotes/queries
  { label: "Home Page Forum", icon: FiFileText, href: "/dashboard/contacts" }, // FileText icon for form entries
  { label: "Newsletter", icon: FiSend, href: "/dashboard/newsletter" }, // Send/Paper-plane icon for newsletters
  { label: "Team Management", icon: FiUsers, href: "/dashboard/team" }, // Users icon for core team profiles
  { label: "Portfolio", icon: FiBriefcase, href: "/dashboard/portfolio" }, // Briefcase icon for dynamic case studies

  { label: "Media Library", icon: FiImage, href: "/dashboard/media" }, // Image icon for asset file structures
];

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };
  return (
    <aside className="w-[280px] min-h-screen h-screen sticky top-0 flex flex-col bg-gradient-to-b from-[#0f0f2d] via-[#1a1a4e] to-[#0e1a3a] border-r border-[#5DB4D1]/10 overflow-hidden">
      {/* Top glow */}
      <div className="absolute -top-14 -left-14 w-52 h-52 bg-[#5DB4D1]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Logo Section */}
      <div className="px-6 pt-8 pb-6 relative">
        <div className="flex items-center gap-3">
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
      <p className="px-6 pb-2 text-[9px] font-bold tracking-[0.18em] uppercase text-white/30">
        Navigation
      </p>

      {/* Nav Items */}
      <nav className="flex-1 px-3 flex flex-col gap-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all duration-200 group
                ${
                  isActive
                    ? "bg-gradient-to-r from-[#5DB4D1]/20 to-[#5DB4D1]/5 border-[#5DB4D1]/25"
                    : "border-transparent hover:bg-white/5 hover:border-white/[0.08]"
                }`}
            >
              {/* Active left bar indicator */}
              {isActive && (
                <span className="absolute left-0 top-[20%] h-[60%] w-[3px] bg-[#5DB4D1] rounded-r-full" />
              )}

              {/* Icon box */}
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

              {/* Label */}
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

              {/* Arrow on Active */}
              {isActive && (
                <FiChevronRight size={13} className="text-[#5DB4D1]/70" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions (Log Out) */}
      <div className="px-3 pb-6 pt-4 relative">
        <div className="mb-3 h-px bg-gradient-to-r from-[#5DB4D1]/15 to-transparent" />

        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-transparent hover:bg-red-500/[0.08] hover:border-red-500/20 transition-all duration-200 group cursor-pointer"
        >
          {/* Logout Icon Box */}
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400/70 group-hover:text-red-400 group-hover:bg-red-500/20 shrink-0 transition-all">
            <FiLogOut size={15} />
          </div>

          {/* Logout Label */}
          <span className="text-red-400/80 text-[13px] font-semibold group-hover:text-red-400 transition-colors duration-200">
            Log Out
          </span>
        </button>
      </div>

      {/* Bottom decorative glow */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#1D1D7E]/40 rounded-full blur-3xl pointer-events-none" />
    </aside>
  );
};

export default Sidebar;
