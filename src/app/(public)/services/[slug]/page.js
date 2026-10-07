export const dynamic = "force-dynamic";
export const revalidate = 0;

import { notFound } from "next/navigation";
// import Image from "next/image";
import { cache } from "react";
import { CheckCircle2, Shield, Zap, Target } from "lucide-react";
import BreadcrumbHero from "@/components/BreadcrumbHero";
import { serverApiUrl } from "@/lib/api";
import RichText from "@/components/content/RichText";

// ✅ Direct FastAPI URL, slug se match karo
const getLiveServiceData = cache(async (slug) => {
    try {
        const res = await fetch(
            serverApiUrl(`/api/services/${encodeURIComponent(slug)}`),
            { cache: "no-store" }
        );
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error("Service fetch error:", error);
        return null;
    }
});

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const service = await getLiveServiceData(slug);

    if (!service) {
        return {
            title: "Service Specification | Vortexian Tech",
            description: "Explore enterprise capabilities at Vortexian Tech."
        };
    }

    return {
        title: service.meta_title,                    // ✅
        description: service.meta_description,        // ✅
        keywords: service.keywords || "",             // ✅
        alternates: { canonical: `/services/${service.url_slug}` },
        openGraph: {
            title: service.meta_title,
            description: service.meta_description,
            url: `/services/${slug}`,
            images: [{ url: service.image_showcase_url }],  // ✅
            type: "article"
        },
        twitter: {
            card: "summary_large_image",
            title: service.meta_title,
            description: service.meta_description,
            images: [service.image_showcase_url],     // ✅
        }
    };
}
const getImageUrl = (url) => {
    if (!url) return "https://placehold.co/1200x800?text=Vortexian+Tech";
    if (url.startsWith("/uploads/")) return `${url}`;
    return url;
};
export default async function ServiceDetailPage({ params }) {
    const { slug } = await params;
    const service = await getLiveServiceData(slug);
    console.log("Fetching Slug:", slug);
    console.log("API Response:", service);
    if (!service) notFound();

    // ✅ Features array banana — feature_1/2/3/4 se
    const features = [
        service.feature_1,
        service.feature_2,
        service.feature_3,
        service.feature_4,
    ].filter(Boolean);

    return (
        <main className="bg-gradient-to-tr from-[#65a8bf] via-[#1f215e] to-[#43165b] min-h-screen text-white font-sans selection:bg-[#5DB4D1]/30 relative overflow-hidden">

            <div className="absolute top-[-5%] left-[-10%] w-[60%] h-[40%] rounded-full bg-[#1D1D7E]/15 blur-[140px] pointer-events-none -z-10" />
            <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#5DB4D1]/5 blur-[160px] pointer-events-none -z-10" />

            <BreadcrumbHero
                title={service.service_title?.toUpperCase() || "CAPABILITY OVERVIEW"} // ✅
                currentPage={service.service_title || "Detail View"}
            />

            <section className="py-20 px-4 sm:px-8 md:px-16 lg:px-24 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">

                <div className="lg:col-span-7 space-y-12">

                    <div className="relative h-[260px] sm:h-[420px] w-full rounded-[2.5rem] overflow-hidden border border-white/[0.08] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] group">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#060613]/60 via-transparent to-transparent z-10 pointer-events-none" />
                        <img
                            src={getImageUrl(service.image_showcase_url)}
                            alt={`${service.service_title || "Capability"} showcase`}
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                        />
                    </div>

                    <article className="space-y-4">
                        <h2 className="text-[14px] font-black uppercase text-[#5DB4D1] tracking-[0.2em]">Core Overview</h2>
                        <RichText
                            html={service.long_description}
                            className="rich-content-invert text-base sm:text-lg font-medium"
                        />
                    </article>

                    {features.length > 0 && (
                        <div className="bg-white/[0.08] border border-white/[0.09] p-8 rounded-[2rem] space-y-6 backdrop-blur-lg">
                            <h3 className="text-xl font-extrabold text-white tracking-tight">Technical Operational Features</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {features.map((feature, i) => ( // ✅
                                    <div key={i} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-4 text-[#5DB4D1] shrink-0 mt-0.5" />
                                        <span className="text-[16px] font-semibold text-white/70">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-5 space-y-6">
                    <div className="sticky top-24 bg-gradient-to-b from-white/[0.04] to-transparent p-8 rounded-[2.5rem] border border-white/[0.06] space-y-8 shadow-2xl backdrop-blur-md">
                        <div>
                            <h3 className="text-2xl font-extrabold text-white tracking-tight">Why Choose Vortexian Tech?</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Value Proposition Framework</p>
                        </div>

                        <div className="space-y-6">
                            {service.why_choose_1 && ( // ✅
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#5DB4D1]/10 border border-[#5DB4D1]/20 flex items-center justify-center text-[#5DB4D1] shrink-0">
                                        <Target className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Technical Expertise</h4>
                                        <p className="text-xs text-white/60 mt-1 leading-relaxed font-medium">{service.why_choose_1}</p>
                                    </div>
                                </div>
                            )}

                            {service.why_choose_2 && ( // ✅
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#1D1D7E]/30 border border-[#1D1D7E]/50 flex items-center justify-center text-white/80 shrink-0">
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Scalability Assurance</h4>
                                        <p className="text-xs text-white/60 mt-1 leading-relaxed font-medium">{service.why_choose_2}</p>
                                    </div>
                                </div>
                            )}

                            {service.why_choose_3 && ( // ✅
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 shrink-0">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Quality Operations</h4>
                                        <p className="text-xs text-white/60 mt-1 leading-relaxed font-medium">{service.why_choose_3}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button className="w-full bg-[#1D1D7E] text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#5DB4D1] hover:text-black transition-all duration-300 shadow-xl shadow-blue-950/40 text-xs cursor-pointer">
                            Initiate System Scope
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
}