// "Our Hiring Impact" table: one shared list (Site Content → Hiring Impact) shown on the Career
// and About pages. Hidden when there are no categories or the page's switch is off.
const rowsOf = (data) =>
    (Array.isArray(data?.items) ? data.items : [])
        .map((r) => ({ category: (r?.category || "").trim(), total: r?.total === "" || r?.total == null ? NaN : Number(r.total) }))
        .filter((r) => r.category && Number.isFinite(r.total));

const fmt = (n) => n.toLocaleString("en-US");

export default function HiringImpact({ data, page }) {
    const rows = rowsOf(data);
    if (!rows.length || data?.[`show_on_${page}`] === false) return null;
    const total = rows.reduce((sum, r) => sum + r.total, 0);
    const id = `hiring-impact-${page}`;

    return (
        <section className="bg-[#F6F9FC] py-16 md:py-20 px-5 sm:px-8" aria-labelledby={id}>
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8 md:mb-10">
                    <span className="inline-block h-1 w-12 rounded-full bg-[#5DB4D1] mb-4" aria-hidden="true" />
                    <h2 id={id} className="text-[#1D1D7E] text-3xl md:text-4xl font-bold tracking-tight">{data.heading || "Our Hiring Impact"}</h2>
                    {data.text && <p className="mt-3 text-gray-600 text-base md:text-lg leading-relaxed max-w-2xl mx-auto whitespace-pre-line">{data.text}</p>}
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_40px_-15px_rgba(29,29,126,0.25)]">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#1D1D7E] text-white">
                                <th scope="col" className="px-4 sm:px-8 py-4 text-sm sm:text-base font-bold">{data.category_column || "Service Category"}</th>
                                <th scope="col" className="px-4 sm:px-8 py-4 text-sm sm:text-base font-bold text-right whitespace-nowrap">{data.total_column || "Total Hires"}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r, i) => (
                                <tr key={i} className="border-t border-slate-100 odd:bg-white even:bg-slate-50/70 transition-colors hover:bg-[#5DB4D1]/10">
                                    <th scope="row" className="px-4 sm:px-8 py-4 align-middle text-[15px] sm:text-base font-semibold text-slate-800">{r.category}</th>
                                    <td className="px-4 sm:px-8 py-4 align-middle text-right text-lg sm:text-xl font-bold text-[#1D1D7E] tabular-nums">{fmt(r.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                        {data.show_total !== false && rows.length > 1 && (
                            <tfoot>
                                <tr className="border-t-2 border-[#5DB4D1]/50 bg-[#5DB4D1]/10">
                                    <th scope="row" className="px-4 sm:px-8 py-4 text-[15px] sm:text-base font-bold text-[#1D1D7E]">Total</th>
                                    <td className="px-4 sm:px-8 py-4 text-right text-xl sm:text-2xl font-extrabold text-[#1D1D7E] tabular-nums">{fmt(total)}</td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </section>
    );
}
