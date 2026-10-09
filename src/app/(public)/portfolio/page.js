import BreadcrumbHero from "@/components/BreadcrumbHero";
import CtaBanner from "@/components/CtaBanner";
import PortfolioGrid from "@/components/portfolio/PortfolioGrid";
import { serverApiUrl } from "@/lib/api";
import { getSection } from "@/lib/content";
import SchemaMarkup from "@/components/seo/SchemaMarkup";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getLivePortfolioData() {
    try {
        const res = await fetch(serverApiUrl("/api/portfolio/"), {
            headers: {
                "Accept": "application/json",
            },
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
    const [projects, page] = await Promise.all([getLivePortfolioData(), getSection("page.portfolio")]);

    // Map keywords from active database nodes
    const dbKeywords = projects
        .map(p => p.meta_keywords)
        .filter(Boolean)
        .join(", ");
        
    const baseKeywords = "Portfolio, Vortexian Tech, Web Development Projects, Case Studies, UI/UX Showcases";
    const combinedKeywords = dbKeywords ? `${baseKeywords}, ${dbKeywords}` : baseKeywords;

    // Map description from latest project for dynamic context
    const dynamicDescription = page.meta_description || projects[0]?.meta_description || "";

    return {
        title: page.meta_title,
        description: dynamicDescription.substring(0, 160), // Google prefers max 160 chars
        keywords: combinedKeywords,
        alternates: {
            canonical: "/portfolio",
        },
        openGraph: {
            title: page.meta_title,
            description: dynamicDescription.substring(0, 160),
            url: "/portfolio",
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
    const page = await getSection("page.portfolio");
    const liveProjects = await getLivePortfolioData();

    return (
        <main>
            <SchemaMarkup sectionKey="page.portfolio" path="/portfolio" />
            {/* Structural Breadcrumb */}
            <BreadcrumbHero
                title={page.hero_title}
                currentPage={page.hero_title}
            />

            {/* Injected Server side fetched dataset directly passed to layout client grid */}
            <PortfolioGrid initialProjects={liveProjects} />

            <CtaBanner />
        </main>
    );
}