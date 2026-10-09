"use client";

import ContentSectionEditor from "@/components/admin/content/ContentSectionEditor";
import NewsletterHeader, { useNewsletterStatus } from "@/components/admin/newsletter/NewsletterHeader";

export default function NewsletterSettings() {
    const status = useNewsletterStatus();
    return (
        <div className="p-6 md:p-10">
            <NewsletterHeader status={status} />
            <ContentSectionEditor sectionKey="newsletter.settings" backHref="/dashboard/newsletter" backLabel="Newsletter" />
        </div>
    );
}
