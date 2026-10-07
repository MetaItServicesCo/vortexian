import BreadcrumbHero from "@/components/BreadcrumbHero";
import QuoteForm from "@/components/QuoteForm";
import { getSection, pageMetadata } from "@/lib/content";

export function generateMetadata() {
    return pageMetadata("page.contact", "/contact");
}

export default async function ContactPage() {
    const page = await getSection("page.contact");
    return (
        <main>
            {/* image_e7221c.jpg jaisa hero section breadcrumb ke sath */}
            <BreadcrumbHero
                title={page.hero_title}
                currentPage={page.hero_title}
            />

            {/* image_954e5e.png jaisa form aur details section */}
            <QuoteForm />
        </main>
    );
}