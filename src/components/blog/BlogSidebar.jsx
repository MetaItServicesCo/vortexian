import Link from "next/link";

export default function BlogSidebar({ popularPosts, categories }) {
  return (
    <aside className="space-y-8 sticky top-24">
      {/* ── SEARCH ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-[#1a1a2e] mb-3 uppercase tracking-wide">
          Search
        </h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Search articles..."
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B21D4]/30 focus:border-[#6B21D4] transition-all"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" strokeWidth="2" />
            <path strokeLinecap="round" strokeWidth="2" d="m21 21-4.35-4.35" />
          </svg>
        </div>
      </div>

      {/* ── CATEGORIES ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-[#1a1a2e] mb-4 uppercase tracking-wide">
          Categories
        </h3>
        <ul className="space-y-2">
          {categories
            .filter((c) => c !== "All")
            .map((cat) => (
              <li key={cat}>
                <button className="w-full flex items-center justify-between text-sm text-gray-600 hover:text-[#6B21D4] font-medium py-2 px-3 rounded-lg hover:bg-[#6B21D4]/5 transition-all duration-200 group">
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6B21D4] opacity-50 group-hover:opacity-100 transition-opacity" />
                    {cat}
                  </span>
                  <svg
                    className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-0 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </li>
            ))}
        </ul>
      </div>

      {/* ── POPULAR POSTS ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-[#1a1a2e] mb-4 uppercase tracking-wide">
          Popular Posts
        </h3>
        <div className="space-y-4">
          {popularPosts.map((post, i) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="flex gap-3 group"
            >
              <span className="text-2xl font-extrabold text-gray-100 group-hover:text-[#6B21D4]/20 transition-colors w-8 flex-shrink-0 leading-none mt-1">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-800 leading-snug group-hover:text-[#6B21D4] transition-colors line-clamp-2">
                  {post.title}
                </p>
                <p className="text-[11px] text-gray-400 mt-1">{post.date}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── CTA CARD ──────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#6B21D4] to-[#4c0fa3] rounded-2xl p-6 text-white">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h4 className="font-bold text-base mb-2">Looking to Hire?</h4>
        <p className="text-white/70 text-sm leading-relaxed mb-4">
          Connect with top talent through TIGI HR's expert recruitment network.
        </p>
        <Link
          href="/hire-talent"
          className="inline-flex items-center gap-2 bg-[#22c55e] text-white text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-[#16a34a] transition-colors w-full justify-center"
        >
          Hire Talent Now
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </Link>
      </div>
    </aside>
  );
}
