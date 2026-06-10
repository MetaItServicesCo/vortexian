import BreadcrumbHero from "@/components/BreadcrumbHero";
import AboutSection from "@/components/AboutSection";
import StatsSection from "@/components/StatsSection";
import TestimonialSlider from "@/components/TestimonialSlider";
import CeoMessage from "@/components/CeoMessage";
import WhoWeAre from "@/components/WhoWeAre";
import WhyChooseUs from "@/components/WhyChooseUs";
import TeamSlider from "@/components/TeamSlider";

// SEO Metadata
export const metadata = {
    title: "About Us | Vortexian Tech - Our Story & Mission",
    description: "Learn more about Vortexian Tech. We are a team of expert developers and strategists dedicated to providing innovative business solutions.",
};

export default function AboutPage() {
    return (
        <main>
            {/* 1. Hero Section (Same as Career but with About Title) */}
            <BreadcrumbHero
                title="ABOUT US"
                currentPage="ABOUT US"
            />

            <CeoMessage />
            <WhoWeAre />
            <WhyChooseUs />
            <TeamSlider />
        </main>
    );
}