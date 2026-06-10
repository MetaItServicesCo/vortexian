import AboutSection from "@/components/AboutSection";
import BlogSlider from "@/components/BlogSlider";
import ContactSection from "@/components/ContactSection";
import CtaBanner from "@/components/CtaBanner";
import EmployeePerks from "@/components/EmployeePerks";
import Hero from "@/components/Hero";
import ImageOnlySection from "@/components/ImageOnlySection";
import NewsDrawerWrapper from "@/components/NewsDrawerWrapper";
import RecruitmentBanner from "@/components/RecruitmentBanner";
import ServicesSection from "@/components/ServicesSection";
import StatsSection from "@/components/StatsSection";
import TestimonialSlider from "@/components/TestimonialSlider";

export default function Home() {
    return (
        <>
            <Hero />
            <RecruitmentBanner />
            <ImageOnlySection />
            <ServicesSection />
            <AboutSection />
            <EmployeePerks />
            <StatsSection />
            <TestimonialSlider />
            <BlogSlider />
            <ContactSection />
            <CtaBanner />
            <NewsDrawerWrapper />
        </>
    );
}
