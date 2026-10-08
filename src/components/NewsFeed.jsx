"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import NewsCard from "@/components/news/NewsCard";
import NewsModal from "@/components/news/NewsModal";

// Published company updates, newest first. Used in the "News & Updates"
// drawer (compact) and on the /news page (grid).
export default function NewsFeed({ layout = "compact", limit, openItemId }) {
    const [news, setNews] = useState([]);
    const [status, setStatus] = useState("loading");
    const [selected, setSelected] = useState(null);
    const [deepLinkClosed, setDeepLinkClosed] = useState(false);

    const fetchNews = async () => {
        const res = await fetch("/api/newsfeed/", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    };

    const apply = (promise) =>
        promise.then(
            (data) => { setNews(data); setStatus("ready"); },
            () => setStatus("error")
        );

    useEffect(() => {
        apply(fetchNews());
    }, []);

    const retry = () => {
        setStatus("loading");
        apply(fetchNews());
    };

    // Deep link: /news?item=12 opens that update until the reader closes it
    const deepLinked = !deepLinkClosed && openItemId ? news.find((n) => String(n.id) === String(openItemId)) : null;
    const current = selected || deepLinked || null;

    const close = useCallback(() => {
        setSelected(null);
        setDeepLinkClosed(true);
    }, []);
    const items = limit ? news.slice(0, limit) : news;
    const compact = layout === "compact";

    return (
        <>
            {status === "loading" && (
                <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-400">
                    <Loader2 size={18} className="animate-spin" /> Loading updates…
                </div>
            )}

            {status === "error" && (
                <div className="py-10 text-center text-sm text-gray-500 space-y-3">
                    <p>Updates could not be loaded right now.</p>
                    <button onClick={retry} className="px-4 py-2 rounded-lg border text-[#1D1D7E] font-semibold hover:bg-gray-50">Try again</button>
                </div>
            )}

            {status === "ready" && items.length === 0 && (
                <p className="py-12 text-center text-sm text-gray-500">No updates yet — check back soon.</p>
            )}

            {status === "ready" && items.length > 0 && (
                <ul className={compact ? "space-y-3" : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"}>
                    {items.map((item) => (
                        <li key={item.id}>
                            <NewsCard item={item} onOpen={setSelected} compact={compact} />
                        </li>
                    ))}
                </ul>
            )}

            <NewsModal item={current} onClose={close} />
        </>
    );
}
