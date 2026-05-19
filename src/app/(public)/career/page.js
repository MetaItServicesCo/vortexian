import BreadcrumbHero from "@/components/BreadcrumbHero";
import CareerForm from "@/components/CareerForm";

// --- SEO METADATA ---
export const metadata = {
    title: "Careers | Vortexian Tech - Join Our Professional Team",
    description: "Explore career opportunities at Vortexian Tech. We are looking for talented developers, designers, and innovators to join our countrywide projects.",
    keywords: "Vortexian Tech Careers, Jobs in Tech, Web Development Jobs, Hiring Developers",
};

export default function CareerPage() {
    return (
        <main>
            {/* image_e7221c.jpg jaisa design apply karne ke liye props pass karein */}
            <BreadcrumbHero
                title="CAREER"
                currentPage="CAREER"
            />

            <CareerForm />
        </main>
    );
}