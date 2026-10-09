"use client";

import { use, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Copy, Eye, Loader2, Monitor, Save, Send, Smartphone, X, FlaskConical, ImagePlus, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { adminFetch, errorMessage, getToken, uploadMedia } from "@/lib/adminApi";
import { mediaUrl } from "@/lib/api";
import ImageAltField from "@/components/admin/ImageAltField";
import NewsletterHeader, { useNewsletterStatus } from "@/components/admin/newsletter/NewsletterHeader";
import { CampaignStatus, formatWhen } from "@/components/admin/newsletter/CampaignStatus";

const RichTextEditor = dynamic(() => import("@/components/editor/RichTextEditor"), { ssr: false });

const EDITABLE = ["draft", "failed"];
const hasText = (html) => (html || "").replace(/<(?!img)[^>]*>|&nbsp;|\s/g, "").length > 0;

async function renderPreview(fields) {
    const res = await fetch("/api/newsletter/campaigns/preview", {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
        body: JSON.stringify(fields),
    });
    if (!res.ok) throw new Error(errorMessage(await res.json().catch(() => ({})), `Preview failed (${res.status})`));
    return res.text();
}

// How the newsletter appears in an inbox list, then the email itself
function InboxRow({ sender, subject, preheader }) {
    const name = (sender || "Vortexian Tech").replace(/\s*<.*>$/, "");
    return (
        <div className="mx-auto mb-4 max-w-[720px] rounded-lg bg-white shadow px-4 py-3 text-sm" data-testid="inbox-row">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">In the inbox</p>
            <div className="flex gap-3 min-w-0">
                <span className="font-bold text-slate-900 shrink-0">{name}</span>
                <span className="truncate text-slate-700">
                    <span className="font-semibold text-slate-900">{subject || "(no subject)"}</span>
                    {preheader ? <span className="text-slate-500"> – {preheader}</span> : null}
                </span>
            </div>
        </div>
    );
}

function PreviewModal({ html, onClose, inbox }) {
    const [width, setWidth] = useState("desktop");
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);
    return (
        <div className="fixed inset-0 z-[70] bg-slate-900/60 flex flex-col p-3 sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div role="dialog" aria-modal="true" aria-label="Email preview" className="mx-auto w-full max-w-4xl flex-1 min-h-0 flex flex-col bg-white rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b">
                    <span className="font-semibold text-slate-800 mr-auto">Preview: what subscribers will see</span>
                    <button type="button" onClick={() => setWidth("desktop")} aria-pressed={width === "desktop"} className={`p-2 rounded-lg ${width === "desktop" ? "bg-[#EEF0FF] text-[#1D1D7E]" : "text-slate-500"}`} aria-label="Desktop width"><Monitor size={16} /></button>
                    <button type="button" onClick={() => setWidth("mobile")} aria-pressed={width === "mobile"} className={`p-2 rounded-lg ${width === "mobile" ? "bg-[#EEF0FF] text-[#1D1D7E]" : "text-slate-500"}`} aria-label="Phone width"><Smartphone size={16} /></button>
                    <button type="button" onClick={onClose} aria-label="Close preview" className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"><X size={18} /></button>
                </div>
                <div className="flex-1 min-h-0 overflow-auto bg-slate-100 p-4">
                    {inbox && <InboxRow {...inbox} />}
                    <iframe title="Email preview" srcDoc={html} sandbox="" className="mx-auto block bg-white h-full min-h-[600px] rounded-lg shadow" style={{ width: width === "mobile" ? 375 : "100%", maxWidth: 720 }} />
                </div>
            </div>
        </div>
    );
}

export default function NewsletterComposer({ params }) {
    const { id: routeId } = use(params);
    const router = useRouter();
    const status = useNewsletterStatus();
    const [campaign, setCampaign] = useState(null);
    const [form, setForm] = useState({ subject: "", preheader: "", body_html: "", cover_image: "", cover_image_alt: "", show_headline: true });
    const [uploadingCover, setUploadingCover] = useState(false);
    const [loaded, setLoaded] = useState(routeId === "new");
    const [dirty, setDirty] = useState(false);
    const [busy, setBusy] = useState(null);
    const [preview, setPreview] = useState(null);
    const [testTo, setTestTo] = useState("");
    const campaignId = campaign?.id ?? null;
    const load = (cid) => adminFetch(`/api/newsletter/campaigns/${cid}`);

    useEffect(() => {
        if (routeId === "new") return;
        load(routeId).then(
            (c) => {
                setCampaign(c);
                setForm({ subject: c.subject, preheader: c.preheader || "", body_html: c.body_html, cover_image: c.cover_image || "", cover_image_alt: c.cover_image_alt || "", show_headline: c.show_headline !== false });
                setLoaded(true);
            },
            (err) => { toast.error(err.message); setLoaded(true); }
        );
    }, [routeId]);

    // Live progress while sending
    useEffect(() => {
        if (campaign?.status !== "sending") return;
        const t = setInterval(() => load(campaign.id).then(setCampaign, () => {}), 2000);
        return () => clearInterval(t);
    }, [campaign?.status, campaign?.id]);

    useEffect(() => {
        if (!dirty) return;
        const handler = (e) => { e.preventDefault(); e.returnValue = ""; };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [dirty]);

    const editable = !campaign || EDITABLE.includes(campaign.status);
    const set = (key) => (value) => { setForm((f) => ({ ...f, [key]: value })); setDirty(true); };

    const save = async ({ quiet = false } = {}) => {
        if (!form.subject.trim()) throw new Error("Add a subject first.");
        if (form.cover_image && !form.cover_image_alt.trim()) throw new Error("Add alt text for the cover image (describe what it shows).");
        const body = { ...form, cover_image: form.cover_image || null, cover_image_alt: form.cover_image_alt || null };
        const saved = campaignId
            ? await adminFetch(`/api/newsletter/campaigns/${campaignId}`, { method: "PUT", body })
            : await adminFetch("/api/newsletter/campaigns", { method: "POST", body });
        const isNew = !campaignId;
        setCampaign(saved);
        setDirty(false);
        if (isNew) router.replace(`/dashboard/newsletter/campaigns/${saved.id}`);
        if (!quiet) toast.success("Draft saved");
        return saved;
    };

    const run = (name, fn) => async () => {
        setBusy(name);
        try {
            await fn();
        } catch (err) {
            toast.error(err.message, { duration: 8000 });
        } finally {
            setBusy(null);
        }
    };

    const doPreview = run("preview", async () => {
        if (form.cover_image && !form.cover_image_alt.trim()) throw new Error("Add alt text for the cover image first.");
        setPreview(await renderPreview({ ...form, cover_image: form.cover_image || null, cover_image_alt: form.cover_image_alt || null }));
    });

    const pickCover = async (file) => {
        if (!file) return;
        if (!/\.(png|jpe?g|gif)$/i.test(file.name)) {
            toast.error("Use a PNG, JPG or GIF image: WebP and AVIF don't show in Outlook and some Gmail apps.", { duration: 7000 });
            return;
        }
        setUploadingCover(true);
        try {
            const url = await uploadMedia(file);
            setForm((f) => ({ ...f, cover_image: url }));
            setDirty(true);
        } catch (err) {
            toast.error(`Upload failed: ${err.message}`);
        } finally {
            setUploadingCover(false);
        }
    };

    const doTest = run("test", async () => {
        if (!hasText(form.body_html)) throw new Error("Write some content first.");
        const saved = await save({ quiet: true });
        const res = await adminFetch(`/api/newsletter/campaigns/${saved.id}/test`, { method: "POST", body: { email: testTo.trim() || null } });
        toast.success(res.message);
    });

    const doSend = run("send", async () => {
        if (!hasText(form.body_html)) throw new Error("Write some content first.");
        const saved = await save({ quiet: true });
        const n = status?.subscribers ?? 0;
        if (!confirm(`Send “${form.subject}” to ${n} subscriber${n === 1 ? "" : "s"} now?\n\nEmails can't be recalled once sent.`)) return;
        const started = await adminFetch(`/api/newsletter/campaigns/${saved.id}/send`, { method: "POST" });
        setCampaign(started);
        toast.success("Sending started");
    });

    const doDuplicate = run("duplicate", async () => {
        const copy = await adminFetch(`/api/newsletter/campaigns/${campaignId}/duplicate`, { method: "POST" });
        router.push(`/dashboard/newsletter/campaigns/${copy.id}`);
    });

    const sendBlocked = !status ? "Loading…" : !status.configured ? "Email sending isn't set up yet" : status.subscribers === 0 ? "No subscribers yet" : null;
    const btn = "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50";

    return (
        <div className="p-6 md:p-10 min-h-screen bg-gray-50 text-slate-800">
            <Toaster position="top-center" />
            <NewsletterHeader status={status} />

            <Link href="/dashboard/newsletter/campaigns" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#1D1D7E] mb-4">
                <ArrowLeft size={15} /> All newsletters
            </Link>

            {!loaded ? (
                <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-[#1D1D7E]" /></div>
            ) : !editable ? (
                // ---------------- sent / sending: read-only
                <div className="max-w-3xl space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-xl font-bold mr-auto">{campaign.subject}</h2>
                            <CampaignStatus campaign={campaign} />
                        </div>
                        {campaign.preheader && <p className="text-sm text-slate-500">{campaign.preheader}</p>}
                        <div data-testid="campaign-progress">
                            <div className="flex justify-between text-sm text-slate-600 mb-1">
                                <span>{campaign.sent_count} of {campaign.recipients_count || "…"} delivered{campaign.failed_count ? ` · ${campaign.failed_count} failed` : ""}</span>
                                <span>{campaign.sent_at ? `Sent ${formatWhen(campaign.sent_at)}` : "In progress"}</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                <div className="h-full bg-[#1D1D7E] transition-all" style={{ width: `${campaign.recipients_count ? Math.round((100 * campaign.sent_count) / campaign.recipients_count) : 0}%` }} />
                            </div>
                        </div>
                        {campaign.last_error && <p className="text-sm text-red-700 bg-red-50 rounded-lg p-3">Problem reported by the email service: {campaign.last_error}</p>}
                        <div className="flex flex-wrap gap-2 pt-2">
                            <button type="button" onClick={doPreview} disabled={!!busy} className={`${btn} border border-gray-200 bg-white hover:bg-slate-50`}><Eye size={16} /> View email</button>
                            <button type="button" onClick={doDuplicate} disabled={!!busy} className={`${btn} bg-[#1D1D7E] text-white hover:bg-[#16166a]`}><Copy size={16} /> Duplicate as new draft</button>
                        </div>
                    </div>
                </div>
            ) : (
                // ---------------- draft: compose
                <div className="max-w-3xl space-y-5">
                    {campaign?.status === "failed" && (
                        <p className="text-sm text-red-700 bg-red-50 rounded-xl p-4">The last send failed{campaign.last_error ? `: ${campaign.last_error}` : ""}. Fix the problem and send again; nobody received it.</p>
                    )}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                        <div>
                            <label htmlFor="nl-subject" className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">Subject *</label>
                            <input id="nl-subject" value={form.subject} maxLength={200} onChange={(e) => set("subject")(e.target.value)} placeholder="e.g. October update: new services and hiring tips" className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1D1D7E]/40" />
                            <p className="mt-1 text-xs text-slate-400">{form.subject.length}/200 · Keep it under ~60 characters so it isn&apos;t cut off in inboxes.</p>
                        </div>
                        <div>
                            <label htmlFor="nl-preheader" className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">Preview text (optional)</label>
                            <input id="nl-preheader" value={form.preheader} maxLength={200} onChange={(e) => set("preheader")(e.target.value)} placeholder="Shown after the subject in most inboxes" className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1D1D7E]/40" />
                        </div>
                        <div>
                            <span className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">Cover image (optional)</span>
                            {form.cover_image ? (
                                <div className="space-y-3">
                                    {/* eslint-disable-next-line @next/next/no-img-element -- uploaded preview */}
                                    <img src={mediaUrl(form.cover_image)} alt={form.cover_image_alt || "Cover image preview"} className="w-full max-w-xl rounded-xl border border-gray-100" data-testid="cover-preview" />
                                    <ImageAltField id="nl-cover-alt" label="Cover image alt text" value={form.cover_image_alt} onChange={set("cover_image_alt")} />
                                    <button type="button" onClick={() => { setForm((f) => ({ ...f, cover_image: "", cover_image_alt: "" })); setDirty(true); }} className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:underline">
                                        <Trash2 size={14} /> Remove cover image
                                    </button>
                                </div>
                            ) : (
                                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-6 text-sm font-semibold text-slate-500 hover:border-[#1D1D7E] hover:text-[#1D1D7E]">
                                    {uploadingCover ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                                    {uploadingCover ? "Uploading…" : "Upload a cover image (PNG, JPG or GIF, about 1200px wide)"}
                                    <input id="nl-cover" type="file" accept="image/png,image/jpeg,image/gif" className="sr-only" onChange={(e) => { pickCover(e.target.files?.[0]); e.target.value = ""; }} />
                                </label>
                            )}
                            <p className="mt-1.5 text-xs text-slate-400">Shown full-width under your logo, above the headline.</p>
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <input id="nl-headline" type="checkbox" checked={form.show_headline} onChange={(e) => set("show_headline")(e.target.checked)} className="h-4 w-4 accent-[#1D1D7E]" />
                            <span className="text-sm font-semibold text-slate-700">Show the subject as the headline at the top of the email</span>
                        </label>
                        <div>
                            <span className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">Content *</span>
                            <RichTextEditor value={form.body_html} onChange={set("body_html")} placeholder="Write your newsletter…" minHeight={320} />
                            <p className="mt-1.5 text-xs text-slate-400">To add images inside the text, use the image button in the toolbar (PNG, JPG or GIF work in every inbox). Your logo, the footer and an Unsubscribe link are added automatically, and links to pages on this site work in the email.</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                        <label htmlFor="nl-test" className="block text-xs font-black uppercase tracking-wider text-slate-500">Send a test first</label>
                        <div className="flex flex-wrap gap-2">
                            <input id="nl-test" type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder={status?.admin_email || "your@email.com"} className="flex-1 min-w-[220px] p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1D1D7E]/40" />
                            <button type="button" onClick={doTest} disabled={!!busy || !status?.configured} className={`${btn} border border-gray-200 bg-white hover:bg-slate-50`}>
                                {busy === "test" ? <Loader2 size={16} className="animate-spin" /> : <FlaskConical size={16} />} Send test
                            </button>
                        </div>
                        <p className="text-xs text-slate-400">Leave empty to send it to {status?.admin_email || "your login email"}. The subject starts with [Test].</p>
                    </div>

                    <div className="sticky bottom-4 flex flex-wrap items-center gap-2 bg-white/90 backdrop-blur p-3 rounded-2xl border border-gray-100 shadow-lg">
                        <button type="button" onClick={run("save", () => save())} disabled={!!busy} className={`${btn} border border-gray-200 bg-white hover:bg-slate-50`}>
                            {busy === "save" ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {dirty || !campaignId ? "Save draft" : "Saved"}
                        </button>
                        <button type="button" onClick={doPreview} disabled={!!busy} className={`${btn} border border-gray-200 bg-white hover:bg-slate-50`}>
                            {busy === "preview" ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />} Preview
                        </button>
                        <button type="button" onClick={doSend} disabled={!!busy || !!sendBlocked} title={sendBlocked || undefined} className={`${btn} ml-auto bg-[#1D1D7E] text-white hover:bg-[#16166a]`}>
                            {busy === "send" ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            {sendBlocked || `Send to ${status.subscribers} subscriber${status.subscribers === 1 ? "" : "s"}`}
                        </button>
                    </div>
                </div>
            )}

            {preview && <PreviewModal html={preview} onClose={() => setPreview(null)} inbox={{ sender: status?.sender, subject: form.subject, preheader: form.preheader }} />}
        </div>
    );
}
