"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CONTENT_GROUPS, CONTENT_SECTIONS } from "@/content/registry";

export default function SiteContentIndex() {
    return (
        <div className="max-w-5xl space-y-10">
            <div>
                <h1 className="text-3xl font-black text-[#1D1D7E] uppercase tracking-tighter">Site Content</h1>
                <p className="text-slate-500 mt-2 max-w-2xl">
                    Edit the text, images and links on every page. Changes go live as soon as you save.
                    Lists like services, team, blog posts and testimonials are managed in their own sections.
                </p>
            </div>

            {CONTENT_GROUPS.map((group) => {
                const sections = CONTENT_SECTIONS.filter((s) => s.group === group);
                if (!sections.length) return null;
                return (
                    <section key={group}>
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3">{group}</h2>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
                            {sections.map((section) => (
                                <Link
                                    key={section.key}
                                    href={`/dashboard/content/${section.key}`}
                                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-800 group-hover:text-[#1D1D7E]">{section.title}</p>
                                        {section.description && (
                                            <p className="text-sm text-slate-400 truncate">{section.description}</p>
                                        )}
                                    </div>
                                    <ChevronRight size={18} className="text-slate-300 group-hover:text-[#1D1D7E]" />
                                </Link>
                            ))}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}
