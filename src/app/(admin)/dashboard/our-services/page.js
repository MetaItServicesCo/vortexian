"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { ArrowDown, ArrowUp, ChevronDown, ChevronUp, ExternalLink, Eye, EyeOff, Loader2, Pencil, Plus, RotateCcw, Save, Settings2, Trash2 } from "lucide-react";
import { adminFetch } from "@/lib/adminApi";
import { mediaUrl } from "@/lib/api";
import DynamicIcon from "@/components/content/DynamicIcon";
import { FieldList, IconField, findMissingAlt } from "@/components/admin/content/SchemaForm";
import { CARD_COLORS, catalogFromServices, colorFor, newId, safeLink } from "@/lib/catalog";

// Dashboard → Our Services Page: categories and service cards of /our-services
// (saved as the "catalog" site-content section; see src/lib/catalog.js).
const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#5DB4D1]";
const labelClass = "block text-xs font-black uppercase tracking-wider text-slate-500 mb-2";
const IMAGE_FIELD = [{ name: "image", label: "Image (optional — replaces the icon)", type: "image", altKey: "image_alt" }];
const DESC_HINT = 180;

const newService = () => ({ id: newId(), title: "", description: "", icon: "Layers", image: "", image_alt: "", link: "", visible: true });
const newCategory = () => ({ id: newId(), name: "", intro: "", color: "auto", quote_label: "", visible: true, services: [] });
const move = (list, i, d) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return list;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    return next;
};

function IconButton({ label, onClick, disabled, danger, children }) {
    return (
        <button type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled}
            className={`p-2 rounded-lg transition disabled:opacity-30 ${danger ? "text-red-500 hover:bg-red-50" : "text-slate-500 hover:bg-slate-100 hover:text-[#1D1D7E]"}`}>
            {children}
        </button>
    );
}

function LinkPicker({ value, onChange, servicePages }) {
    const known = servicePages.some((p) => p.href === value);
    const [custom, setCustom] = useState(!!value && !known);
    const select = custom ? "__custom" : value || "";
    return (
        <div className="space-y-2">
            <select aria-label="Learn More link" className={inputClass} value={select} onChange={(e) => {
                const v = e.target.value;
                if (v === "__custom") { setCustom(true); onChange(known ? "" : value); } else { setCustom(false); onChange(v); }
            }}>
                <option value="">No link (no Learn More button)</option>
                {servicePages.length > 0 && (
                    <optgroup label="Service pages">
                        {servicePages.map((p) => <option key={p.href} value={p.href}>{p.label}</option>)}
                    </optgroup>
                )}
                <option value="__custom">Another page or web address…</option>
            </select>
            {custom && (
                <input aria-label="Link address" className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} placeholder="/contact or https://…" />
            )}
            {value && !safeLink(value) && <p className="text-xs font-semibold text-red-600">Use a page on this site (starting with /) or a full address starting with https://</p>}
        </div>
    );
}

function ServiceEditor({ service, onChange, servicePages }) {
    const set = (patch) => onChange({ ...service, ...patch });
    const len = (service.description || "").length;
    return (
        <div className="grid gap-5 p-5 bg-white border-t border-slate-100">
            <div>
                <label className={labelClass} htmlFor={`t-${service.id}`}>Service name *</label>
                <input id={`t-${service.id}`} className={inputClass} value={service.title} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. Search Engine Optimisation" />
            </div>
            <div>
                <label className={labelClass} htmlFor={`d-${service.id}`}>Short description</label>
                <textarea id={`d-${service.id}`} rows={2} className={`${inputClass} resize-y`} value={service.description} onChange={(e) => set({ description: e.target.value })} placeholder="One or two lines about what you deliver." />
                <p className={`mt-1 text-xs ${len > DESC_HINT ? "text-amber-600 font-semibold" : "text-slate-400"}`}>{len} characters — keep it to 1–2 lines (about {DESC_HINT}). Longer text is cut to 3 lines on the card.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
                <div>
                    <label className={labelClass}>Icon</label>
                    <IconField value={service.icon} onChange={(icon) => set({ icon })} />
                </div>
                <div>
                    <label className={labelClass}>Learn More link</label>
                    <LinkPicker value={service.link || ""} onChange={(link) => set({ link })} servicePages={servicePages} />
                </div>
            </div>
            <FieldList fields={IMAGE_FIELD} value={service} onChange={(next) => onChange(next)} />
        </div>
    );
}

function CategoryPanel({ category, index, count, color, onChange, onMove, onRemove, servicePages, existing, defaultQuote }) {
    const [open, setOpen] = useState(!category.name);
    const [editing, setEditing] = useState(null);
    const set = (patch) => onChange({ ...category, ...patch });
    const services = category.services || [];
    const setService = (i, s) => set({ services: services.map((x, j) => (j === i ? s : x)) });
    const addService = (s) => { set({ services: [...services, s] }); setEditing(s.id); };
    const hidden = category.visible === false;

    return (
        <section className={`rounded-2xl border bg-white shadow-sm ${hidden ? "border-dashed border-slate-300 opacity-80" : "border-gray-100"}`} data-category={category.name}>
            <div className="flex items-center gap-2 px-4 py-3">
                <span className="w-3 h-10 rounded-full shrink-0" style={{ backgroundColor: color.icon }} aria-hidden="true" />
                <button type="button" onClick={() => setOpen(!open)} className="flex-1 min-w-0 flex items-center gap-3 text-left" aria-expanded={open}>
                    {open ? <ChevronUp size={18} className="text-slate-400 shrink-0" /> : <ChevronDown size={18} className="text-slate-400 shrink-0" />}
                    <span className="min-w-0">
                        <span className="block font-black text-[#1D1D7E] truncate">{category.name || "New category"}</span>
                        <span className="block text-xs text-slate-400">{services.length} service{services.length === 1 ? "" : "s"}{hidden ? " · hidden" : ""}</span>
                    </span>
                </button>
                <IconButton label={hidden ? "Show category" : "Hide category"} onClick={() => set({ visible: hidden })}>{hidden ? <EyeOff size={16} /> : <Eye size={16} />}</IconButton>
                <IconButton label="Move category up" disabled={index === 0} onClick={() => onMove(-1)}><ArrowUp size={16} /></IconButton>
                <IconButton label="Move category down" disabled={index === count - 1} onClick={() => onMove(1)}><ArrowDown size={16} /></IconButton>
                <IconButton label="Delete category" danger onClick={() => { if (confirm(`Delete the category “${category.name || "New category"}” and its ${services.length} service card(s)?`)) onRemove(); }}><Trash2 size={16} /></IconButton>
            </div>

            {open && (
                <div className="border-t border-slate-100 p-5 space-y-6">
                    <div className="grid gap-5 md:grid-cols-2">
                        <div>
                            <label className={labelClass} htmlFor={`cn-${category.id}`}>Category name *</label>
                            <input id={`cn-${category.id}`} className={inputClass} value={category.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Digital Marketing" />
                        </div>
                        <div>
                            <label className={labelClass} htmlFor={`cq-${category.id}`}>Quote button text (optional)</label>
                            <input id={`cq-${category.id}`} className={inputClass} value={category.quote_label || ""} onChange={(e) => set({ quote_label: e.target.value })} placeholder={defaultQuote} />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass} htmlFor={`ci-${category.id}`}>Short introduction</label>
                        <textarea id={`ci-${category.id}`} rows={2} className={`${inputClass} resize-y`} value={category.intro || ""} onChange={(e) => set({ intro: e.target.value })} placeholder="One or two sentences about this group of services." />
                    </div>
                    <div>
                        <span className={labelClass}>Card colour</span>
                        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Card colour">
                            {[["auto", { label: "Automatic", card: "linear-gradient(135deg,#EAF6FB,#EEEEFB,#E7F6F0,#FDF5E3)", border: "#CBD5E1" }], ...Object.entries(CARD_COLORS)].map(([key, c]) => {
                                const active = (category.color || "auto") === key;
                                return (
                                    <button key={key} type="button" role="radio" aria-checked={active} onClick={() => set({ color: key })}
                                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition ${active ? "border-[#1D1D7E] ring-2 ring-[#1D1D7E]/20 text-[#1D1D7E]" : "border-gray-200 text-slate-500 hover:border-slate-300"}`}>
                                        <span className="w-5 h-5 rounded-md border" style={{ background: c.card, borderColor: c.border }} />
                                        {c.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <span className={labelClass}>Service cards</span>
                        <div className="space-y-2">
                            {services.map((s, i) => {
                                const isEditing = editing === s.id;
                                const sHidden = s.visible === false;
                                return (
                                    <div key={s.id} className={`rounded-xl border overflow-hidden ${sHidden ? "border-dashed border-slate-300" : "border-slate-200"}`} data-service={s.title}>
                                        <div className="flex items-center gap-3 px-3 py-2.5" style={{ backgroundColor: sHidden ? "#F8FAFC" : color.card }}>
                                            <span className="w-10 h-10 shrink-0 rounded-lg bg-white flex items-center justify-center overflow-hidden" style={{ color: color.icon }} aria-hidden="true">
                                                {s.image
                                                    // eslint-disable-next-line @next/next/no-img-element -- admin preview
                                                    ? <img src={mediaUrl(s.image)} alt="" className="w-full h-full object-contain" />
                                                    : <DynamicIcon name={s.icon} fallback="Layers" size={20} />}
                                            </span>
                                            <button type="button" onClick={() => setEditing(isEditing ? null : s.id)} className="flex-1 min-w-0 text-left">
                                                <span className={`block text-sm font-bold truncate ${sHidden ? "text-slate-400 line-through" : "text-slate-800"}`}>{s.title || "New service"}</span>
                                                <span className="block text-xs text-slate-500 truncate">{s.description || "No description"}{s.link ? ` · → ${s.link}` : ""}</span>
                                            </button>
                                            <IconButton label={isEditing ? "Close editor" : "Edit service"} onClick={() => setEditing(isEditing ? null : s.id)}>{isEditing ? <ChevronUp size={16} /> : <Pencil size={16} />}</IconButton>
                                            <IconButton label={sHidden ? "Show service" : "Hide service"} onClick={() => setService(i, { ...s, visible: sHidden })}>{sHidden ? <EyeOff size={16} /> : <Eye size={16} />}</IconButton>
                                            <IconButton label="Move service up" disabled={i === 0} onClick={() => set({ services: move(services, i, -1) })}><ArrowUp size={16} /></IconButton>
                                            <IconButton label="Move service down" disabled={i === services.length - 1} onClick={() => set({ services: move(services, i, 1) })}><ArrowDown size={16} /></IconButton>
                                            <IconButton label="Delete service" danger onClick={() => { if (confirm(`Remove “${s.title || "this service"}” from the page?`)) set({ services: services.filter((_, j) => j !== i) }); }}><Trash2 size={16} /></IconButton>
                                        </div>
                                        {isEditing && <ServiceEditor service={s} onChange={(next) => setService(i, next)} servicePages={servicePages} />}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-3 flex flex-col sm:flex-row gap-2">
                            <button type="button" onClick={() => addService(newService())}
                                className="flex-1 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm font-bold text-slate-500 hover:border-[#1D1D7E] hover:text-[#1D1D7E] flex items-center justify-center gap-2">
                                <Plus size={16} /> Add service
                            </button>
                            {existing.length > 0 && (
                                <select aria-label="Add one of your services" value="" className={`${inputClass} sm:max-w-xs`} onChange={(e) => {
                                    const s = existing.find((x) => x.link === e.target.value);
                                    if (s) addService({ ...s, id: newId() });
                                }}>
                                    <option value="">+ Add one of your services…</option>
                                    {existing.map((s) => <option key={s.link} value={s.link}>{s.title}</option>)}
                                </select>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default function OurServicesAdmin() {
    const [categories, setCategories] = useState(null);
    const [autoPreview, setAutoPreview] = useState([]);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [defaultQuote, setDefaultQuote] = useState("Get a Free Quote");

    useEffect(() => {
        let cancelled = false;
        const get = (url, fallback) => fetch(url).then((r) => (r.ok ? r.json() : fallback)).catch(() => fallback);
        Promise.all([get("/api/content/catalog", {}), get("/api/services/menu-tree", []), get("/api/services/", []), get("/api/content/page.our_services", {})]).then(([saved, menu, services, page]) => {
            if (cancelled) return;
            setAutoPreview(catalogFromServices(menu, services).categories);
            setCategories(Array.isArray(saved?.categories) ? saved.categories : []);
            if (page?.quote_label) setDefaultQuote(page.quote_label);
        });
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        if (!dirty) return;
        const handler = (e) => { e.preventDefault(); e.returnValue = ""; };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [dirty]);

    const existing = useMemo(() => autoPreview.flatMap((c) => c.services), [autoPreview]);
    const servicePages = useMemo(() => existing.map((s) => ({ href: s.link, label: s.title })), [existing]);

    const update = (next) => { setCategories(next); setDirty(true); };

    const problems = () => {
        const out = [];
        categories.forEach((c, i) => {
            const name = c.name?.trim() || `Category ${i + 1}`;
            if (!c.name?.trim()) out.push(`Category ${i + 1} needs a name`);
            (c.services || []).forEach((s, j) => {
                const label = `${name} › ${s.title?.trim() || `service ${j + 1}`}`;
                if (!s.title?.trim()) out.push(`${label}: needs a name`);
                if (s.link && !safeLink(s.link)) out.push(`${label}: link must start with / or https://`);
                if (findMissingAlt(IMAGE_FIELD, s).length) out.push(`${label}: image needs alt text`);
            });
        });
        return out;
    };

    const save = async () => {
        const issues = problems();
        if (issues.length) return toast.error(`Please fix before saving: ${issues.join("; ")}`, { duration: 8000 });
        setSaving(true);
        try {
            const clean = categories.map((c) => ({ ...c, name: c.name.trim(), services: (c.services || []).map((s) => ({ ...s, title: s.title.trim(), link: safeLink(s.link) })) }));
            const saved = await adminFetch("/api/content/catalog", { method: "PUT", body: { categories: clean } });
            setCategories(saved.categories || []);
            setDirty(false);
            toast.success("Saved — the page is updated");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const backToAutomatic = async () => {
        if (!confirm("Remove your categories and cards and list your services automatically again?")) return;
        try {
            await adminFetch("/api/content/catalog", { method: "DELETE" });
            setCategories([]);
            setDirty(false);
            toast.success("The page lists your services automatically again");
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className="max-w-5xl pb-28">
            <Toaster position="top-center" />
            <div className="flex flex-col md:flex-row md:items-start gap-4 mb-8">
                <div className="flex-1">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Website</p>
                    <h1 className="text-2xl font-black text-[#1D1D7E] uppercase tracking-tight">Our Services Page</h1>
                    <p className="text-sm text-slate-500 mt-1">Categories and service cards on <span className="font-semibold">/our-services</span>. Changes go live when you save.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link href="/dashboard/content/page.our_services" className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-[#1D1D7E]">
                        <Settings2 size={14} /> Page text, FAQ &amp; SEO
                    </Link>
                    <a href="/our-services" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-[#1D1D7E]">
                        View page <ExternalLink size={14} />
                    </a>
                </div>
            </div>

            {categories === null ? (
                <div className="py-24 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#1D1D7E]" /></div>
            ) : (
                <>
                    {categories.length === 0 && (
                        <div className="mb-6 rounded-2xl border border-[#5DB4D1]/40 bg-[#F3F9FC] p-6">
                            <p className="font-black text-[#1D1D7E]">The page currently lists your services automatically</p>
                            <p className="mt-1 text-sm text-slate-600">
                                Right now it shows {existing.length} service{existing.length === 1 ? "" : "s"} from Manage Services, grouped by category ({autoPreview.map((c) => c.name).join(", ") || "none yet"}).
                                To choose exactly what&apos;s shown — names, descriptions, icons, images, links and order — start from those services or from scratch.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <button type="button" disabled={!autoPreview.length} onClick={() => update(autoPreview.map((c) => ({ ...c, id: newId(), services: c.services.map((s) => ({ ...s, id: newId() })) })))}
                                    className="px-5 py-3 rounded-xl bg-[#1D1D7E] text-white text-sm font-bold hover:bg-[#5DB4D1] disabled:opacity-40">
                                    Start from my current services
                                </button>
                                <button type="button" onClick={() => update([newCategory()])} className="px-5 py-3 rounded-xl border border-gray-200 bg-white text-sm font-bold text-slate-600 hover:text-[#1D1D7E]">
                                    Start from scratch
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {categories.map((c, i) => (
                            <CategoryPanel
                                key={c.id || i}
                                category={c}
                                index={i}
                                count={categories.length}
                                color={colorFor(c, i)}
                                servicePages={servicePages}
                                existing={existing}
                                defaultQuote={defaultQuote}
                                onChange={(next) => update(categories.map((x, j) => (j === i ? next : x)))}
                                onMove={(d) => update(move(categories, i, d))}
                                onRemove={() => update(categories.filter((_, j) => j !== i))}
                            />
                        ))}
                    </div>

                    {categories.length > 0 && (
                        <button type="button" onClick={() => update([...categories, newCategory()])}
                            className="mt-4 w-full py-3.5 border-2 border-dashed border-gray-200 rounded-2xl text-sm font-bold text-slate-500 hover:border-[#1D1D7E] hover:text-[#1D1D7E] flex items-center justify-center gap-2">
                            <Plus size={16} /> Add category
                        </button>
                    )}

                    <div className="sticky bottom-4 mt-8 flex items-center gap-3 bg-white/90 backdrop-blur p-3 rounded-2xl border border-gray-100 shadow-lg">
                        <button type="button" onClick={save} disabled={saving || !dirty}
                            className="flex-1 bg-[#1D1D7E] text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#5DB4D1] transition flex items-center justify-center gap-2 disabled:opacity-50">
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
                        </button>
                        <button type="button" onClick={backToAutomatic}
                            className="px-5 py-3.5 rounded-xl border border-gray-200 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-red-600 hover:border-red-200 flex items-center gap-2">
                            <RotateCcw size={14} /> <span className="hidden sm:inline">List services automatically</span><span className="sm:hidden">Automatic</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
