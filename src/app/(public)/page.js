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

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getServices() {
  try {
    const res = await fetch("https://vortexiantech.com/api/services/", { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function Home() {
    const services = await getServices();
    return (
        <>
            <Hero />
            <RecruitmentBanner />
            <ImageOnlySection />
            <ServicesSection services={services} />
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
