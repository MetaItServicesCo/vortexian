"use client";
import React from "react";
import Link from "next/link";
import { useContent } from "@/components/content/SiteContentProvider";
import { mediaUrl } from "@/lib/api";

const ImageOnlySection = () => {
  const banner = useContent("home.banner");
  if (!banner.visible || !banner.image) return null;

  const image = (
    // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded banner of unknown size
    <img
      src={mediaUrl(banner.image)}
      alt={banner.alt || ""}
      className="w-full max-w-[1920px] h-auto object-cover block"
    />
  );

  return (
    <section className="w-full h-auto bg-white overflow-visible flex items-start justify-center">
      {banner.link ? <Link href={banner.link} className="w-full flex justify-center">{image}</Link> : image}
    </section>
  );
};

export default ImageOnlySection;
