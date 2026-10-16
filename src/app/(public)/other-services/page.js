import Link from "next/link";
import { ArrowRight, ChevronDown, Phone } from "lucide-react";
import SchemaMarkup from "@/components/seo/SchemaMarkup";
import DynamicIcon from "@/components/content/DynamicIcon";
import { QuoteProvider, QuoteButton } from "@/components/otherservices/QuoteDialog";
import { getJson, getSection, pageMetadata } from "@/lib/content";
import { SITE_URL, mediaUrl } from "@/lib/api";
import { OTHER_SERVICES_PATH, colorFor, isExternal, othersServices, safeLink, serviceCard, visibleCategories } from "@/lib/otherServices";

// "Other Services" (/other-services): services in the "Others" category, listed automatically,
// plus the categories and cards from Dashboard → Other Services Page. See src/lib/otherServices.js.
export const dynamic = "force-dynamic";

// Sections in page order: your own categories, then the automatic "Others" section
async function loadSections(page) {
    const own = (await getSection("other_services"))?.categories || [];
    let auto = [];
    if (page.auto_list !== false) {
        const [services, categories] = await Promise.all([getJson("/api/services/", []), getJson("/api/categories/?kind=service", [])]);
        const linked = new Set(own.flatMap((c) => (c.services || []).map((s) => safeLink(s.link))));
        const cards = othersServices(services, categories).map(serviceCard).filter((s) => !linked.has(s.link));
        if (cards.length) auto = [{ id: "others", name: page.auto_heading || "More services", intro: page.auto_intro || "", color: "auto", services: cards }];
    }
    return visibleCategories([...own, ...auto]);
}

export async function generateMetadata() {
    const page = await getSection("page.other_services");
    const [meta, sections] = await Promise.all([pageMetadata("page.other_services", OTHER_SERVICES_PATH), loadSections(page)]);
    // An empty page isn't worth indexing; it's listed once it has services
    return sections.length ? meta : { ...meta, robots: { index: false, follow: true } };
}

const telHref = (phone) => `tel:${(phone || "").replace(/[^\d+]/g, "")}`;

function ServiceCard({ service, color, learnMore }) {
    const link = safeLink(service.link);
    const external = isExternal(link);
    return (
        <article
            className="group flex flex-col rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(29,29,126,0.35)]"
            style={{ backgroundColor: color.card, borderColor: color.border }}
        >
            {service.image ? (
                <div className="mb-5 -mx-2 -mt-2 rounded-xl bg-white/70 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element -- admin-managed image of any size */}
                    <img src={mediaUrl(service.image)} alt={service.image_alt || ""} loading="lazy" className="w-full h-auto max-h-48 object-contain mx-auto" />
                </div>
            ) : (
                <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm" style={{ color: color.icon }} aria-hidden="true">
                    <DynamicIcon name={service.icon} fallback="Layers" size={24} strokeWidth={2} />
                </span>
            )}
            <h3 className="text-lg font-bold text-[#0b0b2e] leading-snug">{service.title}</h3>
            {service.description && <p className="mt-2 text-[15px] leading-relaxed text-slate-600 line-clamp-3">{service.description}</p>}
            {link && (
                <div className="mt-auto pt-5">
                    <Link
                        href={link}
                        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#1D1D7E] shadow-sm transition hover:bg-[#1D1D7E] hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#5DB4D1]/40"
                    >
                        {learnMore}<span className="sr-only">: {service.title}</span>
                        <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </div>
            )}
        </article>
    );
}

export default async function OurServicesPage() {
    const [page, settings] = await Promise.all([getSection("page.other_services"), getSection("settings")]);
    const categories = await loadSections(page);
    const faqs = (page.faqs || []).filter((f) => (f.question || "").trim() && (f.answer || "").trim());
    const phone = (settings.phone || "").trim();
    const faqSchema = faqs.length && {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
    };
    const listSchema = categories.length && {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: page.hero_title,
        url: `${SITE_URL}${OTHER_SERVICES_PATH}`,
        itemListElement: categories.flatMap((c) => c.services).map((s, i) => ({ "@type": "ListItem", position: i + 1, name: s.title, ...(safeLink(s.link).startsWith("/") ? { url: `${SITE_URL}${safeLink(s.link)}` } : {}) })),
    };
    const json = (o) => JSON.stringify(o).replace(/</g, "\\u003c");

    return (
        <QuoteProvider categories={categories.map((c) => c.name)}>
            <div className="bg-white">
                <SchemaMarkup sectionKey="page.other_services" path={OTHER_SERVICES_PATH} />
                {listSchema ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json(listSchema) }} /> : null}
                {faqSchema ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json(faqSchema) }} /> : null}

                {/* ---------------- banner */}
                <section className="relative overflow-hidden bg-gradient-to-br from-[#EAF6FB] via-[#F4F7FD] to-[#EEEEFB]">
                    <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full border-[40px] border-white/60" />
                    <div aria-hidden="true" className="pointer-events-none absolute right-40 bottom-[-120px] h-[260px] w-[260px] rounded-full bg-[#5DB4D1]/10" />
                    <div className="relative max-w-[1240px] mx-auto px-5 sm:px-8 pt-10 pb-16 md:pt-14 md:pb-24">
                        <nav aria-label="Breadcrumb" className="mb-8 md:mb-10">
                            <ol className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500">
                                <li><Link href="/" className="hover:text-[#1D1D7E]">Home</Link></li>
                                <li aria-hidden="true">/</li>
                                <li aria-current="page" className="text-[#1D1D7E]">{page.hero_title}</li>
                            </ol>
                        </nav>
                        {page.eyebrow && (
                            <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-sm font-bold text-[#2b7fa0] shadow-sm">
                                <span className="h-2 w-2 rounded-full bg-[#5DB4D1]" aria-hidden="true" />{page.eyebrow}
                            </p>
                        )}
                        <h1 className="mt-5 max-w-3xl text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.08] tracking-tight text-[#0b0b2e]">{page.hero_title}</h1>
                        {page.hero_text && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">{page.hero_text}</p>}
                        <div className="mt-8 flex flex-wrap items-center gap-4">
                            <QuoteButton className="inline-flex items-center gap-2 rounded-xl bg-[#1D1D7E] px-7 py-4 text-base font-bold text-white shadow-lg shadow-[#1D1D7E]/20 transition hover:bg-[#5DB4D1] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#5DB4D1]/40">
                                {page.hero_button || "Get a Free Quote"} <ArrowRight size={18} aria-hidden="true" />
                            </QuoteButton>
                            {phone && (
                                <a href={telHref(phone)} className="inline-flex items-center gap-2 px-2 py-3 text-base font-bold text-[#1D1D7E] hover:text-[#2b7fa0]">
                                    <Phone size={18} aria-hidden="true" /> {phone}
                                </a>
                            )}
                        </div>
                    </div>
                </section>

                {/* ---------------- quick links to categories */}
                {categories.length > 1 && (
                    <nav aria-label="Service categories" className="border-b border-slate-100 bg-white">
                        <ul className="max-w-[1240px] mx-auto px-5 sm:px-8 py-4 flex gap-2 overflow-x-auto [scrollbar-width:none]">
                            {categories.map((c, i) => (
                                <li key={c.id || c.anchor} className="shrink-0">
                                    <a href={`#${c.anchor}`} className="inline-flex items-center rounded-full border px-4 py-2 text-sm font-bold text-[#1D1D7E] transition hover:bg-[#1D1D7E] hover:text-white" style={{ borderColor: colorFor(c, i).border, backgroundColor: colorFor(c, i).card }}>
                                        {c.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                )}

                {/* ---------------- categories */}
                {categories.length === 0 ? (
                    <p className="max-w-[1240px] mx-auto px-5 sm:px-8 py-20 text-center text-slate-500">Our services will be listed here soon.</p>
                ) : (
                    categories.map((c, i) => {
                        const color = colorFor(c, i);
                        return (
                            <section key={c.id || c.anchor} id={c.anchor} aria-labelledby={`${c.anchor}-title`} className={`scroll-mt-36 py-16 md:py-20 ${i % 2 ? "bg-[#F6F9FC]" : "bg-white"}`}>
                                <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
                                    <div className="max-w-3xl">
                                        <span className="block h-1 w-12 rounded-full" style={{ backgroundColor: color.icon }} aria-hidden="true" />
                                        <h2 id={`${c.anchor}-title`} className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-[#1D1D7E]">{c.name}</h2>
                                        {c.intro && <p className="mt-3 text-base md:text-lg leading-relaxed text-slate-600 whitespace-pre-line">{c.intro}</p>}
                                    </div>
                                    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                        {c.services.map((s) => <ServiceCard key={s.id || s.title} service={s} color={color} learnMore={page.learn_more_label || "Learn More"} />)}
                                    </div>
                                    <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                                        <p className="flex-1 text-base font-semibold text-slate-700">
                                            Interested in <span className="text-[#1D1D7E]">{c.name}</span>? Tell us what you need and get a free, no-obligation quote.
                                        </p>
                                        <QuoteButton category={c.name} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1D1D7E] px-6 py-3.5 text-[15px] font-bold text-white transition hover:bg-[#5DB4D1] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#5DB4D1]/40">
                                            {(c.quote_label || "").trim() || page.quote_label || "Get a Free Quote"}
                                            <span className="sr-only"> for {c.name}</span>
                                            <ArrowRight size={17} aria-hidden="true" />
                                        </QuoteButton>
                                    </div>
                                </div>
                            </section>
                        );
                    })
                )}

                {/* ---------------- call band */}
                {page.band_visible !== false && (
                    <section className="bg-[#1D1D7E] text-white" aria-labelledby="call-band-title">
                        <div className="relative overflow-hidden max-w-[1240px] mx-auto px-5 sm:px-8 py-16 md:py-20 grid gap-10 md:grid-cols-[1.4fr_1fr] md:items-center">
                            <div>
                                {page.band_eyebrow && <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#5DB4D1]">{page.band_eyebrow}</p>}
                                <h2 id="call-band-title" className="mt-3 text-3xl md:text-[2.6rem] font-bold leading-tight">{page.band_heading}</h2>
                                {page.band_text && <p className="mt-4 text-lg leading-relaxed text-white/75 max-w-xl">{page.band_text}</p>}
                            </div>
                            <div className="flex flex-col gap-4 md:items-end">
                                {phone && (
                                    <a href={telHref(phone)} className="inline-flex items-center gap-4 text-2xl md:text-3xl font-bold hover:text-[#5DB4D1] transition">
                                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#5DB4D1] text-[#0b0b2e]" aria-hidden="true"><Phone size={24} /></span>
                                        {phone}
                                    </a>
                                )}
                                <QuoteButton className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-4 text-base font-bold text-[#1D1D7E] transition hover:bg-[#5DB4D1] hover:text-[#0b0b2e]">
                                    {page.hero_button || "Get a Free Quote"} <ArrowRight size={18} aria-hidden="true" />
                                </QuoteButton>
                            </div>
                        </div>
                    </section>
                )}

                {/* ---------------- FAQ */}
                {faqs.length > 0 && (
                    <section className="py-16 md:py-24" aria-labelledby="faq-title">
                        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 grid gap-10 lg:grid-cols-[1fr_1.6fr]">
                            <div>
                                <h2 id="faq-title" className="text-3xl md:text-4xl font-bold tracking-tight text-[#1D1D7E]">{page.faq_heading || "Frequently asked questions"}</h2>
                                {page.faq_text && <p className="mt-4 text-base leading-relaxed text-slate-600 whitespace-pre-line">{page.faq_text}</p>}
                                <QuoteButton className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1D1D7E] px-6 py-3.5 text-[15px] font-bold text-white transition hover:bg-[#5DB4D1]">
                                    {page.hero_button || "Get a Free Quote"} <ArrowRight size={17} aria-hidden="true" />
                                </QuoteButton>
                            </div>
                            <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
                                {faqs.map((f, i) => (
                                    <details key={i} className="group p-5 md:p-6" open={i === 0}>
                                        <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base md:text-lg font-bold text-[#0b0b2e] [&::-webkit-details-marker]:hidden">
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
        </QuoteProvider>
    );
}
