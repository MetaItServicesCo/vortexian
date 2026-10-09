"use client";

import { useParams } from "next/navigation";
import ContentSectionEditor from "@/components/admin/content/ContentSectionEditor";

export default function EditContentSection() {
    const { key } = useParams();
    return <ContentSectionEditor sectionKey={key} />;
}
