import dbConnect from "@/lib/db";
import Portfolio from "@/models/Portfolio";
import { notFound } from "next/navigation";
import Link from "next/link";
import BreadcrumbHero from "@/components/BreadcrumbHero";

// ============================================================
// DYNAMIC SEO METADATA
// ============================================================
export async function generateMetadata({ params }) {
    try {
        await dbConnect();
        const { slug } = await params;
        const project = await Portfolio.findOne({ slug });

        if (!project) return { title: "Case Study | Vortexian Tech" };

        return {
            title: project.seoTitle || `${project.title} | Case Study — Vortexian Tech`,
            description: project.seoDescription || `In-depth breakdown of ${project.title}. Discover how Vortexian Tech executed this project with precision and expertise.`,
            keywords: project.seoKeywords || `${project.category}, Web Development, Custom Architecture, Vortexian Tech`,
            openGraph: {
                title: project.seoTitle || project.title,
                description: project.seoDescription,
                images: [{ url: project.mainImage }],
                type: "article",
            },
        };
    } catch {
        return { title: "Case Study | Vortexian Tech" };
    }
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================
export default async function PortfolioDetailPage({ params }) {
    await dbConnect();
    const { slug } = await params;
    const project = await Portfolio.findOne({ slug });

    if (!project) notFound();

    const nodeId = project._id.toString().substring(18);

    return (
        <main className="min-h-screen bg-[#0d0e12] text-white font-sans pb-32 relative overflow-hidden selection:bg-[#5DB4D1]/30">

            {/* Ambient background glows */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#1D1D7E]/10 rounded-full blur-[140px] pointer-events-none -z-10" aria-hidden="true" />
            <div className="absolute bottom-1/4 right-10 w-[400px] h-[400px] bg-[#5DB4D1]/5 rounded-full blur-[120px] pointer-events-none -z-10" aria-hidden="true" />
            <div className="absolute top-1/3 left-[-10%] w-[350px] h-[350px] bg-purple-950/10 rounded-full blur-[100px] pointer-events-none -z-10" aria-hidden="true" />

            {/* Breadcrumb top bar */}
            <BreadcrumbHero
                title="Case Study"
                currentPage={project.title ? project.title.toUpperCase() : "DETAIL"}
            />

            <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24 mt-12 relative z-10">

                {/* ── BACK LINK ─────────────────────────────────────── */}
                <Link href="/portfolio" className="inline-flex items-center gap-2.5 text-xs font-black uppercase tracking-[0.25em] text-gray-500 hover:text-[#5DB4D1] transition-colors mb-12 group cursor-pointer">
                    <svg
                        className="transform transition-transform group-hover:-translate-x-1 duration-300"
                        width="14" height="14" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor"
                        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M19 12H5" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                    Back to portfolio
                </Link>

                {/* ── HERO HEADER BLOCK ─────────────────────────────── */}
                <header className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20 items-end mb-20">
                    <div className="lg:col-span-7 space-y-3">
                        <span className="text-[#5DB4D1] text-xs font-black uppercase tracking-[0.3em] block">// Project overview case</span>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-white leading-[0.95]">{project.title}</h1>
                    </div>
                    <div className="lg:col-span-5 border-l-2 border-[#5DB4D1]/30 pl-6 py-2">
                        <p className="text-gray-400 text-sm md:text-base font-medium leading-relaxed">
                            An in-depth evaluation of how Vortexian Tech re-architected
                            digital positioning to unlock enterprise-grade scalability,
                            performance, and long-term operational excellence.
                        </p>
                    </div>
                </header>

                {/* ── HERO IMAGE FRAME ──────────────────────────────── */}
                <div className="relative w-full h-[50vh] md:h-[65vh] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl shadow-black/50 mb-24 group bg-neutral-900 flex items-center justify-center">
                    {project.mainImage ? (
                        <img
                            src={project.mainImage}
                            alt={`${project.title} — project visual`}
                            className="w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-102"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                                strokeLinejoin="round" aria-hidden="true">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                            </svg>
                            <span className="text-xs uppercase tracking-widest font-bold">No image available</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e12] via-transparent to-transparent opacity-60 pointer-events-none" aria-hidden="true" />

                    <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 bg-[#0d0e12]/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-white shadow-lg" aria-label="Verified by Vortexian Labs">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                            strokeLinejoin="round" aria-hidden="true" className="text-[#5DB4D1]">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <polyline points="9 12 11 14 15 10" />
                        </svg>
                        Vortexian Labs
                    </div>
                </div>

                {/* ── METADATA RIBBON ───────────────────────────────── */}
                <div className="bg-white/[0.06] border border-white/5 rounded-3xl px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm font-semibold mb-28 backdrop-blur-md shadow-lg" role="list" aria-label="Project metadata">

                    <div className="flex items-center gap-4" role="listitem">
                        <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#5DB4D1] shrink-0" aria-hidden="true">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="7" height="7" rx="1" />
                                <rect x="14" y="3" width="7" height="7" rx="1" />
                                <rect x="3" y="14" width="7" height="7" rx="1" />
                                <rect x="14" y="14" width="7" height="7" rx="1" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-black tracking-widest text-gray-500">Core Domain</p>
                            <p className="text-gray-200 mt-0.5 uppercase font-bold tracking-tight">{project.category || "—"}</p>
                        </div>
                    </div>

                    <div className="flex items-center sha gap-4" role="listitem">
                        <div className="w-11 h-11 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center text-[#5DB4D1] shrink-0" aria-hidden="true">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-black tracking-widest text-gray-500">Release Date</p>
                            <p className="text-gray-200 mt-0.5 font-bold tracking-tight">{project.year || "2026"}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4" role="listitem">
                        <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#5DB4D1] shrink-0" aria-hidden="true">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                <polyline points="9 12 11 14 15 10" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-black tracking-widest text-gray-500">Vetting Authority</p>
                            <p className="text-gray-200 mt-0.5 font-bold tracking-tight">Vortexian Labs</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4" role="listitem">
                        <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#5DB4D1] shrink-0" aria-hidden="true">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="4" y="4" width="16" height="16" rx="2" />
                                <rect x="9" y="9" width="6" height="6" />
                                <line x1="9" y1="1" x2="9" y2="4" />
                                <line x1="15" y1="1" x2="15" y2="4" />
                                <line x1="9" y1="20" x2="9" y2="23" />
                                <line x1="15" y1="20" x2="15" y2="23" />
                                <line x1="20" y1="9" x2="23" y2="9" />
                                <line x1="20" y1="14" x2="23" y2="14" />
                                <line x1="1" y1="9" x2="4" y2="9" />
                                <line x1="1" y1="14" x2="4" y2="14" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-black tracking-widest text-gray-500">Node Cluster ID</p>
                            <p className="text-[#5DB4D1] mt-0.5 font-mono text-xs max-w-[120px] truncate">#{nodeId}</p>
                        </div>
                    </div>

                </div>

                {/* ── CONTENT SECTIONS ──────────────────────────────── */}
                <div className="space-y-24">

                    {/* Section 01 — Challenge */}
                    <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 pt-12 border-t border-white/5 items-start group" aria-labelledby="sec-challenge">
                        <div className="lg:col-span-5 space-y-3">
                            <span className="text-5xl md:text-6xl font-black text-white/5 tracking-tighter uppercase leading-none select-none transition-colors group-hover:text-[#1D1D7E]/30 font-mono block" aria-hidden="true">01 //</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight  leading-none" id="sec-challenge">
                                The Business<br />Challenge Context
                            </h2>
                        </div>
                        <div className="lg:col-span-7 text-gray-400 text-base md:text-lg font-medium leading-relaxed whitespace-pre-line lg:border-l lg:border-white/5 lg:pl-12">
                            <p>
                                {project.challenge || "No challenge description provided."}
                            </p>
                        </div>
                    </section>

                    {/* Section 02 — Solution */}
                    <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 pt-12 border-t border-white/5 items-start group" aria-labelledby="sec-solution">
                        <div className="lg:col-span-5 space-y-3">
                            <span className="text-5xl md:text-6xl font-black text-white/5 tracking-tighter uppercase leading-none select-none transition-colors group-hover:text-[#5DB4D1]/20 font-mono block" aria-hidden="true">02 //</span>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white leading-none" id="sec-solution">
                                Vortexian Strategy<br />Resolved
                            </h2>
                        </div>
                        <div className="lg:col-span-7 text-gray-300 text-base md:text-lg font-medium leading-relaxed whitespace-pre-line lg:border-l lg:border-white/5 lg:pl-12">
                            <p>
                                {project.solution || "No solution description provided."}
                            </p>
                        </div>
                    </section>

                    {/* Section 03 — Results (conditional) */}
                    {project.results && (
                        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 pt-12 border-t border-white/5 items-start group" aria-labelledby="sec-results">
                            <div className="lg:col-span-5 space-y-3">
                                <span className="text-5xl md:text-6xl font-black text-white/5 tracking-tighter uppercase leading-none select-none transition-colors group-hover:text-purple-500/10 font-mono block" aria-hidden="true">03 //</span>
                                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white leading-none" id="sec-results">
                                    Results &amp;<br />Outcomes
                                </h2>
                            </div>
                            <div className="lg:col-span-7 text-gray-400 text-base md:text-lg font-medium leading-relaxed whitespace-pre-line lg:border-l lg:border-white/5 lg:pl-12">
                                <p>{project.results}</p>
                            </div>
                        </section>
                    )}

                </div>

                {/* ── TECH STACK TAGS (conditional) ─────────────────── */}
                {project.techStack && project.techStack.length > 0 && (
                    <div className="mt-28 border-t border-white/5 pt-12 ">
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#5DB4D1] mb-6">System Architecture Core</p>
                        <div className="flex flex-wrap gap-3">
                            {project.techStack.map((tech, i) => (
                                <span key={i} className="text-xs font-bold uppercase tracking-wider px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-neutral-300 hover:border-[#5DB4D1] transition-colors duration-300">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── CTA FOOTER STRIP ──────────────────────────────── */}
                <div className="mt-6 mb-4 bg-gradient-to-r from-white/[0.03] to-transparent border border-white/5 rounded-[2rem] p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 backdrop-blur-md shadow-2xl">
                    <div className="space-y-2">
                        <p className="text-xl md:text-2xl font-black uppercase tracking-tight text-white">
                            Interested in a similar engagement?
                        </p>
                        <p className="text-gray-400 text-xs md:text-sm font-medium max-w-xl leading-relaxed">
                            Partner with Vortexian Tech to architect your next digital product.
                        </p>
                    </div>
                    <Link href="/contact" className="bg-white hover:bg-[#5DB4D1] text-black rounded-xl px-6 py-4 font-black  text-xs uppercase tracking-widest flex items-center gap-2 transition-all duration-300 shadow-xl cursor-pointer group shrink-0">
                        Start a project
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="3" strokeLinecap="round"
                            strokeLinejoin="round" aria-hidden="true" className="transform transition-transform group-hover:translate-x-1 duration-300">
                            <path d="M5 12h14" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </Link>
                </div>

            </div>
        </main>
    );
}