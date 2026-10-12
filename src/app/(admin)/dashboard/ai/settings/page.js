"use client";

import ContentSectionEditor from "@/components/admin/content/ContentSectionEditor";

export default function AIAssistantSettings() {
    return <ContentSectionEditor sectionKey="ai.assistant" backHref="/dashboard/ai" backLabel="AI Assistant" />;
}
