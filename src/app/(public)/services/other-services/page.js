import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronDown, Phone, PhoneCall, Sparkles, CircleHelp } from "lucide-react";
import SchemaMarkup from "@/components/seo/SchemaMarkup";
import { getJson, getSection, pageMetadata } from "@/lib/content";
import { OTHER_SERVICES_PATH, otherServices } from "@/lib/otherServices";

// Services menu → "Other Services": the services in the "Others" category (Dashboard → Manage
// Services, "Show in Services menu" on) as cards. Cards are information only (not links).
// Text, call band and FAQ: Site Content → Other Services Page.
export const dynamic = "force-dynamic";

// Admin-entered links: a page on this site or a full web address
const safeHref = (v) => {
    const s = (v || "").trim();
    return /^\/(?!\/)\S*$/.test(s) || /^https?:\/\/\S+$/i.test(s) ? s : "";
};
// Dot pattern in the cards' corners
const DOTS = { backgroundImage: "radial-gradient(rgba(255,255,255,0.35) 1.2px, transparent 1.2px)", backgroundSize: "9px 9px" };

const telHref = (phone) => `tel:${(phone || "").replace(/[^\d+]/g, "")}`;

export function generateMetadata() {
    return pageMetadata("page.other_services", OTHER_SERVICES_PATH);
}

function ButtonLink({ href, children, variant = "primary" }) {
    const to = safeHref(href);
    if (!to || !children) return null;
    const cls = variant === "primary"
        ? "inline-flex items-center gap-2 rounded-xl bg-[#1D1D7E] px-7 py-4 text-base font-bold text-white shadow-lg shadow-[#1D1D7E]/20 transition hover:bg-[#5DB4D1] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#5DB4D1]/40"
        : "inline-flex items-center gap-2 px-2 py-3 text-base font-bold text-[#1D1D7E] transition hover:text-[#2b7fa0]";
    return <Link href={to} className={cls}>{children} <ArrowRight size={18} aria-hidden="true" /></Link>;
}

export default async function OtherServicesPage() {
    const [menu, services, page, settings] = await Promise.all([
        getJson("/api/services/menu-tree", []),
        getJson("/api/services/", []),
        getSection("page.other_services"),
        getSection("settings"),
    ]);
    const list = otherServices(menu, services);
    if (!list.length) notFound();

    const phone = (settings.phone || "").trim();
    const faqs = (page.faqs || []).filter((f) => (f.question || "").trim() && (f.answer || "").trim());
    const faqSchema = faqs.length > 0 && JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
    }).replace(/</g, "\\u003c");

    return (
        <div className="bg-white">
            <SchemaMarkup sectionKey="page.other_services" path={OTHER_SERVICES_PATH} />
            {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqSchema }} />}

            {/* ---------------- banner */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#EAF6FB] via-[#F3F6FC] to-[#E6E6F8]">
                <svg aria-hidden="true" className="pointer-events-none absolute right-[-6%] top-1/2 h-[140%] -translate-y-1/2 text-white/70" viewBox="0 0 400 400" fill="none">
                    <path d="M40 360C120 360 150 250 210 170C270 90 360 70 370 140C380 210 290 250 230 200C170 150 200 40 300 20" stroke="currentColor" strokeWidth="14" strokeLinecap="round" />
                </svg>
                <div className="relative max-w-[1240px] mx-auto px-5 sm:px-8 pt-16 pb-16 md:pt-20 md:pb-24">
                    <nav aria-label="Breadcrumb" className="mb-8 md:mb-12">
                        <ol className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500">
                            <li><Link href="/" className="hover:text-[#1D1D7E]">Home</Link></li>
                            <li aria-hidden="true">/</li>
                            <li><Link href="/services" className="hover:text-[#1D1D7E]">Services</Link></li>
                            <li aria-hidden="true">/</li>
                            <li aria-current="page" className="text-[#1D1D7E]">{page.hero_title}</li>
                        </ol>
                    </nav>
                    {page.eyebrow && (
                        <p className="flex items-center gap-2 text-base font-semibold text-[#0b0b2e]">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#2b7fa0] shadow-sm" aria-hidden="true"><Sparkles size={16} /></span>
                            {page.eyebrow}
                        </p>
                    )}
                    <h1 className="mt-4 max-w-3xl text-4xl sm:text-5xl md:text-[4rem] font-semibold leading-[1.08] tracking-tight text-[#0b0b2e]">{page.hero_title}</h1>
                    {page.hero_text && <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">{page.hero_text}</p>}
                    <div className="mt-8 flex flex-wrap items-center gap-4">
                        <ButtonLink href={page.primary_link}>{page.primary_label}</ButtonLink>
                        <ButtonLink href={page.secondary_link} variant="text">{page.secondary_label}</ButtonLink>
                    </div>
                </div>
            </section>

            {/* ---------------- services (information cards, not links) */}
            <section className="relative px-4 sm:px-8 -mt-6 md:-mt-10 pb-16 md:pb-24" aria-labelledby="other-services-heading">
                <div className="max-w-[1240px] mx-auto rounded-[2rem] border border-slate-100 bg-[#F2F2F2] px-5 py-12 sm:px-10 md:py-16 shadow-[0_20px_60px_-30px_rgba(29,29,126,0.35)]">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 id="other-services-heading" className="text-3xl md:text-4xl font-bold tracking-tight text-[#1D1D7E]">{page.services_heading || "Services We Provide"}</h2>
                        {page.services_text && <p className="mt-3 text-base md:text-lg text-slate-600">{page.services_text}</p>}
                    </div>
                    {/* Navy service cards (information only, not links) */}
                    <ul className="mt-10 md:mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {list.map((s) => (
                            <li key={s.id} data-other-service
                                className="rounded-[1.75rem] bg-gradient-to-br from-[#1D1D7E]/50 via-[#2b5f86]/50 to-[#5DB4D1]/70 p-3 shadow-[0_20px_50px_-25px_rgba(29,29,126,0.55)] transition-transform duration-500 hover:-translate-y-1.5">
                                <div className="relative flex h-full min-h-[240px] flex-col items-center justify-center overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-[#12123F] via-[#1D1D6E] to-[#2E2A8F] px-8 py-12 text-center text-white">
                                    <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[130%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.05]" />
                                    <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[80%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.05]" />
                                    <span aria-hidden="true" className="pointer-events-none absolute left-4 top-4 h-7 w-11" style={DOTS} />
                                    <span aria-hidden="true" className="pointer-events-none absolute bottom-4 right-4 h-7 w-11" style={DOTS} />
                                    {page.card_eyebrow && (
                                        <p className="relative text-[11px] font-bold uppercase tracking-[0.25em] text-[#5DB4D1]">
                                            {page.card_eyebrow}
                                            <span aria-hidden="true" className="mx-auto mt-2 block h-0.5 w-10 rounded-full bg-[#5DB4D1]" />
                                        </p>
                                    )}
                                    <h3 className="relative mt-5 text-2xl md:text-[1.7rem] font-bold leading-tight">{s.service_title}</h3>
                                    {s.short_description && <p className="relative mt-3 max-w-sm text-[15px] leading-relaxed text-white/75">{s.short_description}</p>}
                                    {page.card_footer && <p className="relative mt-6 text-[11px] font-bold uppercase tracking-[0.2em] text-white">{page.card_footer}</p>}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ---------------- call band */}
            {page.band_visible !== false && (
                <section className="bg-[#F4F6FA] py-16 md:py-24" aria-labelledby="call-band-heading">
                    <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
                        {page.band_eyebrow && (
                            <p className="flex items-center gap-3 text-xl md:text-2xl font-semibold text-[#0b0b2e]">
                                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#2b7fa0] shadow-sm" aria-hidden="true"><PhoneCall size={20} /></span>
                                {page.band_eyebrow}
                            </p>
                        )}
                        <h2 id="call-band-heading" className="mt-5 max-w-3xl text-4xl md:text-[3.25rem] font-semibold leading-[1.1] tracking-tight text-[#0b0b2e]">{page.band_heading}</h2>
                        {page.band_text && <p className="mt-6 max-w-3xl text-lg md:text-xl leading-relaxed text-slate-600">{page.band_text}</p>}
                        {phone && (
                            <a href={telHref(phone)} className="mt-8 inline-flex items-center gap-4 text-3xl md:text-4xl font-bold text-[#1D1D7E] transition hover:text-[#2b7fa0]">
                                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#5DB4D1] text-white shadow-lg shadow-[#5DB4D1]/30" aria-hidden="true"><Phone size={26} /></span>
                                {phone}
                            </a>
                        )}
                        {safeHref(page.band_link) && page.band_link_label && (
                            <p className="mt-8 text-lg text-slate-700">
                                {page.band_link_intro}{" "}
                                <Link href={safeHref(page.band_link)} className="font-bold text-[#2b7fa0] underline-offset-4 hover:underline">{page.band_link_label}</Link>
                            </p>
                        )}
                    </div>
                </section>
            )}

            {/* ---------------- FAQ */}
            {faqs.length > 0 && (
                <section className="py-16 md:py-24" aria-labelledby="faq-heading">
                    <div className="max-w-[1240px] mx-auto px-5 sm:px-8 grid gap-10 lg:grid-cols-[1fr_1.5fr]">
                        <div>
                            {page.faq_eyebrow && (
                                <p className="flex items-center gap-2 text-base font-semibold text-[#0b0b2e]">
                                    <CircleHelp size={20} className="text-[#2b7fa0]" aria-hidden="true" /> {page.faq_eyebrow}
                                </p>
                            )}
                            <h2 id="faq-heading" className="mt-3 text-3xl md:text-[2.6rem] font-semibold leading-tight tracking-tight text-[#0b0b2e]">{page.faq_heading || "Frequently asked questions"}</h2>
                            {page.faq_text && <p className="mt-4 text-base leading-relaxed text-slate-600 whitespace-pre-line">{page.faq_text}</p>}
                            <div className="mt-6"><ButtonLink href={page.faq_button_link}>{page.faq_button_label}</ButtonLink></div>
                        </div>
                        <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
                            {faqs.map((f, i) => (
                                <details key={i} className="group p-5 md:p-6" open={i === 0}>
                                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base md:text-lg font-semibold text-[#0b0b2e] [&::-webkit-details-marker]:hidden">
                                        {f.question}
                                        <ChevronDown size={20} aria-hidden="true" className="mt-1 shrink-0 text-[#2b7fa0] transition-transform group-open:rotate-180" />
                                    </summary>
                                    <p className="mt-3 text-[15px] leading-relaxed text-slate-600 whitespace-pre-line">{f.answer}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
