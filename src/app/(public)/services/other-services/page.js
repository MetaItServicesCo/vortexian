import { notFound } from "next/navigation";
import BreadcrumbHero from "@/components/BreadcrumbHero";
import ServicesClient from "@/components/servicepage/ServicesClient";
import { getJson } from "@/lib/content";
import { OTHER_SERVICES_PATH, otherServices } from "@/lib/otherServices";

// Services menu → "Other Services": every service in the "Others" category (Dashboard → Manage
// Services, with "Show in Services menu" on), as cards linking to their pages.
export const dynamic = "force-dynamic";

const TITLE = "Other Services";
const DESCRIPTION = "More services from Vortexian Tech. Explore each one and get in touch for a free quote.";

export function generateMetadata() {
    return {
        title: `${TITLE} | Vortexian Tech`,
        description: DESCRIPTION,
        alternates: { canonical: OTHER_SERVICES_PATH },
        openGraph: { title: `${TITLE} | Vortexian Tech`, description: DESCRIPTION, url: OTHER_SERVICES_PATH },
    };
}

export default async function OtherServicesPage() {
    const [menu, services] = await Promise.all([getJson("/api/services/menu-tree", []), getJson("/api/services/", [])]);
    const list = otherServices(menu, services);
    if (!list.length) notFound();

    return (
        <div className="bg-gradient-to-tr from-[#a5a5e1] via-[#1a2b31] to-[#151b5b] min-h-screen text-white font-sans relative overflow-hidden">
            <BreadcrumbHero title={TITLE.toUpperCase()} currentPage={TITLE} trail={[{ label: "Services", href: "/services" }]} />
            <section className="py-24 px-4 sm:px-8 md:px-16 lg:px-24 max-w-[1400px] mx-auto relative z-10">
                <ServicesClient servicesData={list} showTabs={false} />
            </section>
        </div>
    );
}
