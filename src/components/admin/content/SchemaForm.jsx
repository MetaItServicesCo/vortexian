"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ChevronDown, ChevronUp, Plus, Trash2, Upload, Loader2, X, ArrowUp, ArrowDown, CheckCircle2, AlertCircle, Wand2 } from "lucide-react";
import toast from "react-hot-toast";
import { uploadMedia } from "@/lib/adminApi";
import { mediaUrl } from "@/lib/api";
import DynamicIcon, { ICON_NAMES } from "@/components/content/DynamicIcon";
import ImageAltField from "@/components/admin/ImageAltField";
import { countImagesMissingAlt } from "@/lib/richText";

export const altKeyFor = (field) => field.altKey || `${field.name}_alt`;
const needsAlt = (field) => field.type === "image" && !field.decorative;

// Labels of every image without alt text (and rich text with alt-less images),
// including inside lists, so the editor can block saving with a clear message.
export function findMissingAlt(fields, value, prefix = "") {
    const problems = [];
    for (const field of fields) {
        const v = value?.[field.name];
        const label = prefix + field.label;
        if (needsAlt(field) && v && !(value?.[altKeyFor(field)] || "").trim()) problems.push(`${label} (alt text)`);
        if (field.type === "richtext" && countImagesMissingAlt(v || "")) problems.push(`${label} (image in text)`);
        if (field.type === "list" && Array.isArray(v)) {
            v.forEach((item, i) => problems.push(...findMissingAlt(field.fields, item, `${label} #${i + 1} › `)));
        }
    }
    return problems;
}

// Fields with `showIf: { field, equals }` only appear (and are only checked)
// when a sibling field has that value, e.g. the GA ID only when GA is on.
export const isShown = (field, value) => !field.showIf || Boolean(value?.[field.showIf.field]) === field.showIf.equals;

export function jsonProblem(text) {
    if (!(text || "").trim()) return null;
    try {
        const parsed = JSON.parse(text);
        return parsed && typeof parsed === "object" ? null : "must be a JSON object or array";
    } catch (err) {
        return err.message;
    }
}

// Format/required problems (pattern, requiredIf, JSON), including inside lists
export function findInvalid(fields, value, prefix = "") {
    const problems = [];
    for (const field of fields) {
        if (!isShown(field, value)) continue;
        const v = value?.[field.name];
        const label = prefix + field.label;
        const text = typeof v === "string" ? v.trim() : v;
        if (field.requiredIf && value?.[field.requiredIf] && !text) problems.push(`${label} is required`);
        if (field.pattern && text && !new RegExp(field.pattern).test(text)) problems.push(`${label}: ${field.patternMessage || "invalid format"}`);
        if (field.format === "json") {
            const problem = jsonProblem(v);
            if (problem) problems.push(`${label}: not valid JSON (${problem})`);
        }
        if (field.type === "list" && Array.isArray(v)) {
            v.forEach((item, i) => problems.push(...findInvalid(field.fields, item, `${label} “${item?.[field.itemLabel] || `#${i + 1}`}” › `)));
        }
    }
    return problems;
}

// Monospace editor for robots.txt, llms.txt, JSON-LD and URL lists
function CodeField({ field, value, onChange }) {
    const [loading, setLoading] = useState(false);
    const problem = field.format === "json" ? jsonProblem(value) : null;

    const startFrom = async () => {
        setLoading(true);
        try {
            const res = await fetch(field.startFrom, { cache: "no-store" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            onChange(await res.text());
        } catch (err) {
            toast.error(`Could not load the recommended version: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-2">
            {field.template && !(value || "").trim() && (
                <button
                    type="button"
                    onClick={() => onChange(field.template)}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#1D1D7E]/20 bg-[#EEF0FF] px-3 py-1.5 text-xs font-bold text-[#1D1D7E] hover:bg-[#e2e5ff]"
                >
                    <Wand2 size={14} /> Insert recommended template
                </button>
            )}
            {field.startFrom && !(value || "").trim() && (
                <button
                    type="button"
                    onClick={startFrom}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#1D1D7E]/20 bg-[#EEF0FF] px-3 py-1.5 text-xs font-bold text-[#1D1D7E] hover:bg-[#e2e5ff] disabled:opacity-50"
                >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />} Start from the recommended version
                </button>
            )}
            <textarea
                rows={field.rows || 8}
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={field.placeholder}
                spellCheck={false}
                aria-invalid={problem ? "true" : undefined}
                className={`${inputClass} font-mono text-[13px] leading-relaxed resize-y ${problem ? "border-red-300 focus:ring-red-300" : ""}`}
            />
            {field.format === "json" && (value || "").trim() && (
                <p className={`flex items-center gap-1.5 text-xs font-semibold ${problem ? "text-red-600" : "text-emerald-700"}`} role="status">
                    {problem ? <AlertCircle size={13} /> : <CheckCircle2 size={13} />}
                    {problem ? `Not valid JSON: ${problem}` : "Valid JSON"}
                </p>
            )}
        </div>
    );
}

const RichTextEditor = dynamic(() => import("@/components/editor/RichTextEditor"), { ssr: false });

const inputClass =
    "w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1D1D7E]/40 text-[15px] text-slate-800";
const labelClass = "block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5";

function emptyValue(field) {
    switch (field.type) {
        case "list": return [];
        case "boolean": return false;
        case "number": return 0;
        default: return "";
    }
}

function emptyItem(fields) {
    return Object.fromEntries(fields.map((f) => [f.name, emptyValue(f)]));
}

// ------------------------------------------------------------------ media
function MediaField({ value, onChange, type }) {
    const [uploading, setUploading] = useState(false);
    const input = useRef(null);
    const isVideo = type === "video";

    const handleFile = async (file) => {
        if (!file) return;
        setUploading(true);
        try {
            onChange(await uploadMedia(file));
            toast.success("Uploaded");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-2">
            {value && (
                <div className="relative inline-block rounded-xl overflow-hidden border border-gray-200 bg-slate-100">
                    {isVideo ? (
                        <video src={mediaUrl(value)} className="max-h-40" controls muted />
                    ) : (
                        // eslint-disable-next-line @next/next/no-img-element -- preview of arbitrary URL
                        <img src={mediaUrl(value)} alt="" className="max-h-40 object-contain" />
                    )}
                    <button
                        type="button"
                        onClick={() => onChange("")}
                        aria-label="Remove"
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center text-red-500 hover:bg-white"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={isVideo ? "Upload a video or paste a URL" : "Upload an image or paste a URL"}
                    className={inputClass}
                />
                <button
                    type="button"
                    onClick={() => input.current?.click()}
                    disabled={uploading}
                    className="shrink-0 px-4 rounded-xl bg-[#1D1D7E] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-[#5DB4D1] disabled:opacity-50"
                >
                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    Upload
                </button>
                <input
                    ref={input}
                    type="file"
                    className="hidden"
                    accept={isVideo ? "video/mp4,video/webm,video/quicktime" : "image/png,image/jpeg,image/gif,image/webp,image/avif"}
                    onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }}
                />
            </div>
        </div>
    );
}

// ------------------------------------------------------------------ icon
function IconField({ value, onChange }) {
    const [open, setOpen] = useState(false);
    return (
        <div>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`${inputClass} flex items-center gap-3 text-left`}
            >
                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[#1D1D7E]">
                    <DynamicIcon name={value} size={18} />
                </span>
                <span className="flex-1">{value || "Choose icon"}</span>
                <ChevronDown size={16} className="text-slate-400" />
            </button>
            {open && (
                <div className="mt-2 grid grid-cols-6 sm:grid-cols-10 gap-1.5 p-3 border border-gray-200 rounded-xl bg-white">
                    {ICON_NAMES.map((name) => (
                        <button
                            key={name}
                            type="button"
                            title={name}
                            aria-label={name}
                            onClick={() => { onChange(name); setOpen(false); }}
                            className={`h-10 rounded-lg flex items-center justify-center transition ${
                                value === name ? "bg-[#1D1D7E] text-white" : "text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                            <DynamicIcon name={name} size={18} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ------------------------------------------------------------------ list
function ListField({ field, value = [], onChange }) {
    const [openIndex, setOpenIndex] = useState(null);
    const items = Array.isArray(value) ? value : [];

    const update = (index, item) => onChange(items.map((it, i) => (i === index ? item : it)));
    const remove = (index) => {
        if (!confirm("Remove this item?")) return;
        onChange(items.filter((_, i) => i !== index));
        setOpenIndex(null);
    };
    const move = (index, delta) => {
        const target = index + delta;
        if (target < 0 || target >= items.length) return;
        const next = [...items];
        [next[index], next[target]] = [next[target], next[index]];
        onChange(next);
        setOpenIndex(openIndex === index ? target : openIndex);
    };
    const add = () => {
        onChange([...items, emptyItem(field.fields)]);
        setOpenIndex(items.length);
    };

    return (
        <div className="space-y-2">
            {items.map((item, index) => {
                const title = (field.itemLabel && item[field.itemLabel]) || `Item ${index + 1}`;
                const isOpen = openIndex === index;
                return (
                    <div key={index} className="border border-gray-200 rounded-xl bg-slate-50/60">
                        <div className="flex items-center gap-1 px-3 py-2">
                            <button
                                type="button"
                                onClick={() => setOpenIndex(isOpen ? null : index)}
                                className="flex-1 flex items-center gap-2 text-left text-sm font-bold text-slate-700 min-w-0"
                            >
                                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                <span className="truncate">{title}</span>
                            </button>
                            <button type="button" aria-label="Move up" disabled={index === 0} onClick={() => move(index, -1)} className="p-1.5 rounded-md text-slate-500 hover:bg-white disabled:opacity-30"><ArrowUp size={14} /></button>
                            <button type="button" aria-label="Move down" disabled={index === items.length - 1} onClick={() => move(index, 1)} className="p-1.5 rounded-md text-slate-500 hover:bg-white disabled:opacity-30"><ArrowDown size={14} /></button>
                            <button type="button" aria-label="Remove" onClick={() => remove(index)} className="p-1.5 rounded-md text-red-500 hover:bg-white"><Trash2 size={14} /></button>
                        </div>
                        {isOpen && (
                            <div className="px-4 pb-4 pt-1 border-t border-gray-200 bg-white rounded-b-xl">
                                <FieldList fields={field.fields} value={item} onChange={(next) => update(index, next)} />
                            </div>
                        )}
                    </div>
                );
            })}
            <button
                type="button"
                onClick={add}
                className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm font-bold text-slate-500 hover:border-[#1D1D7E] hover:text-[#1D1D7E] flex items-center justify-center gap-2"
            >
                <Plus size={16} /> Add {field.label.toLowerCase().replace(/s$/, "")}
            </button>
        </div>
    );
}

// ------------------------------------------------------------------ field
function Field({ field, value, onChange }) {
    let control;
    switch (field.type) {
        case "textarea":
            control = <textarea rows={4} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} className={`${inputClass} resize-y`} />;
            break;
        case "code":
            control = <CodeField field={field} value={value} onChange={onChange} />;
            break;
        case "richtext":
            control = <RichTextEditor value={value || ""} onChange={onChange} minHeight={180} />;
            break;
        case "image":
        case "video":
            control = <MediaField value={value} onChange={onChange} type={field.type} />;
            break;
        case "icon":
            control = <IconField value={value} onChange={onChange} />;
            break;
        case "number":
            control = <input type="number" value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} className={inputClass} />;
            break;
        case "boolean":
            return (
                <label className="flex items-center gap-3 cursor-pointer select-none py-1">
                    <span className={`relative w-11 h-6 rounded-full transition ${value ? "bg-[#1D1D7E]" : "bg-slate-300"}`}>
                        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${value ? "left-[22px]" : "left-0.5"}`} />
                    </span>
                    <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
                    <span className="text-sm font-bold text-slate-700">{field.label}</span>
                </label>
            );
        case "list":
            control = <ListField field={field} value={value} onChange={onChange} />;
            break;
        default: {
            const bad = field.pattern && (value || "").trim() && !new RegExp(field.pattern).test(value.trim());
            control = (
                <>
                    <input type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} aria-invalid={bad ? "true" : undefined} className={`${inputClass} ${bad ? "border-red-300" : ""}`} />
                    {bad && <p className="mt-1.5 text-xs font-semibold text-red-600">{field.patternMessage}</p>}
                </>
            );
        }
    }

    return (
        <div>
            <label className={labelClass}>{field.label}</label>
            {control}
            {field.help && <p className="mt-1.5 text-xs text-slate-400">{field.help}</p>}
        </div>
    );
}

export function FieldList({ fields, value, onChange }) {
    return (
        <div className="space-y-5 pt-3">
            {fields.filter((field) => isShown(field, value)).map((field) => (
                <div key={field.name} className="space-y-3">
                    <Field
                        field={field}
                        value={value?.[field.name]}
                        onChange={(next) => onChange({ ...value, [field.name]: next })}
                    />
                    {needsAlt(field) && value?.[field.name] && (
                        <div className="pl-4 border-l-2 border-slate-100">
                            <ImageAltField
                                label={`${field.label} — alt text`}
                                value={value?.[altKeyFor(field)]}
                                onChange={(alt) => onChange({ ...value, [altKeyFor(field)]: alt })}
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default FieldList;
