import BreadcrumbHero from "@/components/BreadcrumbHero";
import ServicesClient from "@/components/servicepage/ServicesClient";

// Helper function to fetch data for both Metadata and the Page Component Natively
async function fetchServicesData() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/services`, {
            cache: "no-store",
        });
        if (!res.ok) return [];
        return await res.json();
    } catch (error) {
        console.error("Metadata / Page pipeline fetch exception:", error);
        return [];
    }
}

// ==========================================
// DYNAMIC METADATA (Keywords synced with DB Schema Arrays)
// ==========================================
export async function generateMetadata() {
    const services = await fetchServicesData();

    // SAFE FIX: Extract all explicit nested SEO keywords from every document safely
    const dbKeywords = services.flatMap(s => s.seo?.keywords || s.title || []);

    // Premium core keywords fallback framework
    const baseKeywords = ["Vortexian Tech", "IT Capabilities", "Enterprise Solutions", "Full Stack Development"];

    // Combine, clean up, and remove any accidental empty strings or duplicates
    const finalKeywordsSet = new Set([...baseKeywords, ...dbKeywords]);
    const combinedKeywords = Array.from(finalKeywordsSet).filter(Boolean).join(", ");

    return {
        title: "Enterprise Solutions & IT Capabilities | Vortexian Tech",
        description: "Explore our technical and creative digital capabilities. From cutting-edge UX/UI system models to server-side web development configurations.",
        keywords: combinedKeywords, // Now fully mapped directly to your database nested array structure!
        openGraph: {
            title: "Enterprise Solutions & IT Capabilities | Vortexian Tech",
            description: "Explore our technical and creative digital capabilities.",
            url: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/services`,
        }
    };
}

export const revalidate = 0;

export default async function ServicesPage() {
    const activeServices = await fetchServicesData();
    const processingError = activeServices.length === 0;

    return (
        /* --- INDUSTRY LEVEL PREMIUM LINEAR GRADIENT --- */
        <div className="bg-gradient-to-tr from-[#a5a5e1] via-[#1a2b31] to-[#151b5b] min-h-screen text-white font-sans selection:bg-[#5DB4D1]/30 relative overflow-hidden">

            {/* Ambient Lights Backdrop Meshes */}
            <div className="absolute top-[-5%] left-[-10%] w-[60%] h-[50%] rounded-full bg-[#1D1D7E]/20 blur-[140px] pointer-events-none -z-10 animate-pulse duration-[6000ms]" />
            <div className="absolute top-[35%] right-[-15%] w-[45%] h-[45%] rounded-full bg-[#5DB4D1]/8 shadow-[0_0_120px_rgba(93,180,209,0.05)] blur-[160px] pointer-events-none -z-10" />
            <div className="absolute bottom-[5%] left-[-5%] w-[40%] h-[40%] rounded-full bg-[#14143a]/40 blur-[120px] pointer-events-none -z-10" />

            {/* Existing Dynamic Header */}
            <BreadcrumbHero title="Our Services" currentPage="Services" />

            {/* Main Content Area Container */}
            <section className="py-24 px-4 sm:px-8 md:px-16 lg:px-24 max-w-[1400px] mx-auto relative z-10">

                {/* Modern Brand Intro Header blocks */}
                <div className="max-w-3xl mb-20">
                    <p className="text-[#5DB4D1] text-[10px] font-black tracking-[0.3em] uppercase mb-4">
                        Capabilities & Systems
                    </p>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white uppercase leading-[0.95]">
                        Transforming Concepts into <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5DB4D1] to-[#1D1D7E]">Elite Architectures</span>
                    </h1>
                    <p className="text-gray-400 mt-6 text-sm sm:text-base md:text-lg font-medium leading-relaxed max-w-2xl">
                        We decoupled from standard outdated WordPress frameworks to deliver staggering serverless speed, layout configuration flexibility, and pure organic positioning.
                    </p>
                </div>

                {/* --- API LIVE DATA INTEGRATION LAYER --- */}
                {processingError ? (
                    <div className="w-full text-center py-20 bg-white/[0.02] border border-white/[0.05] rounded-[2rem] backdrop-blur-sm">
                        <p className="text-sm font-black uppercase text-[#5DB4D1] tracking-widest">
                            System Node Alert
                        </p>
                        <p className="text-gray-400 text-sm mt-2 font-medium">
                            Temporary pipeline bottleneck. Failed to sync enterprise capability profiles.
                        </p>
                    </div>
                ) : (
                    /* Injecting decoupled animated client component with real MongoDB records dataset */
                    <ServicesClient servicesData={activeServices} />
                )}

            </section>
        </div>
    );
}