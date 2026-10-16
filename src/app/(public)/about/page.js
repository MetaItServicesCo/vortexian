import BreadcrumbHero from "@/components/BreadcrumbHero";
import AboutSection from "@/components/AboutSection";
import StatsSection from "@/components/StatsSection";
import TestimonialSlider from "@/components/TestimonialSlider";
import CeoMessage from "@/components/CeoMessage";
import WhoWeAre from "@/components/WhoWeAre";
import WhyChooseUs from "@/components/WhyChooseUs";
import TeamSlider from "@/components/TeamSlider";
import { getSection, pageMetadata } from "@/lib/content";
import SchemaMarkup from "@/components/seo/SchemaMarkup";
import HiringImpact from "@/components/HiringImpact";

// SEO Metadata
export function generateMetadata() {
    return pageMetadata("page.about", "/about");
}

export default async function AboutPage() {
    const [page, hiring] = await Promise.all([getSection("page.about"), getSection("hiring_stats")]);
    return (
        <main>
            {/* 1. Hero Section (Same as Career but with About Title) */}
            <SchemaMarkup sectionKey="page.about" path="/about" />
            <BreadcrumbHero
                title={page.hero_title}
                currentPage={page.hero_title}
            />

            <CeoMessage />
            <WhoWeAre />
            <WhyChooseUs />
            <HiringImpact data={hiring} page="about" />
            <TeamSlider />
        </main>
    );
}