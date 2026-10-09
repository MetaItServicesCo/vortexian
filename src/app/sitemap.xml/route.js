// /sitemap.xml, generated from published content (Dashboard → SEO & Tracking → Sitemap)
import { getFreshSiteContent } from "@/lib/content";
import { sitemapEntries, sitemapXml, textResponse } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function GET() {
    const settings = (await getFreshSiteContent())["seo.sitemap"];
    if (!settings?.enabled) return new Response("Not Found", { status: 404 });
    return textResponse(sitemapXml(await sitemapEntries(settings)), "application/xml; charset=utf-8");
}
