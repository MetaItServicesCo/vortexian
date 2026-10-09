"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, BadgeCheck, Bot, ChevronRight, Code2, ExternalLink, FileText, Map as MapIcon, Loader2 } from "lucide-react";
import { CONTENT_SECTIONS, resolveSection } from "@/content/registry";

const SEO_SECTIONS = CONTENT_SECTIONS.filter((s) => s.group === "SEO & Tracking");
const ICONS = {
    "seo.verification": BadgeCheck,
    "seo.tracking": BarChart3,
    "seo.sitemap": MapIcon,
    "seo.robots": FileText,
    "seo.llms": Bot,
    "seo.schema": Code2,
};

const On = ({ children = "On" }) => <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">{children}</span>;
const Off = ({ children = "Off" }) => <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500">{children}</span>;

function status(key, v, sitemapCount) {
    switch (key) {
        case "seo.verification":
            return (
                <>
                    {v.google_site_verification ? <On>Google ✓</On> : <Off>Google not set</Off>}
                    {v.bing_site_verification ? <On>Bing ✓</On> : <Off>Bing not set</Off>}
                </>
            );
        case "seo.tracking":
            return (
                <>
                    {v.ga_enabled ? <On>Analytics {v.ga_measurement_id}</On> : <Off>Analytics off</Off>}
                    {v.clarity_enabled ? <On>Clarity {v.clarity_project_id}</On> : <Off>Clarity off</Off>}
                </>
            );
        case "seo.sitemap":
            return v.enabled ? <On>{sitemapCount == null ? "On" : `On · ${sitemapCount} addresses`}</On> : <Off />;
        case "seo.robots":
        case "seo.llms":
            return v.use_recommended ? <On>Recommended</On> : <On>Custom</On>;
        case "seo.schema": {
            const n = (v.blocks || []).filter((b) => (b.json || "").trim()).length;
            return v.enabled ? <On>{`On · ${n} block${n === 1 ? "" : "s"}`}</On> : <Off />;
        }
        default:
            return null;
    }
}

export default function SeoHub() {
    const [values, setValues] = useState(null);
    const [sitemapCount, setSitemapCount] = useState(null);

    useEffect(() => {
        let cancelled = false;
        fetch("/api/content/", { cache: "no-store" })
            .then((res) => (res.ok ? res.json() : {}))
            .catch(() => ({}))
            .then((saved) => {
                if (!cancelled) setValues(Object.fromEntries(SEO_SECTIONS.map((s) => [s.key, resolveSection(s.key, saved)])));
            });
        fetch("/sitemap.xml", { cache: "no-store" })
            .then((res) => (res.ok ? res.text() : null))
            .then((xml) => !cancelled && xml && setSitemapCount((xml.match(/<url>/g) || []).length))
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="max-w-5xl space-y-8">
            <div>
                <h1 className="text-3xl font-black text-[#1D1D7E] uppercase tracking-tighter">SEO &amp; Tracking</h1>
                <p className="text-slate-500 mt-2 max-w-2xl">
                    Everything search engines, analytics and AI assistants read from the website. Changes go live as soon as you save.
                </p>
            </div>

            {!values ? (
                <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#1D1D7E]" /></div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {SEO_SECTIONS.map((section) => {
                        const Icon = ICONS[section.key] || FileText;
                        return (
                            <div key={section.key} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 shrink-0 rounded-xl bg-[#EEF0FF] text-[#1D1D7E] flex items-center justify-center">
                                        <Icon size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="font-bold text-slate-800">{section.title}</h2>
                                        <p className="text-sm text-slate-500 mt-0.5">{section.description}</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1.5 mt-4" data-testid={`status-${section.key}`}>
                                    {status(section.key, values[section.key], sitemapCount)}
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                                    {section.viewUrl ? (
                                        <a href={section.viewUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-[#1D1D7E]">
                                            {section.viewUrl} <ExternalLink size={13} />
                                        </a>
                                    ) : (
                                        <span />
                                    )}
                                    <Link
                                        href={`/dashboard/seo/${section.key}`}
                                        className="inline-flex items-center gap-1 rounded-lg bg-[#1D1D7E] text-white px-3 py-1.5 text-sm font-semibold hover:bg-[#16166a]"
                                    >
                                        Edit <ChevronRight size={15} />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-slate-800">After going live</h2>
                <ol className="mt-3 space-y-2 text-sm text-slate-600 list-decimal pl-5">
                    <li>Google Search Console → verify the site (the verification tag is already on every page), then Sitemaps → submit <code className="text-[#1D1D7E]">/sitemap.xml</code>.</li>
                    <li>Google Analytics → Realtime: open the website in another browser and check that your visit appears.</li>
                    <li>Microsoft Clarity → Recordings: sessions appear within about an hour.</li>
                    <li>Test the schema markup with Google&apos;s <a className="underline" href="https://search.google.com/test/rich-results" target="_blank" rel="noopener noreferrer">Rich Results Test</a>.</li>
                </ol>
            </div>
        </div>
    );
}
