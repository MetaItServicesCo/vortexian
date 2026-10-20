export const dynamic = "force-dynamic";
export const revalidate = 0;

import { notFound, redirect } from "next/navigation";
// import Image from "next/image";
import { cache } from "react";
import BreadcrumbHero from "@/components/BreadcrumbHero";
import { serverApiUrl } from "@/lib/api";
import SchemaMarkup from "@/components/seo/SchemaMarkup";
import ServiceSections from "@/components/services/ServiceSections";
import { faqSchema, parseLayout } from "@/lib/serviceLayout";
import { getJson, getSection } from "@/lib/content";
import { OTHER_SERVICES_PATH, isOtherService } from "@/lib/otherServices";

// Next.js passes the segment still percent-encoded ("web%20dev"); decode before
// re-encoding or the backend receives "web%2520dev" and returns 404.
function safeDecode(value) {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

// ✅ Direct FastAPI URL, slug se match karo
const getLiveServiceData = cache(async (slug) => {
    try {
        const res = await fetch(
            serverApiUrl(`/api/services/${encodeURIComponent(safeDecode(slug))}`),
            { cache: "no-store" }
        );
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error("Service fetch error:", error);
        return null;
    }
});

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const service = await getLiveServiceData(slug);

    if (!service) {
        return {
            title: "Service Specification | Vortexian Tech",
            description: "Explore enterprise capabilities at Vortexian Tech."
        };
    }

    return {
        title: service.meta_title,                    // ✅
        description: service.meta_description,        // ✅
        keywords: service.keywords || "",             // ✅
        alternates: { canonical: `/services/${service.url_slug}` },
        openGraph: {
            title: service.meta_title,
            description: service.meta_description,
            url: `/services/${slug}`,
            images: [{ url: service.image_showcase_url }],  // ✅
            type: "article"
        },
        twitter: {
            card: "summary_large_image",
            title: service.meta_title,
            description: service.meta_description,
            images: [service.image_showcase_url],     // ✅
        }
    };
}
export default async function ServiceDetailPage({ params }) {
    const { slug } = await params;
    const [service, settings, categories] = await Promise.all([getLiveServiceData(slug), getSection("settings"), getJson("/api/categories/?kind=service", [])]);
    if (!service) notFound();
    // "Others" services are cards on the Other Services page only (temporary redirect, so the
    // page works again if the service is moved to a main category)
    if (isOtherService(service, categories)) redirect(OTHER_SERVICES_PATH);

    // FAQ sections also become FAQ results data for Google (unless this service has its own schema)
    const faq = service.schema_json ? null : faqSchema(parseLayout(service.layout).filter((b) => !b.hidden));

    return (
        <main className="bg-white text-slate-800 font-sans selection:bg-[#5DB4D1]/30">
            <SchemaMarkup kind="service" item={service} path={`/services/${encodeURIComponent(service.url_slug)}`} custom={service.schema_json} />
            {faq && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq).replace(/</g, "\\u003c") }} />}
            <BreadcrumbHero
                title={service.service_title?.toUpperCase() || "CAPABILITY OVERVIEW"}
                currentPage={service.service_title || "Detail View"}
                trail={[{ label: "Services", href: "/services" }]}
            />
            <ServiceSections service={service} phone={settings?.phone} />
        </main>
    );
}
