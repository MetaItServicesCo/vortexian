"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, FileImage, Globe } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import ImageAltField, { altError } from "@/components/admin/ImageAltField";
import { adminFetch } from "@/lib/adminApi";

const MAX_IMAGE_MB = 10;

export default function CreatePortfolioAssetForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fileObj, setFileObj] = useState(null);
    const [imageAlt, setImageAlt] = useState("");

    // ✅ CHANGED: field names API ke mutabiq
    const [form, setForm] = useState({
        project_title: "",
        category_node: "Web Development",
        deployment_year: new Date().getFullYear().toString(),
        business_challenge: "",
        solution_node: "",
        meta_title: "",
        meta_description: "",
        meta_keywords: ""
    });

    const dispatchSubmission = async (e) => {
        e.preventDefault();
        if (!form.project_title || !form.business_challenge || !form.solution_node || !fileObj) {
            toast.error("Please fill in the title, challenge, solution and choose an image.");
            return;
        }
        if (fileObj.size > MAX_IMAGE_MB * 1024 * 1024) {
            toast.error(`The image is too large (max ${MAX_IMAGE_MB} MB). Please use a smaller or compressed image.`);
            return;
        }
        const missingAlt = altError(true, imageAlt);
        if (missingAlt) {
            toast.error(missingAlt);
            return;
        }

        setLoading(true);
        const bundle = new FormData();
        Object.keys(form).forEach(key => bundle.append(key, form[key]));
        bundle.append("image_file", fileObj);
        bundle.append("primary_image_alt", imageAlt.trim());

        try {
            await adminFetch("/api/portfolio/create", { method: "POST", body: bundle });
            toast.success("Portfolio item published.");
            setTimeout(() => router.push("/dashboard/portfolio"), 1200);
        } catch (err) {
            toast.error(
                err.message === "Failed to fetch"
                    ? "Could not reach the server. Check your internet connection and try again."
                    : `Could not save the portfolio item: ${err.message}`
            );
        } finally {
            setLoading(false);
        }
    };

    const inputStyles = "w-full p-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1D1D7E] text-sm font-semibold text-slate-800 transition-all shadow-sm";
    const labelStyles = "text-[10px] font-black uppercase text-slate-400 block mb-1.5 tracking-wider";

    return (
        <div className="p-6 md:p-10 min-h-screen bg-slate-50/40 text-slate-800 max-w-3xl mx-auto">
            <Toaster />
            <div className="flex items-center gap-4 mb-10">
                <Link href="/dashboard/portfolio" className="w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black transition-all shadow-sm">
                    <ArrowLeft size={18} />
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-[#1D1D7E] uppercase tracking-tight">Instantiate Project Node</h1>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-0.5">Deploy advanced dynamic case studies</p>
                </div>
            </div>

            <form onSubmit={dispatchSubmission} className="bg-white p-6 md:p-10 rounded-[2rem] border border-gray-100 shadow-xl shadow-slate-100 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <label className={labelStyles}>Project Title *</label>
                        {/* ✅ CHANGED */}
                        <input type="text" className={inputStyles} placeholder="e.g. Quantum Analytics Suite" required onChange={e => setForm({ ...form, project_title: e.target.value })} />
                    </div>
                    <div>
                        <label className={labelStyles}>Category Node *</label>
                        {/* ✅ CHANGED */}
                        <select className={inputStyles} onChange={e => setForm({ ...form, category_node: e.target.value })}>
                            <option value="Web Development">Web Development</option>
                            <option value="Graphic Design">Graphic Design</option>
                            <option value="UI/UX Design">UI/UX Design</option>
                            <option value="App Development">App Development</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <label className={labelStyles}>Deployment Year *</label>
                        {/* ✅ CHANGED */}
                        <input type="number" value={form.deployment_year} className={inputStyles} required onChange={e => setForm({ ...form, deployment_year: e.target.value })} />
                    </div>
                    <div className="md:col-span-2">
                        <label className={labelStyles}>Primary Representation Graphic *</label>
                        <div className="border-2 border-dashed border-gray-200 hover:border-[#1D1D7E] rounded-xl p-3.5 transition-all bg-slate-50/50 flex items-center gap-4 relative">
                            <FileImage className="text-gray-400 shrink-0" size={24} />
                            <span className="text-xs font-bold uppercase text-gray-400 truncate">{fileObj ? fileObj.name : "Upload binary canvas file"}</span>
                            <input type="file" required accept="image/png,image/jpeg,image/webp,image/gif,image/avif" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => { setFileObj(e.target.files[0] || null); setImageAlt(""); }} />
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1">JPG, PNG, WEBP, GIF or AVIF, up to {MAX_IMAGE_MB} MB.</p>
                    </div>
                    {fileObj && (
                        <div className="md:col-span-2">
                            <ImageAltField id="portfolio-image-alt" value={imageAlt} onChange={setImageAlt} />
                        </div>
                    )}
                </div>

                <div>
                    <label className={labelStyles}>The Business Challenge Statement *</label>
                    {/* ✅ CHANGED */}
                    <textarea rows="4" className={`${inputStyles} resize-none`} placeholder="What structural anomalies did the client face?" required onChange={e => setForm({ ...form, business_challenge: e.target.value })}></textarea>
                </div>

                <div>
                    <label className={labelStyles}>Vortexian Strategic Solution Node *</label>
                    {/* ✅ CHANGED */}
                    <textarea rows="4" className={`${inputStyles} resize-none`} placeholder="Describe our technical architectural resolution approach..." required onChange={e => setForm({ ...form, solution_node: e.target.value })}></textarea>
                </div>

                <div className="border-t border-gray-100 pt-6 space-y-6">
                    <div className="flex items-center gap-2 text-[#1D1D7E] font-black text-xs uppercase tracking-widest">
                        <Globe size={16} /> Google Crawler Automation SEO Fields
                    </div>

                    <div>
                        <label className={labelStyles}>Meta Target Title Mapping</label>
                        {/* ✅ CHANGED */}
                        <input type="text" className={inputStyles} placeholder="Optimized Search Layout Title Tag (Leave empty for default)" onChange={e => setForm({ ...form, meta_title: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelStyles}>Meta Index Description String</label>
                            {/* ✅ CHANGED */}
                            <textarea rows="3" className={`${inputStyles} resize-none`} placeholder="High CTR snippet description for search logs..." onChange={e => setForm({ ...form, meta_description: e.target.value })}></textarea>
                        </div>
                        <div>
                            <label className={labelStyles}>Meta Priority Context Keywords</label>
                            {/* ✅ CHANGED */}
                            <textarea rows="3" className={`${inputStyles} resize-none`} placeholder="e.g. nextjs app, enterprise logistics database, fintech api" onChange={e => setForm({ ...form, meta_keywords: e.target.value })}></textarea>
                        </div>
                    </div>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-[#1D1D7E] text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-neutral-900 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs cursor-pointer shadow-md">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Provisioning Cluster...</> : <><Save size={16} /> Deploy Portfolio Unit</>}
                </button>
            </form>
        </div>
    );
}