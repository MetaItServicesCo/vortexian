import BreadcrumbHero from "@/components/BreadcrumbHero";
import CareerForm from "@/components/CareerForm";
import { getSection, pageMetadata } from "@/lib/content";

// --- SEO METADATA ---
export function generateMetadata() {
    return pageMetadata("page.career", "/career");
}

export default async function CareerPage() {
    const page = await getSection("page.career");
    return (
        <main>
            {/* image_e7221c.jpg jaisa design apply karne ke liye props pass karein */}
            <BreadcrumbHero
                title={page.hero_title}
                currentPage={page.hero_title}
            />

            <CareerForm />
        </main>
    );
}