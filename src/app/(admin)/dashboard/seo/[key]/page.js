"use client";

import { useParams } from "next/navigation";
import ContentSectionEditor from "@/components/admin/content/ContentSectionEditor";
import { SECTION_MAP } from "@/content/registry";

export default function EditSeoSection() {
    const { key } = useParams();
    // Only SEO sections live under /dashboard/seo
    const sectionKey = SECTION_MAP[key]?.group === "SEO & Tracking" ? key : null;
    return <ContentSectionEditor sectionKey={sectionKey} backHref="/dashboard/seo" backLabel="SEO & Tracking" />;
}
