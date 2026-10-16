import { ArrowUpRight } from "lucide-react";

// "Apply on Indeed / LinkedIn / …" buttons under the Career intro (Site Content → Career Page →
// Apply on other platforms). Hidden when no button has both a text and a full web address.
const isWebUrl = (url) => /^https?:\/\/\S+$/i.test((url || "").trim());

export default function ApplyButtons({ data }) {
    const buttons = (Array.isArray(data?.buttons) ? data.buttons : []).filter((b) => (b?.label || "").trim() && isWebUrl(b.url));
    if (!buttons.length) return null;

    return (
        <div className="mb-14 rounded-2xl border border-[#5DB4D1]/30 bg-gradient-to-br from-[#F3F9FC] to-white p-6 md:p-8" aria-labelledby={data.heading ? "apply-elsewhere-heading" : undefined}>
            {data.heading && <h3 id="apply-elsewhere-heading" className="text-[#1D1D7E] text-xl md:text-2xl font-bold">{data.heading}</h3>}
            {data.text && <p className="mt-2 text-gray-700 text-[15px] leading-relaxed whitespace-pre-line">{data.text}</p>}
            <ul className={`flex flex-col sm:flex-row sm:flex-wrap gap-3 ${data.heading || data.text ? "mt-5" : ""}`}>
                {buttons.map((b, i) => (
                    <li key={i}>
                        <a
                            href={b.url.trim()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#1D1D7E] px-6 py-3 text-[15px] font-bold text-white shadow-sm transition-all duration-300 hover:bg-[#5DB4D1] hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#5DB4D1]/40"
                        >
                            {b.label.trim()}
                            <ArrowUpRight size={18} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            <span className="sr-only">(opens in a new tab)</span>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
