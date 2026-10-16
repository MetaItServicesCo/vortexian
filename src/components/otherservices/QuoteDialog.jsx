"use client";
import { createContext, useContext, useRef, useState } from "react";
import { CheckCircle2, Loader2, X } from "lucide-react";

// Quote form in a dialog for /other-services. Sends the same request as the Contact page form
// (Dashboard → Quote Requests), with the category the visitor picked filled in.
const QuoteContext = createContext(() => {});

const EMPTY = { first_name: "", last_name: "", email: "", phone: "", preferred_contact_method: "Email", service: "", message: "" };
const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] text-slate-800 outline-none transition focus:border-[#5DB4D1] focus:bg-white focus:ring-4 focus:ring-[#5DB4D1]/20";
const labelClass = "mb-1.5 block text-sm font-bold text-slate-700";

export function QuoteProvider({ categories = [], children }) {
    const dialog = useRef(null);
    const opener = useRef(null);
    const [form, setForm] = useState(EMPTY);
    const [status, setStatus] = useState("idle"); // idle | sending | sent
    const [error, setError] = useState("");

    const open = (category = "") => {
        opener.current = document.activeElement;
        setForm((f) => ({ ...f, service: category || f.service || "" }));
        setStatus((s) => (s === "sent" ? "idle" : s));
        setError("");
        dialog.current?.showModal();
    };
    const close = () => dialog.current?.close();
    const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        if (!form.service) return setError("Please choose the service you're interested in.");
        setStatus("sending");
        try {
            const body = new FormData();
            Object.entries(form).forEach(([k, v]) => body.append(k, v.trim()));
            const res = await fetch("/api/contact/", { method: "POST", body });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                const detail = Array.isArray(data.detail) ? "Please check your email address and try again." : data.detail;
                throw new Error(detail || "Your request could not be sent. Please try again.");
            }
            setStatus("sent");
            setForm(EMPTY);
        } catch (err) {
            setStatus("idle");
            setError(err.message === "Failed to fetch" ? "We couldn't reach the server. Please check your connection and try again." : err.message);
        }
    };

    const options = [...new Set([...categories, form.service].filter(Boolean))];

    return (
        <QuoteContext.Provider value={open}>
            {children}
            <dialog
                ref={dialog}
                aria-labelledby="quote-dialog-title"
                onClose={() => opener.current?.focus?.()}
                onClick={(e) => { if (e.target === dialog.current) close(); }}
                className="m-auto w-[calc(100%-2rem)] max-w-xl rounded-3xl p-0 shadow-2xl backdrop:bg-[#0b0b2e]/60 backdrop:backdrop-blur-sm"
            >
                <div className="max-h-[90dvh] overflow-y-auto p-6 sm:p-8">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 id="quote-dialog-title" className="text-2xl font-bold text-[#1D1D7E]">Get a free quote</h2>
                            <p className="mt-1 text-[15px] text-slate-600">Tell us a little about your project. We&apos;ll get back to you with a no-obligation quote.</p>
                        </div>
                        <button type="button" onClick={close} aria-label="Close" className="-mr-2 -mt-1 rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800">
                            <X size={22} />
                        </button>
                    </div>

                    {status === "sent" ? (
                        <div className="py-10 text-center" role="status">
                            <CheckCircle2 size={52} className="mx-auto text-emerald-500" aria-hidden="true" />
                            <p className="mt-4 text-xl font-bold text-[#0b0b2e]">Thank you! Your request has been sent.</p>
                            <p className="mt-2 text-slate-600">Our team will get back to you soon.</p>
                            <button type="button" onClick={close} className="mt-6 rounded-xl bg-[#1D1D7E] px-6 py-3 font-bold text-white hover:bg-[#5DB4D1]">Close</button>
                        </div>
                    ) : (
                        <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2" noValidate={false}>
                            <div className="sm:col-span-2">
                                <label htmlFor="q-service" className={labelClass}>Service <span className="text-red-500">*</span></label>
                                <select id="q-service" required value={form.service} onChange={set("service")} className={inputClass}>
                                    <option value="">Choose a service…</option>
                                    {options.map((o) => <option key={o} value={o}>{o}</option>)}
                                    <option value="Other / not sure">Other / not sure</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="q-first" className={labelClass}>First name <span className="text-red-500">*</span></label>
                                <input id="q-first" required autoComplete="given-name" value={form.first_name} onChange={set("first_name")} className={inputClass} />
                            </div>
                            <div>
                                <label htmlFor="q-last" className={labelClass}>Last name <span className="text-red-500">*</span></label>
                                <input id="q-last" required autoComplete="family-name" value={form.last_name} onChange={set("last_name")} className={inputClass} />
                            </div>
                            <div>
                                <label htmlFor="q-email" className={labelClass}>Email <span className="text-red-500">*</span></label>
                                <input id="q-email" type="email" required autoComplete="email" value={form.email} onChange={set("email")} className={inputClass} />
                            </div>
                            <div>
                                <label htmlFor="q-phone" className={labelClass}>Phone <span className="text-red-500">*</span></label>
                                <input id="q-phone" type="tel" required autoComplete="tel" value={form.phone} onChange={set("phone")} className={inputClass} />
                            </div>
                            <fieldset className="sm:col-span-2">
                                <legend className={labelClass}>Best way to reach you</legend>
                                <div className="flex gap-3">
                                    {["Email", "Phone"].map((m) => (
                                        <label key={m} className={`flex-1 cursor-pointer rounded-xl border px-4 py-2.5 text-center text-sm font-bold transition ${form.preferred_contact_method === m ? "border-[#1D1D7E] bg-[#1D1D7E] text-white" : "border-slate-200 text-slate-600 hover:border-[#5DB4D1]"}`}>
                                            <input type="radio" name="q-method" value={m} checked={form.preferred_contact_method === m} onChange={set("preferred_contact_method")} className="sr-only" />
                                            {m}
                                        </label>
                                    ))}
                                </div>
                            </fieldset>
                            <div className="sm:col-span-2">
                                <label htmlFor="q-message" className={labelClass}>Project details <span className="text-red-500">*</span></label>
                                <textarea id="q-message" required rows={4} value={form.message} onChange={set("message")} placeholder="What do you need, and by when?" className={`${inputClass} resize-y`} />
                            </div>
                            {error && <p role="alert" className="sm:col-span-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
                            <button type="submit" disabled={status === "sending"} className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#1D1D7E] px-6 py-4 text-base font-bold text-white transition hover:bg-[#5DB4D1] disabled:opacity-60">
                                {status === "sending" && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
                                {status === "sending" ? "Sending…" : "Send my request"}
                            </button>
                        </form>
                    )}
                </div>
            </dialog>
        </QuoteContext.Provider>
    );
}

export function QuoteButton({ category = "", className, children }) {
    const open = useContext(QuoteContext);
    return (
        <button type="button" onClick={() => open(category)} className={className} aria-haspopup="dialog">
            {children}
        </button>
    );
}
