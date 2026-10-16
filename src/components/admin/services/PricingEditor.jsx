"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Plus, Star, Trash2 } from "lucide-react";
import ServicePricing, { parsePricing } from "@/components/services/ServicePricing";

// Pricing section editor for a service (stored in Service.pricing, cleaned by backend/app/pricing.py).
// Value: { enabled, heading, intro, note, plans: [{ uid, name, price, period, badge, description,
//          featuresText, button_text, button_link, highlighted }] }

export const MAX_PLANS = 12;
let counter = 0;
const uid = () => `plan-${Date.now()}-${counter++}`;

export const blankPlan = () => ({
    uid: uid(), name: "", price: "", period: "", badge: "", description: "",
    featuresText: "", button_text: "Get a Free Quote", button_link: "/contact", highlighted: false,
});

// Stored JSON -> editor value
export function pricingFromStored(raw) {
    const data = parsePricing(raw);
    return {
        enabled: Boolean(data?.enabled),
        heading: data?.heading || "",
        intro: data?.intro || "",
        note: data?.note || "",
        plans: (data?.plans || []).map((p) => ({ ...blankPlan(), ...p, featuresText: (p.features || []).join("\n") })),
    };
}

const toPlan = ({ uid: _uid, featuresText, ...p }) => ({
    ...p,
    features: featuresText.split("\n").map((f) => f.trim()).filter(Boolean),
});

// Editor value -> JSON for the API ("" when there is nothing to store)
export function pricingToStored(value) {
    const plans = value.plans.map(toPlan).filter((p) => p.name || p.price || p.description || p.features.length);
    if (!plans.length && !value.heading.trim() && !value.intro.trim()) return "";
    return JSON.stringify({ enabled: value.enabled, heading: value.heading, intro: value.intro, note: value.note, plans });
}

// A message for the first problem, or "" when it can be saved
export function pricingError(value) {
    const i = value.plans.findIndex((p) => !p.name.trim() && (p.price.trim() || p.description.trim() || p.featuresText.trim()));
    if (i >= 0) return `Pricing: plan ${i + 1} needs a name.`;
    if (value.enabled && !value.plans.some((p) => p.name.trim())) return "Pricing: add at least one plan, or switch the pricing section off.";
    return "";
}

const input = "w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1D1D7E]/40 text-sm text-slate-800";
const label = "text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1";

function Field({ text, hint, children }) {
    return (
        <label className="block">
            <span className={label}>{text}</span>
            {children}
            {hint && <span className="block mt-1 text-[11px] text-slate-400">{hint}</span>}
        </label>
    );
}

export default function PricingEditor({ value, onChange, serviceTitle }) {
    const [preview, setPreview] = useState(false);
    const set = (patch) => onChange({ ...value, ...patch });
    const setPlan = (i, patch) => set({ plans: value.plans.map((p, j) => (j === i ? { ...p, ...patch } : p)) });
    const move = (i, d) => {
        const plans = [...value.plans];
        [plans[i], plans[i + d]] = [plans[i + d], plans[i]];
        set({ plans });
    };
    const remove = (i) => {
        const p = value.plans[i];
        if ((p.name || p.price || p.featuresText) && !confirm(`Remove the plan “${p.name || `Plan ${i + 1}`}”?`)) return;
        set({ plans: value.plans.filter((_, j) => j !== i) });
    };
    const addPlan = () => set({ plans: [...value.plans, blankPlan()], enabled: value.enabled || value.plans.length === 0 });

    return (
        <section className="border border-gray-200 rounded-2xl p-5 md:p-6 space-y-5 bg-slate-50/50" aria-labelledby="pricing-editor-title" data-pricing-editor="">
            <div className="flex flex-wrap items-start gap-3">
                <div className="flex-1 min-w-[220px]">
                    <h2 id="pricing-editor-title" className="text-sm font-black uppercase tracking-wider text-[#1D1D7E]">Pricing section</h2>
                    <p className="text-xs text-slate-500 mt-1">Plans, prices and features for this service&apos;s page. Write prices any way you like: “$499”, “From $15/hour”, “Custom quote”.</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-semibold text-slate-700">
                    <input type="checkbox" className="w-4 h-4 accent-[#1D1D7E]" checked={value.enabled} onChange={(e) => set({ enabled: e.target.checked })} id="pricing-enabled" />
                    Show on the service page
                </label>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <Field text="Section heading" hint={`Leave empty for “${serviceTitle ? `${serviceTitle} Pricing` : "Pricing"}”.`}>
                    <input id="pricing-heading" className={input} value={value.heading} maxLength={120} onChange={(e) => set({ heading: e.target.value })} placeholder="e.g. Simple, transparent pricing" />
                </Field>
                <Field text="Short introduction (optional)">
                    <input id="pricing-intro" className={input} value={value.intro} maxLength={400} onChange={(e) => set({ intro: e.target.value })} placeholder="e.g. Choose the plan that fits your team." />
                </Field>
            </div>

            <ol className="space-y-4">
                {value.plans.map((plan, i) => (
                    <li key={plan.uid} className={`bg-white rounded-2xl border p-4 md:p-5 space-y-4 ${plan.highlighted ? "border-[#5DB4D1] ring-2 ring-[#5DB4D1]/20" : "border-gray-200"}`} data-plan-editor={i + 1}>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Plan {i + 1}</span>
                            <span className="font-bold text-slate-800 truncate">{plan.name}</span>
                            <div className="ml-auto flex items-center gap-1">
                                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move plan ${i + 1} up`} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowUp size={15} /></button>
                                <button type="button" onClick={() => move(i, 1)} disabled={i === value.plans.length - 1} aria-label={`Move plan ${i + 1} down`} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowDown size={15} /></button>
                                <button type="button" onClick={() => value.plans.length < MAX_PLANS && set({ plans: [...value.plans.slice(0, i + 1), { ...plan, uid: uid(), name: plan.name ? `${plan.name} (copy)` : "" }, ...value.plans.slice(i + 1)] })}
                                    disabled={value.plans.length >= MAX_PLANS} aria-label={`Duplicate plan ${i + 1}`} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30"><Copy size={15} /></button>
                                <button type="button" onClick={() => remove(i)} aria-label={`Remove plan ${i + 1}`} className="p-1.5 rounded-md text-red-500 hover:bg-red-50"><Trash2 size={15} /></button>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Field text="Plan name *"><input className={input} value={plan.name} maxLength={80} onChange={(e) => setPlan(i, { name: e.target.value })} placeholder="e.g. Starter" aria-label={`Plan ${i + 1} name`} /></Field>
                            <Field text="Badge (optional)"><input className={input} value={plan.badge} maxLength={30} onChange={(e) => setPlan(i, { badge: e.target.value })} placeholder="e.g. Most popular" aria-label={`Plan ${i + 1} badge`} /></Field>
                            <Field text="Price"><input className={input} value={plan.price} maxLength={40} onChange={(e) => setPlan(i, { price: e.target.value })} placeholder="e.g. $499 · From $15 · Custom" aria-label={`Plan ${i + 1} price`} /></Field>
                            <Field text="Price note (optional)"><input className={input} value={plan.period} maxLength={40} onChange={(e) => setPlan(i, { period: e.target.value })} placeholder="e.g. /month · one-time · per hour" aria-label={`Plan ${i + 1} price note`} /></Field>
                        </div>
                        <Field text="Description (optional)">
                            <textarea className={`${input} resize-y`} rows={2} value={plan.description} maxLength={400} onChange={(e) => setPlan(i, { description: e.target.value })} placeholder="Who this plan is for" aria-label={`Plan ${i + 1} description`} />
                        </Field>
                        <Field text="Features" hint="One per line, shown with a tick. Up to 30.">
                            <textarea className={`${input} resize-y`} rows={4} value={plan.featuresText} onChange={(e) => setPlan(i, { featuresText: e.target.value })} placeholder={"e.g. Up to 5 pages\nMobile friendly\n1 month support"} aria-label={`Plan ${i + 1} features`} />
                        </Field>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Field text="Button text" hint="Leave empty for no button."><input className={input} value={plan.button_text} maxLength={40} onChange={(e) => setPlan(i, { button_text: e.target.value })} aria-label={`Plan ${i + 1} button text`} /></Field>
                            <Field text="Button link" hint="A page on this site (/contact) or a full web address."><input className={input} value={plan.button_link} maxLength={300} onChange={(e) => setPlan(i, { button_link: e.target.value })} aria-label={`Plan ${i + 1} button link`} /></Field>
                        </div>
                        <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 accent-[#1D1D7E]" checked={plan.highlighted} onChange={(e) => setPlan(i, { highlighted: e.target.checked })} aria-label={`Highlight plan ${i + 1}`} />
                            <Star size={14} className="text-[#5DB4D1]" /> Highlight this plan
                        </label>
                    </li>
                ))}
            </ol>

            <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={addPlan} disabled={value.plans.length >= MAX_PLANS}
                    className="inline-flex items-center gap-2 bg-[#1D1D7E] text-white px-4 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50" data-add-plan="">
                    <Plus size={16} /> Add a plan
                </button>
                <span className="text-xs text-slate-400">{value.plans.length} of {MAX_PLANS} plans</span>
                {value.plans.some((p) => p.name.trim()) && (
                    <button type="button" onClick={() => setPreview((v) => !v)} className="ml-auto inline-flex items-center gap-2 text-sm font-semibold text-[#1D1D7E]">
                        {preview ? <EyeOff size={16} /> : <Eye size={16} />} {preview ? "Hide preview" : "Preview"}
                    </button>
                )}
            </div>

            <Field text="Small print below the plans (optional)">
                <input id="pricing-note" className={input} value={value.note} maxLength={300} onChange={(e) => set({ note: e.target.value })} placeholder="e.g. Prices exclude VAT. Need something else? Contact us for a custom quote." />
            </Field>

            {preview && (
                <div className="rounded-2xl overflow-hidden bg-white border border-slate-200" data-pricing-preview="">
                    <ServicePricing pricing={pricingToStored(value)} serviceTitle={serviceTitle} preview />
                </div>
            )}
        </section>
    );
}
