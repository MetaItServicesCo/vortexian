"use client";

// "Show in Services menu" switch, shared by the create and edit service forms
export default function MenuToggle({ checked, onChange }) {
    return (
        <label htmlFor="service-show-in-menu" className="flex items-start gap-3 cursor-pointer select-none rounded-xl border border-gray-100 bg-slate-50/60 p-4">
            <span className={`relative mt-0.5 w-11 h-6 shrink-0 rounded-full transition ${checked ? "bg-[#1D1D7E]" : "bg-slate-300"}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
            </span>
            <input
                id="service-show-in-menu"
                type="checkbox"
                role="switch"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="sr-only"
            />
            <span>
                <span className="block text-sm font-bold text-slate-800">Show in Services menu</span>
                <span className="block text-xs text-slate-500 mt-0.5">
                    {checked
                        ? "Listed in the Services dropdown in the website header."
                        : "Hidden from the Services dropdown. The service page and the Services page still show it."}
                </span>
            </span>
        </label>
    );
}
