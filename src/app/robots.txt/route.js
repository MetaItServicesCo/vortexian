// /robots.txt (Dashboard → SEO & Tracking → robots.txt).
// ?recommended=1 returns the recommended rules (used by the editor's "Start from" button).
import { getFreshSiteContent } from "@/lib/content";
import { recommendedRobots, textResponse } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function GET(request) {
    const content = await getFreshSiteContent();
    const [settings, sitemap] = [content["seo.robots"], content["seo.sitemap"]];
    const wantRecommended = new URL(request.url).searchParams.has("recommended");
    const custom = (settings?.custom || "").trim();
    // Never serve an empty robots.txt: fall back to the recommended rules
    const body = !wantRecommended && !settings?.use_recommended && custom ? `${custom}\n` : recommendedRobots(Boolean(sitemap?.enabled));
    return textResponse(body);
}
