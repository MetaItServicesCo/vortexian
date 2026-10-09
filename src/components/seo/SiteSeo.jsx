// Analytics, Clarity and site-wide schema markup for public pages
// (Dashboard → SEO & Tracking). Not rendered in the dashboard, so admin
// visits don't count as traffic.
import Script from "next/script";
import { getSection } from "@/lib/content";
import { safeClarityId, safeGaId, schemaScripts } from "@/lib/seo";

export default async function SiteSeo() {
    const [tracking, schema, settings] = await Promise.all([getSection("seo.tracking"), getSection("seo.schema"), getSection("settings")]);
    const ga = tracking?.ga_enabled ? safeGaId(tracking.ga_measurement_id) : null;
    const clarity = tracking?.clarity_enabled ? safeClarityId(tracking.clarity_project_id) : null;

    return (
        <>
            {schemaScripts(schema, settings).map((json, i) => (
                <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
            ))}

            {ga && (
                <>
                    <Script id="ga-gtag" src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
                    <Script id="ga-config" strategy="afterInteractive">
                        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${ga}');`}
                    </Script>
                </>
            )}

            {clarity && (
                <Script id="ms-clarity" strategy="afterInteractive">
                    {`(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${clarity}");`}
                </Script>
            )}
        </>
    );
}
