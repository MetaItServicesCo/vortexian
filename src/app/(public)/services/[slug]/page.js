import { notFound } from "next/navigation";
import Image from "next/image";
import { cache } from "react"; // FIXED: React cache engine imported for Request Deduplication
import { CheckCircle2, Shield, Zap, Target } from "lucide-react";
import BreadcrumbHero from "@/components/BreadcrumbHero";

// ==========================================
// REQUEST DEDUPLICATOR ENGINE (Crucial for TTFB & SEO)
// ==========================================
// Wrapping fetch logic inside cache eliminates double data load pipelines completely
const getLiveServiceData = cache(async (slug) => {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

        // Fetch calling explicit server backend layout mapping
        const res = await fetch(`${baseUrl}/api/services`, { cache: "no-store" });
        if (!res.ok) return null;

        const allServices = await res.json();
        return allServices.find((s) => s.slug === slug) || null;
    } catch (error) {
        console.error("Pipeline breakdown fetching structural slug data:", error);
        return null;
    }
});

// ==========================================
// 1. GENERATE DYNAMIC METADATA (Perfect Programmatic SEO)
// ==========================================
export async function generateMetadata({ params }) {
    const { slug } = await params;
    const service = await getLiveServiceData(slug); // Hit 1: Triggers API and saves data in cache

    if (!service || !service.seo) {
        return {
            title: "Service Specification | Vortexian Tech",
            description: "Explore enterprise capabilities at Vortexian Tech."
        };
    }

    return {
        title: service.seo.title,
        description: service.seo.description,
        keywords: service.seo.keywords?.join(", ") || "",
        openGraph: {
            title: service.seo.title,
            description: service.seo.description,
            url: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/services/${slug}`,
            images: [{ url: service.image }],
            type: "article" // Added openGraph type for absolute article layout indexing hierarchy
        },
        twitter: { // Added Twitter Card meta mapping to improve multi-channel crawl scoring
            card: "summary_large_image",
            title: service.seo.title,
            description: service.seo.description,
            images: [service.image],
        }
    };
}

// ==========================================
// 2. MAIN CORE SERVICE DETAIL PAGE RENDERER
// ==========================================
export default async function ServiceDetailPage({ params }) {
    const { slug } = await params;
    const service = await getLiveServiceData(slug); // Hit 2: Returns instantly from React memory cache layer (0ms delay)

    // Fallback straight into 404 router if query validation returns empty node record state
    if (!service) {
        notFound();
    }

    return (
        /* --- BRAND MATCHED METALLIC SPACE GRADIENT --- */
        <main className="bg-gradient-to-tr from-[#65a8bf] via-[#1f215e] to-[#43165b] min-h-screen text-white font-sans selection:bg-[#5DB4D1]/30 relative overflow-hidden">

            {/* Ambient Background Mesh Lights */}
            <div className="absolute top-[-5%] left-[-10%] w-[60%] h-[40%] rounded-full bg-[#1D1D7E]/15 blur-[140px] pointer-events-none -z-10" />
            <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#5DB4D1]/5 blur-[160px] pointer-events-none -z-10" />

            {/* Dynamic Breadcrumb Optimization */}
            <BreadcrumbHero
                title={service.title ? service.title.toUpperCase() : "CAPABILITY OVERVIEW"}
                currentPage={service.title || "Detail View"}
            />

            {/* Structured Info Blocks Split Panel Arrangement */}
            <section className="py-20 px-4 sm:px-8 md:px-16 lg:px-24 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">

                {/* Core Layout Content Pane */}
                <div className="lg:col-span-7 space-y-12">

                    {/* --- HIGH-END FEATURE IMAGE SHOWCASE --- */}
                    <div className="relative h-[260px] sm:h-[420px] w-full rounded-[2.5rem] overflow-hidden border border-white/[0.08] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] group">
                        {/* Glassmorphic Inner Vignette Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#060613]/60 via-transparent to-transparent z-10 pointer-events-none" />
                        <Image
                            src={service.image || "https://placehold.co/1200x800?text=Vortexian+Tech"}
                            alt={`${service.title || "Capability"} architectural core interface`}
                            fill
                            priority
                            className="object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                        />
                    </div>

                    {/* Content Section Structured inside dynamic article tags for clean semantic hierarchy scoring */}
                    <article className="space-y-4">
                        <h2 className="text-[14px] font-black uppercase text-[#5DB4D1] tracking-[0.2em]">Core Overview</h2>
                        <p className="text-white/80 text-base sm:text-lg leading-relaxed font-medium">
                            {service.longDesc}
                        </p>
                    </article>

                    {/* Capabilities Target Bullet Loops */}
                    {service.features && service.features.length > 0 && (
                        <div className="bg-white/[0.08] border border-white/[0.09] p-8 rounded-[2rem] space-y-6 backdrop-blur-lg">
                            <h3 className="text-xl font-extrabold text-white tracking-tight">Technical Operational Features</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {service.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-4 text-[#5DB4D1] shrink-0 mt-0.5" />
                                        <span className="text-[16px] font-semibold text-white/70">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Value Matrix Panels */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="sticky top-24 bg-gradient-to-b from-white/[0.04] to-transparent p-8 rounded-[2.5rem] border border-white/[0.06] space-y-8 shadow-2xl backdrop-blur-md">
                        <div>
                            <h3 className="text-2xl font-extrabold text-white tracking-tight">Why Choose Vortexian Tech?</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Value Proposition Framework</p>
                        </div>

                        {/* Micro Feature Matrices */}
                        <div className="space-y-6">
                            {service.whyChoose?.expertise && (
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#5DB4D1]/10 border border-[#5DB4D1]/20 flex items-center justify-center text-[#5DB4D1] shrink-0">
                                        <Target className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Technical Expertise</h4>
                                        <p className="text-xs text-white/60 mt-1 leading-relaxed font-medium">{service.whyChoose.expertise}</p>
                                    </div>
                                </div>
                            )}

                            {service.whyChoose?.scalability && (
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#1D1D7E]/30 border border-[#1D1D7E]/50 flex items-center justify-center text-white/80 shrink-0">
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Scalability Assurance</h4>
                                        <p className="text-xs text-white/60 mt-1 leading-relaxed font-medium">{service.whyChoose.scalability}</p>
                                    </div>
                                </div>
                            )}

                            {service.whyChoose?.quality && (
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 shrink-0">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Quality Operations</h4>
                                        <p className="text-xs text-white/60 mt-1 leading-relaxed font-medium">{service.whyChoose.quality}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Premium CTA Block */}
                        <button className="w-full bg-[#1D1D7E] text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#5DB4D1] hover:text-black transition-all duration-300 shadow-xl shadow-blue-950/40 text-xs cursor-pointer">
                            Initiate System Scope
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
}