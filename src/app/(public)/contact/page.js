import BreadcrumbHero from "@/components/BreadcrumbHero";
import QuoteForm from "@/components/QuoteForm";

export const metadata = {
    title: "Contact Us | Vortexian Tech - Get A Quote",
    description: "Reach out to Vortexian Tech for advanced IT solutions and expert consultancy. Request a quote for your project today.",
};

export default function ContactPage() {
    return (
        <main>
            {/* image_e7221c.jpg jaisa hero section breadcrumb ke sath */}
            <BreadcrumbHero
                title="CONTACT US"
                currentPage="CONTACT US"
            />

            {/* image_954e5e.png jaisa form aur details section */}
            <QuoteForm />
        </main>
    );
}