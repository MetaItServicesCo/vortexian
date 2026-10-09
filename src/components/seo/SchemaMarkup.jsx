// Page-level schema markup (JSON-LD), rendered on the server.
//   Items:          <SchemaMarkup kind="blog" item={post} path="/blog/x" custom={post.schema_json} />
//   Built-in pages: <SchemaMarkup sectionKey="page.about" path="/about" />
// The admin's own markup replaces the automatic one (blog posts and services
// get automatic BlogPosting / Service markup unless switched off).
import { getSection } from "@/lib/content";
import { pageSchemas } from "@/lib/schema";

export default async function SchemaMarkup({ kind = "page", item, path, custom, sectionKey, field = "schema_json" }) {
    const [settings, seo, section] = await Promise.all([
        getSection("settings"),
        getSection("seo.schema"),
        sectionKey ? getSection(sectionKey) : null,
    ]);
    const own = sectionKey ? section?.[field] : custom;
    const auto = (kind === "blog" && seo?.auto_blog !== false) || (kind === "service" && seo?.auto_service !== false);
    const scripts = pageSchemas({ kind, item: item || section || {}, path, settings, custom: own, auto });
    return scripts.map((json, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />);
}
