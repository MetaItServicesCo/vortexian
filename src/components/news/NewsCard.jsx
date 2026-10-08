"use client";

import { Megaphone, Newspaper, CalendarDays, Trophy, UserPlus, PartyPopper, Bell, PlayCircle, ChevronRight } from "lucide-react";
import { mediaUrl } from "@/lib/api";
import { formatNewsDate, isVideo, newsExcerpt, newsType } from "@/lib/news";

const ICONS = { Megaphone, Newspaper, CalendarDays, Trophy, UserPlus, PartyPopper, Bell };

export function TypeBadge({ value }) {
    const type = newsType(value);
    const Icon = ICONS[type.icon] || Bell;
    return (
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${type.badge}`}>
            <Icon size={12} aria-hidden="true" /> {type.label}
        </span>
    );
}

// One update in the list; opens the full update in a popup
export default function NewsCard({ item, onOpen, compact = false }) {
    const hasMedia = Boolean(item.media_url);
    const date = formatNewsDate(item.event_date) || formatNewsDate(item.created_at);

    return (
        <button
            type="button"
            onClick={() => onOpen(item)}
            className={`group w-full text-left bg-white rounded-xl border border-gray-100 hover:border-[#5DB4D1]/60 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D1D7E] transition flex ${compact ? "gap-3 p-3" : "flex-col overflow-hidden"}`}
            aria-label={`Read: ${item.title}`}
        >
            {hasMedia && (
                <div className={`relative shrink-0 bg-slate-100 overflow-hidden ${compact ? "w-20 h-20 rounded-lg" : "w-full aspect-[16/9]"}`}>
                    {isVideo(item.media_url) ? (
                        <div className="absolute inset-0 flex items-center justify-center text-[#1D1D7E]">
                            <PlayCircle size={compact ? 28 : 44} aria-hidden="true" />
                            <span className="sr-only">Video</span>
                        </div>
                    ) : (
                        // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded image
                        <img src={mediaUrl(item.media_url)} alt={item.media_alt || item.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" loading="lazy" />
                    )}
                </div>
            )}

            <div className={`flex-1 min-w-0 ${compact ? "" : "p-5"}`}>
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <TypeBadge value={item.feed_type} />
                    {date && <span className="text-[11px] text-gray-400">{date}</span>}
                </div>
                <h3 className={`font-bold text-[#111] leading-snug group-hover:text-[#1D1D7E] ${compact ? "text-sm line-clamp-2" : "text-lg line-clamp-2"}`}>
                    {item.title}
                </h3>
                <p className={`text-gray-500 mt-1 ${compact ? "text-xs line-clamp-2" : "text-sm line-clamp-3"}`}>
                    {newsExcerpt(item.description, compact ? 110 : 180)}
                </p>
                {!compact && (
                    <span className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-[#1D1D7E]">
                        Read update <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    </span>
                )}
            </div>
        </button>
    );
}
