"use client";

// Alt text is required for every uploaded image: it is what Google indexes and
// what screen-reader users hear instead of the picture.
export const ALT_HELP = "Describe what the image shows, e.g. \"Team reviewing a website design on a laptop\". Used by Google and screen readers.";

export function altError(hasImage, alt) {
    return hasImage && !(alt || "").trim() ? "Please add alt text for the image." : "";
}

export default function ImageAltField({ value, onChange, required = true, label = "Image alt text", id }) {
    const missing = required && !(value || "").trim();
    return (
        <div>
            <label htmlFor={id} className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                id={id}
                type="text"
                value={value || ""}
                maxLength={255}
                onChange={(e) => onChange(e.target.value)}
                placeholder="e.g. Team reviewing a website design on a laptop"
                aria-invalid={missing}
                className={`w-full p-3 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-[#1D1D7E]/40 text-[15px] ${
                    missing ? "border-amber-400" : "border-gray-200"
                }`}
            />
            <p className="mt-1 text-xs text-slate-400">{ALT_HELP}</p>
        </div>
    );
}
