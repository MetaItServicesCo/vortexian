import Link from "next/link";
import { ArrowRight, CheckCircle2, Phone, Shield, Sparkles, Target, Zap } from "lucide-react";
import DynamicIcon from "@/components/content/DynamicIcon";
import RichText from "@/components/content/RichText";
import CtaBand from "@/components/services/CtaBand";
import ReadMore from "@/components/services/ReadMore";
import ServicePricing, { parsePricing } from "@/components/services/ServicePricing";
import { parseLayout } from "@/lib/serviceLayout";

// The body of a service page: the blocks from Dashboard → Manage Services → Page sections,
// in the admin's order. Light sections in the site's colours (navy #1D1D7E, cyan #5DB4D1).

const TINTS = ["bg-[#EAF6FB]", "bg-[#EEEEFB]", "bg-[#F3EDFB]"];      // cyan / navy / lavender tints
const WRAP = "max-w-[1240px] mx-auto px-5 sm:px-8 py-16 md:py-24";

const imageUrl = (url) => url || "https://placehold.co/1200x800?text=Vortexian+Tech";

function Eyebrow({ children, center = false }) {
    if (!children) return null;
    return (
        <p className={`flex items-center gap-2.5 text-sm font-bold text-[#1D1D7E] ${center ? "justify-center" : ""}`}>
            <span className="w-8 h-8 rounded-full bg-[#5DB4D1]/15 text-[#2b7fa0] flex items-center justify-center"><Sparkles size={15} aria-hidden="true" /></span>
            {children}
        </p>
    );
}

function Heading({ children, center = false, className = "" }) {
    if (!children) return null;
    return <h2 className={`mt-4 text-3xl md:text-[2.6rem] font-bold text-[#0b0b2e] leading-tight tracking-tight ${center ? "text-center" : ""} ${className}`}>{children}</h2>;
}

function Action({ text, link, variant = "primary", className = "" }) {
    if (!text) return null;
    const href = link || "/contact";
    const external = /^https?:\/\//i.test(href);
    const styles = {
        primary: "bg-[#1D1D7E] text-white hover:bg-[#5DB4D1] hover:text-[#0b0b2e]",
        light: "bg-white text-[#0b0b2e] hover:bg-[#1D1D7E] hover:text-white shadow-sm",
        ghost: "text-[#0b0b2e] hover:text-[#1D1D7E]",
    }[variant];
    const cls = `inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition ${styles} ${className}`;
    const body = <>{text} <ArrowRight size={16} aria-hidden="true" /></>;
    return external
        ? <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{body}</a>
        : <Link href={href} className={cls}>{body}</Link>;
}

function Section({ tone, type, children }) {
    return <section className={tone === "tint" ? "bg-[#F6F9FC]" : "bg-white"} data-section={type}>{children}</section>;
}

// ---------------------------------------------------------------- built-in blocks

function Intro({ service, phone }) {
    const features = [service.feature_1, service.feature_2, service.feature_3, service.feature_4].filter(Boolean);
    const dial = (phone || "").replace(/[^\d+]/g, "");
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-[#EAF6FB] via-white to-[#EEEEFB]" data-section="intro">
            <div className="absolute right-[-10%] top-[-20%] w-[520px] h-[520px] rounded-full border-[48px] border-white/60 pointer-events-none" aria-hidden="true" />
            <div className={`${WRAP} relative grid lg:grid-cols-12 gap-12 items-center`}>
                <div className="lg:col-span-6">
                    <Eyebrow>{service.category_stack && service.category_stack !== "Others" ? service.category_stack : "Vortexian Tech"}</Eyebrow>
                    <h2 className="mt-5 text-3xl md:text-[2.75rem] font-bold text-[#0b0b2e] leading-[1.15] tracking-tight">{service.short_description || service.service_title}</h2>
                    {features.length > 0 && (
                        <ul className="mt-8 grid sm:grid-cols-2 gap-3">
                            {features.map((f, i) => (
                                <li key={i} className="flex items-start gap-3 rounded-xl bg-white/80 border border-white px-4 py-3 shadow-sm text-[15px] font-semibold text-slate-700">
                                    <CheckCircle2 size={19} className="shrink-0 mt-0.5 text-[#5DB4D1]" aria-hidden="true" /> {f}
                                </li>
                            ))}
                        </ul>
                    )}
                    <div className="mt-9 flex flex-wrap items-center gap-4">
                        <Action text="Get A Free Quote" link="/contact" />
                        {dial.length >= 6 && (
                            <a href={`tel:${dial}`} className="inline-flex items-center gap-2 text-sm font-bold text-[#0b0b2e] hover:text-[#1D1D7E]">
                                <span className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-[#1D1D7E]"><Phone size={16} aria-hidden="true" /></span>
                                Call {phone}
                            </a>
                        )}
                    </div>
                </div>
                <div className="lg:col-span-6">
                    <div className="relative w-fit max-w-full mx-auto rounded-[2rem] overflow-hidden bg-white p-2 shadow-[0_30px_60px_-20px_rgba(29,29,126,0.35)]">
                        {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded image of any size */}
                        <img src={imageUrl(service.image_showcase_url)} alt={service.image_alt || `${service.service_title} showcase`}
                            className="block max-w-full h-auto max-h-[70vh] rounded-[1.6rem]" />
                    </div>
                </div>
            </div>
        </section>
    );
}

const WHY = [
    { key: "why_choose_1", title: "Technical Expertise", Icon: Target },
    { key: "why_choose_2", title: "Scalability Assurance", Icon: Zap },
    { key: "why_choose_3", title: "Quality Operations", Icon: Shield },
];

function Why({ block, service, tone }) {
    const items = WHY.filter((w) => service[w.key]);
    if (!items.length) return null;
    return (
        <Section tone={tone} type="why">
            <div className={WRAP}>
                <Eyebrow center>Why choose us</Eyebrow>
                <Heading center>{block.heading || "Why Choose Vortexian Tech?"}</Heading>
                <ul className="mt-12 grid md:grid-cols-3 gap-6">
                    {items.map(({ key, title, Icon }, i) => (
                        <li key={key} className={`rounded-3xl p-7 ${TINTS[i % TINTS.length]}`}>
                            <span className="w-12 h-12 rounded-2xl bg-white text-[#1D1D7E] flex items-center justify-center shadow-sm"><Icon size={22} aria-hidden="true" /></span>
                            <h3 className="mt-5 text-lg font-bold text-[#0b0b2e]">{title}</h3>
                            <p className="mt-2 text-slate-600 leading-relaxed">{service[key]}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </Section>
    );
}

function Overview({ block, service, tone }) {
    if (!service.long_description) return null;
    return (
        <Section tone={tone} type="overview">
            <div className={`${WRAP} max-w-[920px]`}>
                <Eyebrow>Overview</Eyebrow>
                <Heading>{block.heading || `About our ${service.service_title}`}</Heading>
                <div className="mt-8">
                    <ReadMore collapsed={block.collapsed !== false}>
                        <RichText html={service.long_description} className="text-[17px] text-slate-700" />
                    </ReadMore>
                </div>
            </div>
        </Section>
    );
}

// ---------------------------------------------------------------- custom sections

function Cards({ block, tone }) {
    const items = block.items || [];
    return (
        <Section tone={tone} type="cards">
            <div className={WRAP}>
                <div className="max-w-2xl mx-auto text-center">
                    <Eyebrow center>{block.eyebrow}</Eyebrow>
                    <Heading center>{block.heading}</Heading>
                    {block.intro && <p className="mt-4 text-slate-600 text-lg">{block.intro}</p>}
                </div>
                <ul className={`mt-12 grid gap-6 sm:grid-cols-2 ${items.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
                    {items.map((item, i) => (
                        <li key={i} className={`flex flex-col rounded-3xl p-7 ${TINTS[i % TINTS.length]} transition hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(29,29,126,0.35)]`}>
                            {item.icon && <span className="w-12 h-12 rounded-2xl bg-white text-[#1D1D7E] flex items-center justify-center shadow-sm"><DynamicIcon name={item.icon} size={22} aria-hidden="true" /></span>}
                            {item.title && <h3 className={`${item.icon ? "mt-5" : ""} text-lg font-bold text-[#0b0b2e]`}>{item.title}</h3>}
                            {item.text && <p className="mt-2 text-slate-600 leading-relaxed">{item.text}</p>}
                            {item.button_text && <div className="mt-auto pt-6"><Action text={item.button_text} link={item.button_link} variant="light" className="w-full" /></div>}
                        </li>
                    ))}
                </ul>
            </div>
        </Section>
    );
}

function Steps({ block, tone }) {
    const items = block.items || [];
    return (
        <Section tone={tone} type="steps">
            <div className={WRAP}>
                <div className="max-w-2xl mx-auto text-center">
                    <Eyebrow center>{block.eyebrow}</Eyebrow>
                    <Heading center>{block.heading}</Heading>
                    {block.intro && <p className="mt-4 text-slate-600 text-lg">{block.intro}</p>}
                </div>
                <ol className={`mt-14 grid gap-8 sm:grid-cols-2 ${items.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
                    {items.map((item, i) => (
                        <li key={i} className="relative">
                            {i < items.length - 1 && <span className="hidden lg:block absolute top-7 left-16 right-[-2rem] border-t-2 border-dashed border-[#5DB4D1]/50" aria-hidden="true" />}
                            <span className="relative w-14 h-14 rounded-2xl bg-[#1D1D7E] text-white text-xl font-black flex items-center justify-center shadow-[0_12px_25px_-10px_rgba(29,29,126,0.6)]">{i + 1}</span>
                            {item.title && <h3 className="mt-5 text-lg font-bold text-[#0b0b2e]">{item.title}</h3>}
                            {item.text && <p className="mt-2 text-slate-600 leading-relaxed">{item.text}</p>}
                        </li>
                    ))}
                </ol>
            </div>
        </Section>
    );
}

function Stats({ block, tone }) {
    const items = block.items || [];
    return (
        <Section tone={tone} type="stats">
            <div className={WRAP}>
                {(block.eyebrow || block.heading) && (
                    <div className="max-w-2xl mx-auto text-center mb-12">
                        <Eyebrow center>{block.eyebrow}</Eyebrow>
                        <Heading center>{block.heading}</Heading>
                    </div>
                )}
                <dl className={`grid gap-6 grid-cols-2 ${items.length >= 4 ? "lg:grid-cols-4" : items.length === 3 ? "lg:grid-cols-3" : ""}`}>
                    {items.map((item, i) => (
                        <div key={i} className="rounded-3xl bg-white border border-slate-100 shadow-sm p-7 text-center">
                            <dd className="text-4xl md:text-5xl font-black text-[#1D1D7E] tracking-tight">{item.value}</dd>
                            <dt className="mt-2 text-sm font-semibold uppercase tracking-wider text-slate-500">{item.label}</dt>
                        </div>
                    ))}
                </dl>
            </div>
        </Section>
    );
}

function Checklist({ block, tone }) {
    const image = block.image && (
        <div className="lg:col-span-6">
            <div className="relative w-fit max-w-full mx-auto rounded-[2rem] overflow-hidden bg-white p-2 shadow-[0_30px_60px_-20px_rgba(29,29,126,0.3)]">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded image */}
                <img src={block.image} alt={block.image_alt || ""} loading="lazy" className="block max-w-full h-auto max-h-[60vh] rounded-[1.6rem]" />
            </div>
        </div>
    );
    return (
        <Section tone={tone} type="checklist">
            <div className={`${WRAP} grid lg:grid-cols-12 gap-12 items-center`}>
                {block.image_side === "left" && image}
                <div className={block.image ? "lg:col-span-6" : "lg:col-span-12 max-w-3xl"}>
                    <Eyebrow>{block.eyebrow}</Eyebrow>
                    <Heading>{block.heading}</Heading>
                    {block.text && <p className="mt-4 text-slate-600 text-lg leading-relaxed whitespace-pre-line">{block.text}</p>}
                    {block.items?.length > 0 && (
                        <ul className="mt-7 space-y-3.5">
                            {block.items.map((p, i) => (
                                <li key={i} className="flex items-start gap-3 text-[16px] text-slate-700">
                                    <CheckCircle2 size={21} className="shrink-0 mt-0.5 text-[#5DB4D1]" aria-hidden="true" /> {p}
                                </li>
                            ))}
                        </ul>
                    )}
                    {block.button_text && <div className="mt-8"><Action text={block.button_text} link={block.button_link} /></div>}
                </div>
                {block.image_side !== "left" && image}
            </div>
        </Section>
    );
}

function Faq({ block, tone }) {
    return (
        <Section tone={tone} type="faq">
            <div className={`${WRAP} grid lg:grid-cols-12 gap-12`}>
                <div className="lg:col-span-5">
                    <Eyebrow>{block.eyebrow || "FAQ"}</Eyebrow>
                    <Heading>{block.heading || "Frequently asked questions"}</Heading>
                    {block.text && <p className="mt-4 text-slate-600 leading-relaxed whitespace-pre-line">{block.text}</p>}
                    {block.button_text && <div className="mt-8"><Action text={block.button_text} link={block.button_link} /></div>}
                </div>
                <div className="lg:col-span-7 space-y-3">
                    {(block.items || []).map((item, i) => (
                        <details key={i} open={i === 0} className="group rounded-2xl bg-white border border-slate-100 shadow-sm open:shadow-md">
                            <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-6 py-5 font-bold text-[#0b0b2e] [&::-webkit-details-marker]:hidden">
                                {item.question}
                                <span className="shrink-0 w-8 h-8 rounded-full bg-[#EEEEFB] text-[#1D1D7E] flex items-center justify-center text-lg leading-none group-open:rotate-45 transition" aria-hidden="true">+</span>
                            </summary>
                            <p className="px-6 pb-6 -mt-1 text-slate-600 leading-relaxed whitespace-pre-line">{item.answer}</p>
                        </details>
                    ))}
                </div>
            </div>
        </Section>
    );
}

const CUSTOM = { cards: Cards, steps: Steps, stats: Stats, checklist: Checklist, faq: Faq };

export default function ServiceSections({ service, phone, layout, preview = false }) {
    const blocks = parseLayout(layout ?? service.layout).filter((b) => !b.hidden);
    let shade = 0;   // alternate white / tinted backgrounds between sections
    return blocks.map((block) => {
        const key = block.id || block.type;
        if (block.type === "intro") return <Intro key={key} service={service} phone={phone} />;
        if (block.type === "cta") return <CtaBand key={key} block={block} />;
        if (block.type === "pricing") {
            const pricing = parsePricing(service.pricing);
            if (!pricing?.plans?.some((p) => p?.name) || (!pricing.enabled && !preview)) return null;
            return (
                <section key={key} className="bg-white" data-section="pricing">
                    <ServicePricing pricing={service.pricing} serviceTitle={service.service_title} preview={preview} />
                </section>
            );
        }
        const tone = shade++ % 2 === 0 ? "white" : "tint";
        if (block.type === "why") return <Why key={key} block={block} service={service} tone={tone} />;
        if (block.type === "overview") return <Overview key={key} block={block} service={service} tone={tone} />;
        const Custom = CUSTOM[block.type];
        return Custom ? <Custom key={key} block={block} tone={tone} /> : null;
    });
}
