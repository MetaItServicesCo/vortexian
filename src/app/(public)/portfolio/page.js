import dbConnect from "@/lib/db";
import Portfolio from "@/models/Portfolio";
import BreadcrumbHero from "@/components/BreadcrumbHero";
import CtaBanner from "@/components/CtaBanner";
import PortfolioGrid from "@/components/portfolio/PortfolioGrid";

// Helper function to fetch data for both Metadata and the Page Component Natively
async function getLivePortfolioData() {
    try {
        await dbConnect();
        // Fetch projects sorted by latest entry
        const projects = await Portfolio.find({}).sort({ createdAt: -1 });
        return JSON.parse(JSON.stringify(projects));
    } catch (error) {
        console.error("Critical Exception fetching portfolio streams:", error);
        return [];
    }
}

// ==========================================
// DYNAMIC METADATA (Keywords mapped from live items)
// ==========================================
export async function generateMetadata() {
    const projects = await getLivePortfolioData();

    // Extract all unique custom SEO keywords from active database nodes
    const dbKeywords = projects.map(p => p.seoKeywords).filter(Boolean).join(", ");
    const baseKeywords = "Portfolio, Vortexian Tech, Web Development Projects, Case Studies, UI/UX Showcases";
    const combinedKeywords = dbKeywords ? `${baseKeywords}, ${dbKeywords}` : baseKeywords;

    return {
        title: "Portfolio | Vortexian Tech - Showcasing Digital Excellence",
        description: "Explore our elite range of projects in web development, serverless applications, enterprise platforms, and custom digital architectures. See how we drive business scalability.",
        keywords: combinedKeywords,
        openGraph: {
            title: "Portfolio | Vortexian Tech - Showcasing Excellence",
            description: "Explore our elite range of projects in web development and technical architectures.",
            url: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/portfolio`,
            type: "website"
        }
    };
}

export const revalidate = 0; // Fresh extraction tag

export default async function PortfolioPage() {
    const liveProjects = await getLivePortfolioData();

    return (
        <main>
            {/* Reusable Hero Section */}
            <BreadcrumbHero
                title="PORTFOLIO"
                currentPage="PORTFOLIO"
            />

            {/* Portfolio Projects Grid - Injecting live database records dataset */}
            <PortfolioGrid initialProjects={liveProjects} />

            {/* Call to Action Banner */}
            <CtaBanner />
        </main>
    );
}