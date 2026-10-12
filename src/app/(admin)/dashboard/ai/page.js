"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Database, Loader2, MessageSquare, RefreshCw, Search, Settings, Sparkles } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { adminFetch } from "@/lib/adminApi";
import { formatReceived } from "@/components/admin/enquiries/EnquiryModal";

const KB_LABELS = {
    empty: ["Not built yet", "bg-slate-100 text-slate-600"],
    indexing: ["Refreshing…", "bg-blue-50 text-blue-700"],
    ready: ["Up to date", "bg-emerald-50 text-emerald-700"],
    error: ["Last refresh failed", "bg-red-50 text-red-700"],
    unavailable: ["Needs setup", "bg-amber-50 text-amber-800"],
};

function Card({ title, icon: Icon, children, action }) {
    return (
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
            <div className="flex items-center gap-2 mb-4">
                <Icon size={18} className="text-[#1D1D7E]" />
                <h2 className="font-black text-[#1D1D7E] uppercase tracking-tight text-sm flex-1">{title}</h2>
                {action}
            </div>
            {children}
        </section>
    );
}

function Row({ label, children }) {
    return (
        <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-2 border-b border-slate-50 last:border-0 text-sm">
            <span className="text-slate-500">{label}</span>
            <span className="font-semibold text-slate-800 text-right break-all">{children}</span>
        </div>
    );
}

export default function AIAssistantPage() {
    const [status, setStatus] = useState(null);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState(null);
    const [searching, setSearching] = useState(false);

    const load = useCallback(() => adminFetch("/api/ai/admin/status").then(setStatus, (err) => toast.error(err.message)), []);

    useEffect(() => { load(); }, [load]);

    // While refreshing, check again every few seconds
    useEffect(() => {
        if (status?.knowledge?.status !== "indexing") return;
        const t = setInterval(load, 3000);
        return () => clearInterval(t);
    }, [status?.knowledge?.status, load]);

    const refresh = async () => {
        try {
            const res = await adminFetch("/api/ai/admin/knowledge/refresh", { method: "POST" });
            toast.success(res.message);
            setStatus((s) => ({ ...s, knowledge: { ...s.knowledge, status: "indexing", message: "Reading the website…" } }));
        } catch (err) {
            toast.error(err.message);
        }
    };

    const search = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        setSearching(true);
        try {
            setResults((await adminFetch(`/api/ai/admin/knowledge/search?q=${encodeURIComponent(query.trim())}`)).results);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSearching(false);
        }
    };

    if (!status) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-[#1D1D7E]" /></div>;

    const kb = status.knowledge;
    const [kbLabel, kbClass] = KB_LABELS[kb.status] || KB_LABELS.empty;

    return (
        <div className="max-w-5xl space-y-6">
            <Toaster position="top-center" />
            <div className="flex flex-wrap items-start gap-4">
                <div className="flex-1 min-w-[240px]">
                    <h1 className="text-3xl font-black text-[#1D1D7E] uppercase tracking-tighter">AI Assistant</h1>
                    <p className="text-slate-500 mt-1">The chat assistant on the website: it answers visitors from your website content and collects leads from visitors who stay quiet.</p>
                </div>
                <Link href="/dashboard/ai/settings" className="inline-flex items-center gap-2 bg-[#1D1D7E] text-white px-4 py-2.5 rounded-xl font-semibold text-sm">
                    <Settings size={16} /> Settings
                </Link>
            </div>

            {status.problem || !status.enabled ? (
                <div className="flex gap-3 items-start bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4" role="status">
                    <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-bold">The assistant is not showing on the website.</p>
                        <p>{!status.enabled ? "It is switched off in Settings." : `${status.problem} Add the key to the server's environment file and restart the backend.`}</p>
                    </div>
                </div>
            ) : (
                <div className="flex gap-3 items-center bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-4 text-sm" role="status">
                    <CheckCircle2 size={20} className="shrink-0" />
                    <p><span className="font-bold">Live on the website.</span> {status.idle_enabled ? `Quiet visitors get the lead capture message after ${status.idle_seconds} seconds.` : "The lead capture message is switched off."}</p>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                <Card title="Knowledge base" icon={Database} action={
                    <button type="button" onClick={refresh} disabled={kb.status === "indexing"}
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1D1D7E] border border-[#1D1D7E]/20 rounded-lg px-3 py-1.5 hover:bg-[#1D1D7E]/5 disabled:opacity-50">
                        <RefreshCw size={13} className={kb.status === "indexing" ? "animate-spin" : ""} /> Refresh now
                    </button>
                }>
                    <p className="mb-3"><span className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${kbClass}`} data-kb-status={kb.status}>{kbLabel}</span></p>
                    {kb.message && <p className={`text-sm mb-3 ${kb.status === "error" || kb.status === "unavailable" ? "text-red-700" : "text-slate-600"}`}>{kb.message}</p>}
                    <Row label="Pages read">{kb.pages}</Row>
                    <Row label="Text chunks stored">{kb.chunks}</Row>
                    <Row label="Last refreshed">{formatReceived(kb.indexed_at) || "Never"}</Row>
                    <Row label="Website changes waiting">{kb.pending_changes ? "Yes, refreshing within a minute" : "None"}</Row>
                    <p className="text-xs text-slate-400 mt-3">
                        The assistant reads every public page of {status.crawl_url}. It refreshes by itself about 30 seconds after you change services, blog posts, portfolio, pages, news or site content, and once a day. Only changed pages are re-processed.
                    </p>
                </Card>

                <Card title="Setup" icon={Sparkles}>
                    <Row label="Answer model">{status.chat_model}</Row>
                    <Row label="Routing model">{status.fast_model}</Row>
                    <Row label="Embedding model">{status.embedding_model}</Row>
                    <Row label="Conversations">{status.conversations}</Row>
                    <Row label="Leads captured"><Link href="/dashboard/chat-leads" className="text-[#1D1D7E] underline underline-offset-2">{status.leads}</Link></Row>
                    {status.embedding_problem && <p className="text-sm text-red-700 mt-2">{status.embedding_problem}</p>}
                    <p className="text-xs text-slate-400 mt-3">Models are set on the server (AI_CHAT_MODEL, AI_FAST_MODEL, AI_EMBEDDING_MODEL), so another provider can be used without code changes.</p>
                </Card>
            </div>

            <Card title="Test the knowledge base" icon={Search}>
                <form onSubmit={search} className="flex gap-2">
                    <label htmlFor="kb-search" className="sr-only">Question</label>
                    <input id="kb-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ask what a visitor might ask, e.g. Do you offer remote staff?"
                        className="flex-1 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1D1D7E]/40 text-sm" />
                    <button type="submit" disabled={searching || !query.trim()} className="inline-flex items-center gap-2 bg-[#1D1D7E] text-white px-4 rounded-xl font-semibold text-sm disabled:opacity-50">
                        {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Search
                    </button>
                </form>
                <p className="text-xs text-slate-400 mt-2">Shows the website text the assistant would use to answer. If nothing relevant appears, add that information to the website.</p>
                {results && (
                    <ol className="mt-4 space-y-3" data-kb-results="">
                        {results.length === 0 && <li className="text-sm text-slate-500">Nothing found. Is the knowledge base built?</li>}
                        {results.map((r, i) => (
                            <li key={i} className="border border-slate-100 rounded-xl p-3">
                                <div className="flex items-center justify-between gap-3 mb-1">
                                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-bold text-sm text-[#1D1D7E] underline underline-offset-2">{r.title}</a>
                                    <span className="text-[11px] font-semibold text-slate-400">match {Math.round(r.score * 100)}%</span>
                                </div>
                                <p className="text-xs text-slate-600 whitespace-pre-line line-clamp-4">{r.content}</p>
                            </li>
                        ))}
                    </ol>
                )}
            </Card>

            <Card title="How it works" icon={MessageSquare}>
                <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
                    <li><b>Orchestrator</b> reads each visitor message and hands it to the right agent.</li>
                    <li><b>Chat agent</b> answers questions using only your website content, with links to the pages it used.</li>
                    <li><b>Lead agent</b> greets visitors who haven&apos;t asked anything after the delay in Settings, or who ask for a quote or to be contacted, and collects their name, email or phone, and what they need. Leads appear in <Link href="/dashboard/chat-leads" className="text-[#1D1D7E] underline">Chat Leads</Link> as soon as there is a way to contact them.</li>
                </ul>
            </Card>
        </div>
    );
}
