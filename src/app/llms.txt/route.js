// /llms.txt (Dashboard → SEO & Tracking → llms.txt).
// ?recommended=1 returns the generated version (used by the editor's "Start from" button).
import { getFreshSiteContent } from "@/lib/content";
import { recommendedLlms, textResponse } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function GET(request) {
    const content = await getFreshSiteContent();
    const settings = content["seo.llms"];
    const wantRecommended = new URL(request.url).searchParams.has("recommended");
    const custom = (settings?.custom || "").trim();
    const body = !wantRecommended && !settings?.use_recommended && custom ? `${custom}\n` : await recommendedLlms(content);
    return textResponse(body); // text/plain so browsers show it instead of downloading
}
