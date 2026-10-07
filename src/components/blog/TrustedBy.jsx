"use client";
import { useContent } from "@/components/content/SiteContentProvider";
import { mediaUrl } from "@/lib/api";

export default function TrustedBy() {
  const section = useContent("blog.trusted");
  const logos = (section.logos || []).filter((logo) => logo.name || logo.image);
  if (!section.visible || logos.length === 0) return null;

  return (
    <section className="bg-white border-y border-gray-200 py-10">
      <div className="max-w-7xl mx-auto px-5">
        <p className="text-center text-xs uppercase tracking-[4px] text-gray-400 mb-8">
          {section.heading}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {logos.map((logo, i) => (
            <div
              key={i}
              className="flex items-center justify-center text-center text-gray-400 font-semibold hover:text-[#6B21D4] transition"
            >
              {logo.image ? (
                // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded logo
                <img src={mediaUrl(logo.image)} alt={logo.image_alt || logo.name || ""} className="max-h-12 object-contain" />
              ) : (
                logo.name
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
