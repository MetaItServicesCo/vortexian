"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bot, Loader2, MessageCircle, Send, X } from "lucide-react";

// The AI assistant (backend/app/routes/ai.py). The conversation id lives in
// localStorage so it follows the visitor across pages; the "visit" token (when
// they arrived, signed by the server) lives in sessionStorage so the lead
// capture timer counts from the start of the visit, not from each page.
const SESSION_KEY = "vt-ai-session";
const VISIT_KEY = "vt-ai-visit";
const SEEN_KEY = "vt-ai-nudged";
const MAX_CHARS = 1000;

const store = {
    get(area, key) {
        try { return window[area].getItem(key); } catch { return null; }
    },
    set(area, key, value) {
        try { value == null ? window[area].removeItem(key) : window[area].setItem(key, value); } catch { /* private mode */ }
    },
};

async function api(path, options = {}) {
    const res = await fetch(`/api/ai${path}`, {
        ...options,
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const detail = typeof data.detail === "string" ? data.detail : data.detail?.message;
        const err = new Error(detail || "Something went wrong. Please try again.");
        err.status = res.status;
        err.data = data.detail;
        throw err;
    }
    return data;
}

// Markdown-lite for assistant replies: [links](/path), **bold**, "- " bullets.
// Built as React elements (never innerHTML), and only http(s) or site-relative links.
function Inline({ text }) {
    const parts = [];
    const pattern = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;
    let last = 0;
    let match;
    while ((match = pattern.exec(text))) {
        if (match.index > last) parts.push(text.slice(last, match.index));
        if (match[1]) {
            const href = match[2];
            if (href.startsWith("/") && !href.startsWith("//")) {
                parts.push(<Link key={match.index} href={href} className="underline underline-offset-2 font-semibold text-[#1D1D7E] hover:text-[#2b7fa0]">{match[1]}</Link>);
            } else if (/^https?:\/\//i.test(href)) {
                parts.push(<a key={match.index} href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 font-semibold text-[#1D1D7E]">{match[1]}</a>);
            } else {
                parts.push(match[1]);
            }
        } else {
            parts.push(<strong key={match.index}>{match[3]}</strong>);
        }
        last = pattern.lastIndex;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts.map((p, i) => <Fragment key={i}>{p}</Fragment>);
}

function RichReply({ text }) {
    const blocks = [];
    let list = null;
    text.split("\n").forEach((line, i) => {
        const bullet = line.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)/);
        if (bullet) {
            list = list || [];
            list.push(<li key={i}><Inline text={bullet[1]} /></li>);
            return;
        }
        if (list) { blocks.push(<ul key={`l${i}`} className="list-disc pl-5 space-y-0.5">{list}</ul>); list = null; }
        if (line.trim()) blocks.push(<p key={i}><Inline text={line} /></p>);
    });
    if (list) blocks.push(<ul key="l-end" className="list-disc pl-5 space-y-0.5">{list}</ul>);
    return <div className="space-y-2">{blocks}</div>;
}

function Bubble({ msg }) {
    const mine = msg.role === "user";
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex ${mine ? "justify-end" : "justify-start"}`}
            data-chat-message={msg.role}
        >
            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed ${mine
                ? "bg-[#1D1D7E] text-white rounded-br-md whitespace-pre-wrap"
                : msg.error ? "bg-red-50 text-red-700 border border-red-100 rounded-bl-md" : "bg-white text-slate-700 border border-slate-100 shadow-sm rounded-bl-md"}`}>
                {mine ? msg.content : <RichReply text={msg.content} />}
                {!mine && msg.sources?.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                        {msg.sources.map((s) => (
                            <Link key={s.url} href={s.url} className="text-[11px] font-semibold text-[#2b7fa0] bg-[#5DB4D1]/10 rounded-full px-2 py-0.5 hover:bg-[#5DB4D1]/20">
                                {s.title}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export default function ChatWidget() {
    const pathname = usePathname();
    const reduceMotion = useReducedMotion();
    const [config, setConfig] = useState(null);
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [teaser, setTeaser] = useState(null);
    const [hovering, setHovering] = useState(false);
    const sessionId = useRef(null);
    const visit = useRef(null);
    const idleTimer = useRef(null);
    const listRef = useRef(null);
    const inputRef = useRef(null);
    const pathRef = useRef(pathname);

    useEffect(() => { pathRef.current = pathname; }, [pathname]);

    const cancelIdle = useCallback(() => {
        clearTimeout(idleTimer.current);
        idleTimer.current = null;
    }, []);

    const remember = useCallback((id) => {
        sessionId.current = id;
        store.set("localStorage", SESSION_KEY, id ? JSON.stringify({ id, t: Date.now() }) : null);
    }, []);

    // Lead capture: ask the server for the idle message once the delay has passed
    const scheduleIdle = useCallback((seconds) => {
        cancelIdle();
        if (seconds == null || store.get("sessionStorage", SEEN_KEY)) return;
        idleTimer.current = setTimeout(async () => {
            try {
                const data = await api("/chat", {
                    method: "POST",
                    body: JSON.stringify({ event: "idle", session_id: sessionId.current, visit: visit.current, page: pathRef.current }),
                });
                if (data.session_id) remember(data.session_id);
                if (!data.reply) return;
                store.set("sessionStorage", SEEN_KEY, "1");
                setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
                setTeaser(data.reply);
            } catch (err) {
                if (err.status === 409 && err.data?.idle_in != null) scheduleIdle(err.data.idle_in);
            }
        }, Math.max(0, seconds) * 1000 + 500);
    }, [cancelIdle, remember]);

    // Load settings, the visit token and any earlier conversation
    useEffect(() => {
        let cancelled = false;
        (async () => {
            let conf;
            try {
                conf = await api("/config", { cache: "no-store" });
            } catch {
                return;
            }
            if (cancelled || !conf.enabled) return;
            visit.current = store.get("sessionStorage", VISIT_KEY) || conf.visit;
            store.set("sessionStorage", VISIT_KEY, visit.current);
            setConfig(conf);

            let saved = null;
            try { saved = JSON.parse(store.get("localStorage", SESSION_KEY) || "null"); } catch { /* ignore */ }
            if (saved?.id && Date.now() - saved.t < 24 * 3600 * 1000) {
                try {
                    const data = await api(`/session/${encodeURIComponent(saved.id)}?visit=${encodeURIComponent(visit.current)}`);
                    if (cancelled) return;
                    sessionId.current = data.session_id;
                    setMessages(data.messages || []);
                    scheduleIdle(data.idle_in);
                    return;
                } catch {
                    remember(null);
                }
            }
            if (conf.idle_seconds != null) {
                const arrived = Number(String(visit.current).split(".")[0]) * 1000;
                scheduleIdle(Math.max(0, conf.idle_seconds - (Date.now() - arrived) / 1000));
            }
        })();
        return () => { cancelled = true; cancelIdle(); };
    }, [scheduleIdle, cancelIdle, remember]);

    // Keep the newest message in view
    useEffect(() => {
        if (open && listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [messages, open, sending]);

    useEffect(() => {
        if (!open) return;
        setTeaser(null);
        const t = setTimeout(() => inputRef.current?.focus(), 150);
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        document.addEventListener("keydown", onKey);
        return () => { clearTimeout(t); document.removeEventListener("keydown", onKey); };
    }, [open]);

    const send = async (e) => {
        e?.preventDefault();
        const text = input.trim();
        if (!text || sending) return;
        cancelIdle();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: text }]);
        setSending(true);
        try {
            const data = await api("/chat", {
                method: "POST",
                body: JSON.stringify({ message: text, session_id: sessionId.current, visit: visit.current, page: pathRef.current }),
            });
            remember(data.session_id);
            setMessages((prev) => [...prev, { role: "assistant", content: data.reply, sources: data.sources }]);
        } catch (err) {
            if (err.status === 404) remember(null); // conversation expired: the next message starts a new one
            setMessages((prev) => [...prev, { role: "assistant", content: err.message, error: true }]);
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    };

    if (!config) return null;

    const float = reduceMotion ? {} : { y: [0, -9, 0, -4, 0], rotate: [0, -6, 6, -3, 0] };

    return (
        <div className="fixed z-[70] right-4 sm:right-6 bottom-24 flex flex-col items-end gap-3 pointer-events-none" data-chat-widget="">
            <AnimatePresence>
                {open && (
                    <motion.section
                        key="panel"
                        role="dialog"
                        aria-label={`Chat with ${config.assistant_name}`}
                        initial={{ opacity: 0, y: 24, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.96 }}
                        transition={{ type: "spring", stiffness: 320, damping: 28 }}
                        className="pointer-events-auto w-[calc(100vw-2rem)] sm:w-[380px] h-[min(560px,calc(100dvh-12.5rem))] flex flex-col rounded-3xl overflow-hidden bg-slate-50 shadow-[0_25px_60px_-15px_rgba(29,29,126,0.45)] border border-white/60 origin-bottom-right"
                    >
                        <header className="flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-[#1D1D7E] to-[#2b7fa0] text-white">
                            <span className="relative w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center">
                                <Bot size={22} aria-hidden="true" />
                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#1D1D7E]" aria-hidden="true" />
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold leading-tight truncate">{config.assistant_name}</p>
                                <p className="text-[11px] text-white/75">AI assistant · usually replies instantly</p>
                            </div>
                            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="w-9 h-9 rounded-full hover:bg-white/15 flex items-center justify-center">
                                <X size={18} />
                            </button>
                        </header>

                        <div ref={listRef} className="flex-1 overflow-y-auto px-3.5 py-4 space-y-3" aria-live="polite">
                            <Bubble msg={{ role: "assistant", content: config.welcome_message }} />
                            {messages.map((m, i) => <Bubble key={i} msg={m} />)}
                            {sending && (
                                <div className="flex justify-start" aria-label="Assistant is typing">
                                    <div className="bg-white border border-slate-100 shadow-sm rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
                                        {[0, 1, 2].map((d) => (
                                            <motion.span key={d} className="w-2 h-2 rounded-full bg-slate-400"
                                                animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: d * 0.15 }} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <form onSubmit={send} className="p-3 bg-white border-t border-slate-100">
                            <div className="flex items-end gap-2">
                                <label htmlFor="ai-chat-input" className="sr-only">Your message</label>
                                <textarea
                                    id="ai-chat-input"
                                    ref={inputRef}
                                    rows={1}
                                    value={input}
                                    maxLength={MAX_CHARS}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) send(e); }}
                                    placeholder="Ask a question…"
                                    className="flex-1 resize-none max-h-28 rounded-2xl bg-slate-100 px-4 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-[#5DB4D1]"
                                />
                                <button type="submit" disabled={!input.trim() || sending} aria-label="Send message"
                                    className="w-10 h-10 shrink-0 rounded-full bg-[#1D1D7E] text-white flex items-center justify-center disabled:opacity-40 hover:bg-[#2b2b9e] transition">
                                    {sending ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
                                </button>
                            </div>
                            <p className="mt-1.5 text-[10px] text-slate-400 text-center">AI answers may be imperfect. For anything important, <Link href="/contact" className="underline">contact our team</Link>.</p>
                        </form>
                    </motion.section>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {teaser && !open && (
                    <motion.div
                        key="teaser"
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="pointer-events-auto relative max-w-[260px] bg-white rounded-2xl rounded-br-md shadow-xl border border-slate-100"
                        data-chat-teaser=""
                    >
                        <button type="button" onClick={() => setOpen(true)} className="block text-left text-slate-700 text-[13px] leading-snug px-4 py-3 pr-8">
                            <span className="line-clamp-3">{teaser.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*/g, "")}</span>
                        </button>
                        <button type="button" aria-label="Dismiss message" onClick={() => setTeaser(null)}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100">
                            <X size={13} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label={open ? "Close chat" : `Chat with ${config.assistant_name}`}
                aria-expanded={open}
                data-chat-launcher=""
                onHoverStart={() => setHovering(true)}
                onHoverEnd={() => setHovering(false)}
                animate={open || hovering ? { y: 0, rotate: 0 } : float}
                transition={open || hovering ? { duration: 0.2 } : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className="pointer-events-auto relative w-16 h-16 rounded-full text-white shadow-[0_12px_30px_-6px_rgba(29,29,126,0.6)] bg-gradient-to-br from-[#1D1D7E] via-[#3a3ab8] to-[#5DB4D1] flex items-center justify-center focus-visible:outline focus-visible:outline-4 focus-visible:outline-[#5DB4D1]/50"
            >
                {!open && !reduceMotion && (
                    <>
                        <motion.span aria-hidden="true" className="absolute inset-0 rounded-full bg-[#5DB4D1]"
                            animate={{ scale: [1, 1.55], opacity: [0.45, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }} />
                        <motion.span aria-hidden="true" className="absolute inset-0 rounded-full bg-[#1D1D7E]"
                            animate={{ scale: [1, 1.35], opacity: [0.35, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: 0.9 }} />
                    </>
                )}
                <AnimatePresence mode="wait" initial={false}>
                    <motion.span key={open ? "x" : "chat"} className="relative" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                        {open ? <X size={26} /> : <MessageCircle size={28} />}
                    </motion.span>
                </AnimatePresence>
                {teaser && !open && <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white" aria-label="New message" />}
            </motion.button>
        </div>
    );
}
