import Link from "next/link";
import { ArrowRight, CheckCircle2, Phone, Shield, Sparkles, Target, Zap } from "lucide-react";
import DynamicIcon from "@/components/content/DynamicIcon";
import RichText from "@/components/content/RichText";
import CtaBand from "@/components/services/CtaBand";
import ReadMore from "@/components/services/ReadMore";
import ServicePricing, { parsePricing } from "@/components/services/ServicePricing";
import { resolveColor } from "@/lib/designPalette";
import { parseLayout } from "@/lib/serviceLayout";

// The body of a service page: the blocks from Dashboard → Manage Services → Page sections,
// in the admin's order, each with its own design (background, spacing, alignment, card
// colours…). Defaults: light sections in the site's colours (navy #1D1D7E, cyan #5DB4D1).

const AUTO_CARD_COLORS = ["cyan", "indigo", "lavender"];
const PAD = { compact: "py-12 md:py-14", normal: "py-16 md:py-24", spacious: "py-24 md:py-32" };
const AUTO_BG = { white: "#ffffff", tint: "#F6F9FC" };

const imageUrl = (url) => url || "https://placehold.co/1200x800?text=Vortexian+Tech";

// Section look: background (auto = alternating white / light tint), text colours for it, spacing
function look(design = {}, tone) {
    const bg = resolveColor(design.background);
    const dark = Boolean(bg?.dark);
    return {
        dark,
        style: { background: bg ? bg.background : AUTO_BG[tone] || AUTO_BG.white },
        fade: bg ? (bg.background.startsWith("#") ? bg.background : "transparent") : AUTO_BG[tone] || AUTO_BG.white,
        pad: PAD[design.spacing] || PAD.normal,
        center: design.align !== "left",
        heading: dark ? "text-white" : "text-[#0b0b2e]",
        body: dark ? "text-white/80" : "text-slate-600",
        eyebrow: dark ? "text-white" : "text-[#1D1D7E]",
        eyebrowIcon: dark ? "bg-white/15 text-white" : "bg-[#5DB4D1]/15 text-[#2b7fa0]",
    };
}

// Accent colour for numbers, ticks and step badges
function accentOf(design = {}, dark) {
    const c = resolveColor(design.accent);
    if (!c) return dark ? { solid: "#5DB4D1", on: "#0b0b2e" } : { solid: "#1D1D7E", on: "#ffffff" };
    const solid = c.background.startsWith("#") ? c.background : "#1D1D7E";
    return { solid, fill: c.background, on: c.dark ? "#ffffff" : "#0b0b2e" };
}

function Eyebrow({ children, l }) {
    if (!children) return null;
    return (
        <p className={`flex items-center gap-2.5 text-sm font-bold ${l.eyebrow} ${l.center ? "justify-center" : ""}`}>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center ${l.eyebrowIcon}`}><Sparkles size={15} aria-hidden="true" /></span>
            {children}
        </p>
    );
}

function Heading({ children, l, center = l?.center }) {
    if (!children) return null;
    return <h2 className={`mt-4 text-3xl md:text-[2.6rem] font-bold leading-tight tracking-tight ${l.heading} ${center ? "text-center" : ""}`}>{children}</h2>;
}

function Header({ eyebrow, heading, intro, l }) {
    if (!eyebrow && !heading && !intro) return null;
    return (
        <div className={l.center ? "max-w-2xl mx-auto text-center" : "max-w-3xl"}>
            <Eyebrow l={l}>{eyebrow}</Eyebrow>
            <Heading l={l}>{heading}</Heading>
            {intro && <p className={`mt-4 text-lg ${l.body}`}>{intro}</p>}
        </div>
    );
}

function Action({ text, link, variant = "primary", className = "" }) {
    if (!text) return null;
    const href = link || "/contact";
    const external = /^https?:\/\//i.test(href);
    const styles = {
        primary: "bg-[#1D1D7E] text-white hover:bg-[#5DB4D1] hover:text-[#0b0b2e]",
        onDark: "bg-white text-[#1D1D7E] hover:bg-[#5DB4D1] hover:text-[#0b0b2e]",
        light: "bg-white text-[#0b0b2e] hover:bg-[#1D1D7E] hover:text-white shadow-sm",
    }[variant];
    const cls = `inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition ${styles} ${className}`;
    const body = <>{text} <ArrowRight size={16} aria-hidden="true" /></>;
    return external
        ? <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{body}</a>
        : <Link href={href} className={cls}>{body}</Link>;
}

function Section({ type, l, children, className = "" }) {
    return (
        <section className={className} style={l.style} data-section={type}>
            <div className={`max-w-[1240px] mx-auto px-5 sm:px-8 ${l.pad}`}>{children}</div>
        </section>
    );
}

// Card grid shared by "Why choose us" and "Highlight cards"
function CardGrid({ items, design = {}, l }) {
    const cols = design.columns && design.columns !== "auto" ? design.columns : items.length === 4 ? "4" : items.length === 2 ? "2" : "3";
    const grid = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[cols];
    const style = design.card_style || "tinted";
    return (
        <ul className={`mt-12 grid gap-6 ${grid}`}>
            {items.map((item, i) => {
                const own = resolveColor(item.color);
                const auto = style === "tinted" && !l.dark ? resolveColor(AUTO_CARD_COLORS[i % 3]) : null;
                const c = own || auto;
                const dark = c ? c.dark : style === "outline" ? l.dark : style === "tinted" && l.dark;
                const box = c
                    ? { background: c.background }
                    : style === "white" ? { background: "#ffffff" }
                        : style === "outline" ? { background: "transparent" }
                            : { background: "rgb(255 255 255 / 0.08)" };   // tinted on a dark section: glass
                const border = style === "outline" ? (l.dark ? "border border-white/25" : "border border-slate-200") : style === "white" && !c ? "border border-slate-100 shadow-sm" : "";
                return (
                    <li key={i} style={box} className={`flex flex-col rounded-3xl p-7 transition hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(29,29,126,0.35)] ${border} ${dark ? "text-white" : "text-[#0b0b2e]"}`} data-card="">
                        {item.Icon || item.icon ? (
                            <span className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${dark ? "bg-white/15 text-white" : "bg-white text-[#1D1D7E]"}`}>
                                {item.Icon ? <item.Icon size={22} aria-hidden="true" /> : <DynamicIcon name={item.icon} size={22} aria-hidden="true" />}
                            </span>
                        ) : null}
                        {item.title && <h3 className={`${item.Icon || item.icon ? "mt-5" : ""} text-lg font-bold`}>{item.title}</h3>}
                        {item.text && <p className={`mt-2 leading-relaxed ${dark ? "text-white/80" : "text-slate-600"}`}>{item.text}</p>}
                        {item.button_text && <div className="mt-auto pt-6"><Action text={item.button_text} link={item.button_link} variant={dark ? "onDark" : "light"} className="w-full" /></div>}
                    </li>
                );
            })}
        </ul>
    );
}

// ---------------------------------------------------------------- built-in blocks

function Intro({ block, service, phone }) {
    const d = block.design || {};
    const bg = resolveColor(d.background);
    const dark = Boolean(bg?.dark);
    const features = [service.feature_1, service.feature_2, service.feature_3, service.feature_4].filter(Boolean);
    const dial = (phone || "").replace(/[^\d+]/g, "");
    const l = { ...look(d), center: false };
    return (
        <section className={`relative overflow-hidden ${bg ? "" : "bg-gradient-to-br from-[#EAF6FB] via-white to-[#EEEEFB]"}`} style={bg ? { background: bg.background } : undefined} data-section="intro">
            <div className={`absolute right-[-10%] top-[-20%] w-[520px] h-[520px] rounded-full border-[48px] pointer-events-none ${dark ? "border-white/[0.05]" : "border-white/60"}`} aria-hidden="true" />
            <div className={`max-w-[1240px] mx-auto px-5 sm:px-8 ${PAD[d.spacing] || PAD.normal} relative grid lg:grid-cols-12 gap-12 items-center`}>
                <div className="lg:col-span-6">
                    <Eyebrow l={l}>{service.category_stack && service.category_stack !== "Others" ? service.category_stack : "Vortexian Tech"}</Eyebrow>
                    <h2 className={`mt-5 text-3xl md:text-[2.75rem] font-bold leading-[1.15] tracking-tight ${l.heading}`}>{service.short_description || service.service_title}</h2>
                    {features.length > 0 && (
                        <ul className="mt-8 grid sm:grid-cols-2 gap-3">
                            {features.map((f, i) => (
                                <li key={i} className={`flex items-start gap-3 rounded-xl px-4 py-3 shadow-sm text-[15px] font-semibold ${dark ? "bg-white/10 text-white" : "bg-white/80 border border-white text-slate-700"}`}>
                                    <CheckCircle2 size={19} className="shrink-0 mt-0.5 text-[#5DB4D1]" aria-hidden="true" /> {f}
                                </li>
                            ))}
                        </ul>
                    )}
                    <div className="mt-9 flex flex-wrap items-center gap-4">
                        <Action text="Get A Free Quote" link="/contact" variant={dark ? "onDark" : "primary"} />
                        {dial.length >= 6 && (
                            <a href={`tel:${dial}`} className={`inline-flex items-center gap-2 text-sm font-bold ${dark ? "text-white" : "text-[#0b0b2e] hover:text-[#1D1D7E]"}`}>
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
    const items = WHY.filter((w) => service[w.key]).map((w) => ({ title: w.title, Icon: w.Icon, text: service[w.key] }));
    if (!items.length) return null;
    const l = look(block.design, tone);
    return (
        <Section type="why" l={l}>
            <Header eyebrow="Why choose us" heading={block.heading || "Why Choose Vortexian Tech?"} l={l} />
            <CardGrid items={items} design={block.design} l={l} />
        </Section>
    );
}

function Overview({ block, service, tone }) {
    if (!service.long_description) return null;
    const l = look(block.design, tone);
    return (
        <Section type="overview" l={{ ...l, center: false }}>
            <div className="max-w-[860px] mx-auto">
                <Header eyebrow="Overview" heading={block.heading || `About our ${service.service_title}`} l={{ ...l, center: false }} />
                <div className="mt-8">
                    <ReadMore collapsed={block.collapsed !== false} fade={l.fade} dark={l.dark}>
                        <RichText html={service.long_description} className={`text-[17px] ${l.dark ? "rich-content-invert" : "text-slate-700"}`} />
                    </ReadMore>
                </div>
            </div>
        </Section>
    );
}

// ---------------------------------------------------------------- custom sections

function Cards({ block, tone }) {
    const l = look(block.design, tone);
    return (
        <Section type="cards" l={l}>
            <Header eyebrow={block.eyebrow} heading={block.heading} intro={block.intro} l={l} />
            <CardGrid items={block.items || []} design={block.design} l={l} />
        </Section>
    );
}

function Steps({ block, tone }) {
    const items = block.items || [];
    const l = look(block.design, tone);
    const a = accentOf(block.design, l.dark);
    return (
        <Section type="steps" l={l}>
            <Header eyebrow={block.eyebrow} heading={block.heading} intro={block.intro} l={l} />
            <ol className={`mt-14 grid gap-8 sm:grid-cols-2 ${items.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
                {items.map((item, i) => (
                    <li key={i} className="relative">
                        {i < items.length - 1 && <span className="hidden lg:block absolute top-7 left-16 right-[-2rem] border-t-2 border-dashed opacity-50" style={{ borderColor: a.solid }} aria-hidden="true" />}
                        <span className="relative w-14 h-14 rounded-2xl text-xl font-black flex items-center justify-center shadow-[0_12px_25px_-10px_rgba(29,29,126,0.6)]" style={{ background: a.fill || a.solid, color: a.on }}>{i + 1}</span>
                        {item.title && <h3 className={`mt-5 text-lg font-bold ${l.heading}`}>{item.title}</h3>}
                        {item.text && <p className={`mt-2 leading-relaxed ${l.body}`}>{item.text}</p>}
                    </li>
                ))}
            </ol>
        </Section>
    );
}

function Stats({ block, tone }) {
    const items = block.items || [];
    const l = look(block.design, tone);
    const a = accentOf(block.design, false);   // numbers sit on white boxes
    return (
        <Section type="stats" l={l}>
            {(block.eyebrow || block.heading) && <div className="mb-12"><Header eyebrow={block.eyebrow} heading={block.heading} l={l} /></div>}
            <dl className={`grid gap-6 grid-cols-2 ${items.length >= 4 ? "lg:grid-cols-4" : items.length === 3 ? "lg:grid-cols-3" : ""}`}>
                {items.map((item, i) => (
                    <div key={i} className="rounded-3xl bg-white border border-slate-100 shadow-sm p-7 text-center">
                        <dd className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: a.solid }}>{item.value}</dd>
                        <dt className="mt-2 text-sm font-semibold uppercase tracking-wider text-slate-500">{item.label}</dt>
                    </div>
                ))}
            </dl>
        </Section>
    );
}

function Checklist({ block, tone }) {
    const l = { ...look(block.design, tone), center: false };
    const a = accentOf(block.design, l.dark);
    const image = block.image && (
        <div className="lg:col-span-6">
            <div className="relative w-fit max-w-full mx-auto rounded-[2rem] overflow-hidden bg-white p-2 shadow-[0_30px_60px_-20px_rgba(29,29,126,0.3)]">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded image */}
                <img src={block.image} alt={block.image_alt || ""} loading="lazy" className="block max-w-full h-auto max-h-[60vh] rounded-[1.6rem]" />
            </div>
        </div>
    );
    return (
        <Section type="checklist" l={l}>
            <div className="grid lg:grid-cols-12 gap-12 items-center">
                {block.image_side === "left" && image}
                <div className={block.image ? "lg:col-span-6" : "lg:col-span-12 max-w-3xl"}>
                    <Eyebrow l={l}>{block.eyebrow}</Eyebrow>
                    <Heading l={l}>{block.heading}</Heading>
                    {block.text && <p className={`mt-4 text-lg leading-relaxed whitespace-pre-line ${l.body}`}>{block.text}</p>}
                    {block.items?.length > 0 && (
                        <ul className="mt-7 space-y-3.5">
                            {block.items.map((p, i) => (
                                <li key={i} className={`flex items-start gap-3 text-[16px] ${l.dark ? "text-white/90" : "text-slate-700"}`}>
                                    <CheckCircle2 size={21} className="shrink-0 mt-0.5" style={{ color: a.solid }} aria-hidden="true" /> {p}
                                </li>
                            ))}
                        </ul>
                    )}
                    {block.button_text && <div className="mt-8"><Action text={block.button_text} link={block.button_link} variant={l.dark ? "onDark" : "primary"} /></div>}
                </div>
                {block.image_side !== "left" && image}
            </div>
        </Section>
    );
}

function Faq({ block, tone }) {
    const l = { ...look(block.design, tone), center: false };
    return (
        <Section type="faq" l={l}>
            <div className="grid lg:grid-cols-12 gap-12">
                <div className="lg:col-span-5">
                    <Eyebrow l={l}>{block.eyebrow || "FAQ"}</Eyebrow>
                    <Heading l={l}>{block.heading || "Frequently asked questions"}</Heading>
                    {block.text && <p className={`mt-4 leading-relaxed whitespace-pre-line ${l.body}`}>{block.text}</p>}
                    {block.button_text && <div className="mt-8"><Action text={block.button_text} link={block.button_link} variant={l.dark ? "onDark" : "primary"} /></div>}
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
    let shade = 0;   // alternate white / tinted backgrounds between sections with an automatic background
    return blocks.map((block) => {
        const key = block.id || block.type;
        if (block.type === "intro") return <Intro key={key} block={block} service={service} phone={phone} />;
        if (block.type === "cta") return <CtaBand key={key} block={block} />;
        if (block.type === "pricing") {
            const pricing = parsePricing(service.pricing);
            if (!pricing?.plans?.some((p) => p?.name) || (!pricing.enabled && !preview)) return null;
            const bg = resolveColor(block.design?.background);
            return (
                <section key={key} style={{ background: bg ? bg.background : "#ffffff" }} data-section="pricing">
                    <ServicePricing pricing={service.pricing} serviceTitle={service.service_title} preview={preview} dark={Boolean(bg?.dark)} />
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
