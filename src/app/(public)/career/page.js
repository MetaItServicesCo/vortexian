import BreadcrumbHero from "@/components/BreadcrumbHero";
import CareerForm from "@/components/CareerForm";
import { getSection, pageMetadata } from "@/lib/content";
import SchemaMarkup from "@/components/seo/SchemaMarkup";
import HiringImpact from "@/components/HiringImpact";

// --- SEO METADATA ---
export function generateMetadata() {
    return pageMetadata("page.career", "/career");
}

export default async function CareerPage() {
    const [page, hiring] = await Promise.all([getSection("page.career"), getSection("hiring_stats")]);
    return (
        <main>
            {/* image_e7221c.jpg jaisa design apply karne ke liye props pass karein */}
            <SchemaMarkup sectionKey="page.career" path="/career" />
            <BreadcrumbHero
                title={page.hero_title}
                currentPage={page.hero_title}
            />

            <CareerForm />
            <HiringImpact data={hiring} page="career" />
        </main>
    );
}