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
import { serverApiUrl } from "@/lib/api";
import SchemaMarkup from "@/components/seo/SchemaMarkup";

export const dynamic = "force-dynamic";

export const metadata = {
  alternates: { canonical: "/" },
};
export const revalidate = 0;

async function getList(path) {
  try {
    const res = await fetch(serverApiUrl(path), { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function Home() {
    const [services, blogs] = await Promise.all([
        getList("/api/services/"),
        getList("/api/blog/public"),
    ]);
    return (
        <>
            <SchemaMarkup sectionKey="seo.schema" field="home_schema_json" path="/" />
            <Hero />
            <RecruitmentBanner />
            <ImageOnlySection />
            <ServicesSection services={services} />
            <AboutSection />
            <EmployeePerks />
            <StatsSection />
            <TestimonialSlider />
            <BlogSlider posts={blogs} />
            <ContactSection />
            <CtaBanner />
            <NewsDrawerWrapper />
        </>
    );
}
