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
        : "border border-[#1D1D7E]/25 text-[#1D1D7E] hover:bg-[#1D1D7E] hover:text-white"}`;
    return /^https?:\/\//i.test(href)
        ? <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{plan.button_text}</a>
        : <Link href={href} className={className}>{plan.button_text}</Link>;
}

export default function ServicePricing({ pricing, serviceTitle, preview = false, dark = false }) {
    const data = parsePricing(pricing);
    const plans = (data?.plans || []).filter((p) => p?.name);
    if (!data || (!data.enabled && !preview) || !plans.length) return null;

    return (
        <section id="pricing" aria-labelledby="pricing-heading" className={`max-w-[1400px] mx-auto relative z-10 ${preview ? "py-10 px-4 sm:px-6" : "py-20 px-4 sm:px-8 md:px-16 lg:px-24"}`} data-service-pricing="">
            <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 id="pricing-heading" className={`text-3xl md:text-[2.6rem] font-bold leading-tight tracking-tight ${dark ? "text-white" : "text-[#0b0b2e]"}`}>
                    {data.heading || (serviceTitle ? `${serviceTitle} Pricing` : "Pricing")}
                </h2>
                {data.intro && <p className={`mt-4 text-base md:text-lg ${dark ? "text-white/80" : "text-slate-600"}`}>{data.intro}</p>}
            </div>

            <ul className="flex flex-wrap justify-center gap-6 lg:gap-8">
                {plans.map((plan, i) => (
                    <li key={`${plan.name}-${i}`}
                        className={`relative w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-22px)] min-w-[min(100%,260px)] max-w-[400px] flex flex-col rounded-[2rem] p-8 backdrop-blur-lg transition-transform duration-300 ${plan.highlighted
                            ? "bg-gradient-to-b from-[#1D1D7E] to-[#2b2b9e] text-white border-2 border-[#5DB4D1] shadow-[0_25px_60px_-15px_rgba(29,29,126,0.55)] lg:-translate-y-3"
                            : "bg-white text-[#0b0b2e] border border-slate-200 shadow-sm hover:shadow-md"}`}
                        data-plan={plan.name}>
                        {plan.badge && (
                            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#5DB4D1] text-[#0b0b2e] text-[11px] font-black uppercase tracking-widest px-4 py-1.5 shadow-lg">
                                {plan.badge}
                            </span>
                        )}
                        <h3 className="text-lg font-black uppercase tracking-wider">{plan.name}</h3>
                        {(plan.price || plan.period) && (
                            <p className="mt-4 flex flex-wrap items-baseline gap-x-2">
                                {plan.price && <span className={`text-4xl md:text-5xl font-black tracking-tight break-words ${plan.highlighted ? "text-white" : "text-[#1D1D7E]"}`}>{plan.price}</span>}
                                {plan.period && <span className={`text-sm font-semibold ${plan.highlighted ? "text-white/70" : "text-slate-500"}`}>{plan.period}</span>}
                            </p>
                        )}
                        {plan.description && <p className={`mt-4 text-sm leading-relaxed ${plan.highlighted ? "text-white/80" : "text-slate-600"}`}>{plan.description}</p>}
                        {plan.features?.length > 0 && (
                            <ul className={`mt-6 space-y-3 border-t pt-6 ${plan.highlighted ? "border-white/15" : "border-slate-100"}`}>
                                {plan.features.map((f, j) => (
                                    <li key={j} className={`flex items-start gap-3 text-sm ${plan.highlighted ? "text-white/90" : "text-slate-700"}`}>
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

            {data.note && <p className={`mt-10 text-center text-xs max-w-2xl mx-auto ${dark ? "text-white/60" : "text-slate-500"}`}>{data.note}</p>}
        </section>
    );
}
