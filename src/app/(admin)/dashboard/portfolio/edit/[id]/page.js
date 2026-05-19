"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2, Save, FileImage } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

export default function EditPortfolioAssetForm() {
    const router = useRouter();
    const { id } = useParams();
    const [fetching, setFetching] = useState(true);
    const [loading, setLoading] = useState(false);
    const [fileObj, setFileObj] = useState(null);
    const [preview, setPreview] = useState("");

    const [form, setForm] = useState({
        title: "", category: "Web Development", year: "", challenge: "", solution: "", seoTitle: "", seoDescription: "", seoKeywords: ""
    });

    useEffect(() => {
        const fetchTargetData = async () => {
            try {
                const res = await fetch("/api/portfolio");
                const data = await res.json();
                const targetedNode = data.find(item => item._id === id);
                if (targetedNode) {
                    setForm({
                        title: targetedNode.title, category: targetedNode.category, year: targetedNode.year,
                        challenge: targetedNode.challenge, solution: targetedNode.solution,
                        seoTitle: targetedNode.seoTitle || "", seoDescription: targetedNode.seoDescription || "", seoKeywords: targetedNode.seoKeywords || ""
                    });
                    setPreview(targetedNode.mainImage);
                }
            } catch {
                toast.error("Failure tracking baseline node data references.");
            } finally {
                setFetching(false);
            }
        };
        fetchTargetData();
    }, [id]);

    const dispatchUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        const bundle = new FormData();
        Object.keys(form).forEach(key => bundle.append(key, form[key]));
        if (fileObj) bundle.append("mainImage", fileObj);

        try {
            const res = await fetch(`/api/portfolio/${id}`, { method: "PUT", body: bundle });
            if (res.ok) {
                toast.success("Identity profile updated gracefully inside system nodes!");
                setTimeout(() => router.push("/dashboard/portfolio"), 1200);
            }
        } catch {
            toast.error("Execution pipeline failed mapping data entries.");
        } finally {
            setLoading(false);
        }
    };

    const inputStyles = "w-full p-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1D1D7E] text-sm font-semibold text-slate-800 transition-all";
    const labelStyles = "text-[10px] font-black uppercase text-slate-400 block mb-1.5 tracking-wider";

    if (fetching) return <div className="flex justify-center py-40"><Loader2 className="animate-spin text-[#1D1D7E]" size={36} /></div>;

    return (
        <div className="p-6 md:p-10 min-h-screen bg-slate-50/40 text-slate-800 max-w-3xl mx-auto">
            <Toaster />
            <div className="flex items-center gap-4 mb-10">
                <Link href="/dashboard/portfolio" className="w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black transition-all shadow-sm">
                    <ArrowLeft size={18} />
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-[#1D1D7E] uppercase tracking-tight">Modify Project Matrix</h1>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-0.5">Re-compile active case studies</p>
                </div>
            </div>

            <form onSubmit={dispatchUpdate} className="bg-white p-6 md:p-10 rounded-[2rem] border border-gray-100 shadow-xl shadow-slate-100 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <label className={labelStyles}>Project Title *</label>
                        <input type="text" value={form.title} className={inputStyles} required onChange={e => setForm({ ...form, title: e.target.value })} />
                    </div>
                    <div>
                        <label className={labelStyles}>Category Node *</label>
                        <select value={form.category} className={inputStyles} onChange={e => setForm({ ...form, category: e.target.value })}>
                            <option value="Web Development">Web Development</option>
                            <option value="Graphic Design">Graphic Design</option>
                            <option value="UI/UX Design">UI/UX Design</option>
                            <option value="App Development">App Development</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className={labelStyles}>Deployment Year *</label>
                        <input type="number" value={form.year} className={inputStyles} required onChange={e => setForm({ ...form, year: e.target.value })} />
                    </div>
                    <div className="md:col-span-2">
                        <label className={labelStyles}>Asset Re-Allocation Framework</label>
                        <div className="border-2 border-dashed border-gray-200 hover:border-[#1D1D7E] rounded-xl p-3.5 transition-all bg-slate-50/50 flex items-center gap-4 relative">
                            <FileImage className="text-gray-400" size={24} />
                            <span className="text-xs font-bold uppercase text-gray-400 truncate">{fileObj ? fileObj.name : "Select to rewrite graphic data source"}</span>
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setFileObj(e.target.files[0])} />
                        </div>
                    </div>
                </div>

                <div>
                    <label className={labelStyles}>The Business Challenge Statement *</label>
                    <textarea rows="4" value={form.challenge} className={`${inputStyles} resize-none`} required onChange={e => setForm({ ...form, challenge: e.target.value })}></textarea>
                </div>

                <div>
                    <label className={labelStyles}>Vortexian Strategic Solution Node *</label>
                    <textarea rows="4" value={form.solution} className={`${inputStyles} resize-none`} required onChange={e => setForm({ ...form, solution: e.target.value })}></textarea>
                </div>

                <div className="border-t border-gray-100 pt-6 space-y-6">
                    <div className="text-[#1D1D7E] font-black text-xs uppercase tracking-widest">Active Search Indexes Setup</div>
                    <div>
                        <label className={labelStyles}>Meta Target Title Mapping</label>
                        <input type="text" value={form.seoTitle} className={inputStyles} onChange={e => setForm({ ...form, seoTitle: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelStyles}>Meta Index Description String</label>
                            <textarea rows="3" value={form.seoDescription} className={`${inputStyles} resize-none`} onChange={e => setForm({ ...form, seoDescription: e.target.value })}></textarea>
                        </div>
                        <div>
                            <label className={labelStyles}>Meta Priority Context Keywords</label>
                            <textarea rows="3" value={form.seoKeywords} className={`${inputStyles} resize-none`} onChange={e => setForm({ ...form, seoKeywords: e.target.value })}></textarea>
                        </div>
                    </div>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-[#1D1D7E] text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-neutral-900 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer shadow-md">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Committing Changes...</> : <><Save size={16} /> Re-Deploy Frame Node</>}
                </button>
            </form>
        </div>
    );
}