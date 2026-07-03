import BreadcrumbHero from "@/components/BreadcrumbHero";
import CtaBanner from "@/components/CtaBanner";
import PortfolioGrid from "@/components/portfolio/PortfolioGrid";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getLivePortfolioData() {
    try {
        const res = await fetch("https://vortexiantech.com/api/portfolio/", { cache: "no-store",
            method: "GET",
            headers: {
                "Accept": "application/json",
            },
            next: { revalidate: 0 },
            cache: "no-store"
        });

        if (!res.ok) {
            console.error(`Backend Server Error: Status ${res.status}`);
            return [];
        }

        return await res.json();
    } catch (error) {
        console.error("Critical Exception fetching portfolio streams from API:", error);
        return [];
    }
}

// ==========================================
// DYNAMIC SEO METADATA FOR GOOGLE BOT
// ==========================================
export async function generateMetadata() {
    const projects = await getLivePortfolioData();

    // Map keywords from active database nodes
    const dbKeywords = projects
        .map(p => p.meta_keywords)
        .filter(Boolean)
        .join(", ");
        
    const baseKeywords = "Portfolio, Vortexian Tech, Web Development Projects, Case Studies, UI/UX Showcases";
    const combinedKeywords = dbKeywords ? `${baseKeywords}, ${dbKeywords}` : baseKeywords;

    // Map description from latest project for dynamic context
    const dynamicDescription = projects[0]?.meta_description || 
        "Explore our elite range of projects in web development, serverless applications, enterprise platforms, and custom digital architectures.";

    return {
        title: "Portfolio | Vortexian Tech - Showcasing Digital Excellence",
        description: dynamicDescription.substring(0, 160), // Google prefers max 160 chars
        keywords: combinedKeywords,
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/portfolio`,
        },
        openGraph: {
            title: "Portfolio | Vortexian Tech - Showcasing Excellence",
            description: dynamicDescription.substring(0, 160),
            url: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/portfolio`,
            type: "website",
            images: [
                {
                    url: projects[0]?.primary_image ? `${projects[0].primary_image}` : "/og-image.jpg",
                    width: 1200,
                    height: 630,
                    alt: "Vortexian Tech Portfolio Overlay",
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: "Portfolio | Vortexian Tech",
            description: dynamicDescription.substring(0, 160),
        }
    };
}

export default async function PortfolioPage() {
    const liveProjects = await getLivePortfolioData();

    return (
        <main>
            {/* Structural Breadcrumb */}
            <BreadcrumbHero
                title="PORTFOLIO"
                currentPage="PORTFOLIO"
            />

            {/* Injected Server side fetched dataset directly passed to layout client grid */}
            <PortfolioGrid initialProjects={liveProjects} />

            <CtaBanner />
        </main>
    );
}