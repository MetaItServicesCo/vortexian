import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

// Pricing section of a service page. Every word and price comes from the
// service editor (Dashboard → Manage Services → Pricing); nothing is fixed here.
// Also used as the live preview inside the editor.

export function parsePricing(raw) {
    if (!raw) return null;
    try {
        const data = typeof raw === "string" ? JSON.parse(raw) : raw;
        return data && typeof data === "object" ? data : null;
    } catch {
        return null;
    }
}

function PlanButton({ plan }) {
    if (!plan.button_text) return null;
    const href = plan.button_link || "/contact";
    const className = `mt-8 block w-full text-center rounded-xl py-3.5 text-xs font-black uppercase tracking-widest transition-all duration-300 ${plan.highlighted
        ? "bg-[#5DB4D1] text-[#0b0b2e] hover:bg-white"
        : "border border-white/25 text-white hover:bg-white hover:text-[#1D1D7E]"}`;
    return /^https?:\/\//i.test(href)
        ? <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{plan.button_text}</a>
        : <Link href={href} className={className}>{plan.button_text}</Link>;
}

export default function ServicePricing({ pricing, serviceTitle, preview = false }) {
    const data = parsePricing(pricing);
    const plans = (data?.plans || []).filter((p) => p?.name);
    if (!data || (!data.enabled && !preview) || !plans.length) return null;

    return (
        <section id="pricing" aria-labelledby="pricing-heading" className={`max-w-[1400px] mx-auto relative z-10 ${preview ? "py-10 px-4 sm:px-6" : "py-20 px-4 sm:px-8 md:px-16 lg:px-24"}`} data-service-pricing="">
            <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 id="pricing-heading" className="text-3xl md:text-4xl font-black text-white tracking-tight">
                    {data.heading || (serviceTitle ? `${serviceTitle} Pricing` : "Pricing")}
                </h2>
                {data.intro && <p className="mt-4 text-white/70 text-base md:text-lg">{data.intro}</p>}
            </div>

            <ul className="flex flex-wrap justify-center gap-6 lg:gap-8">
                {plans.map((plan, i) => (
                    <li key={`${plan.name}-${i}`}
                        className={`relative w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-22px)] min-w-[min(100%,260px)] max-w-[400px] flex flex-col rounded-[2rem] p-8 backdrop-blur-lg transition-transform duration-300 ${plan.highlighted
                            ? "bg-gradient-to-b from-[#1D1D7E] to-[#2b2b9e] border-2 border-[#5DB4D1] shadow-[0_25px_60px_-15px_rgba(93,180,209,0.45)] lg:-translate-y-3"
                            : "bg-white/[0.07] border border-white/[0.12] hover:border-white/25"}`}
                        data-plan={plan.name}>
                        {plan.badge && (
                            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#5DB4D1] text-[#0b0b2e] text-[11px] font-black uppercase tracking-widest px-4 py-1.5 shadow-lg">
                                {plan.badge}
                            </span>
                        )}
                        <h3 className="text-lg font-black text-white uppercase tracking-wider">{plan.name}</h3>
                        {(plan.price || plan.period) && (
                            <p className="mt-4 flex flex-wrap items-baseline gap-x-2">
                                {plan.price && <span className="text-4xl md:text-5xl font-black text-white tracking-tight break-words">{plan.price}</span>}
                                {plan.period && <span className="text-sm font-semibold text-white/60">{plan.period}</span>}
                            </p>
                        )}
                        {plan.description && <p className="mt-4 text-sm text-white/70 leading-relaxed">{plan.description}</p>}
                        {plan.features?.length > 0 && (
                            <ul className="mt-6 space-y-3 border-t border-white/10 pt-6">
                                {plan.features.map((f, j) => (
                                    <li key={j} className="flex items-start gap-3 text-sm text-white/85">
                                        <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-[#5DB4D1]" aria-hidden="true" />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="mt-auto"><PlanButton plan={plan} /></div>
                    </li>
                ))}
            </ul>

            {data.note && <p className="mt-10 text-center text-xs text-white/50 max-w-2xl mx-auto">{data.note}</p>}
        </section>
    );
}
