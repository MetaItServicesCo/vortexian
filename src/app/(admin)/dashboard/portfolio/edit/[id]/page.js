"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2, Save, FileImage, Globe } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import dynamic from "next/dynamic";

import "react-quill-new/dist/quill.snow.css";
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function EditPortfolioAssetForm() {
    const router = useRouter();
    const { id } = useParams();
    const quillRefChallenge = useRef(null);
    const quillRefSolution = useRef(null);

    const [fetching, setFetching] = useState(true);
    const [loading, setLoading] = useState(false);
    const [fileObj, setFileObj] = useState(null);
    const [preview, setPreview] = useState("");

    const [form, setForm] = useState({
        project_title: "",
        slug: "",
        category_node: "Web Development",
        deployment_year: "",
        business_challenge: "",
        solution_node: "",
        meta_title: "",
        meta_description: "",
        meta_keywords: ""
    });

    const imageHandler = useCallback((ref) => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.click();
        input.onchange = () => {
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                const altText = prompt("Enter Alt Text for this image:");
                const quill = ref.current.getEditor();
                const range = quill.getSelection(true);
                quill.insertEmbed(range.index, "image", reader.result);
                setTimeout(() => {
                    const imgs = document.querySelectorAll(".ql-editor img");
                    imgs[imgs.length - 1].setAttribute("alt", altText || "Portfolio image");
                }, 0);
            };
            reader.readAsDataURL(file);
        };
    }, []);

    const modules = (ref) => ({
        toolbar: {
            container: [[{ header: [1, 2, false] }], ["bold", "italic", "underline", "link"], [{ list: "ordered" }, { list: "bullet" }], ["image"], ["clean"]],
            handlers: { image: () => imageHandler(ref) }
        }
    });

    useEffect(() => {
        const fetchTargetData = async () => {
            try {
                const res = await fetch(`/api/portfolio/${id}`);
                const data = await res.json();
                setForm({
                    project_title: data.project_title || "",
                    slug: data.slug || "",
                    category_node: data.category_node || "Web Development",
                    deployment_year: data.deployment_year || "",
                    business_challenge: data.business_challenge || "",
                    solution_node: data.solution_node || "",
                    meta_title: data.meta_title || "",
                    meta_description: data.meta_description || "",
                    meta_keywords: data.meta_keywords || ""
                });
                setPreview(data.primary_image || "");
            } catch { toast.error("Failed to fetch data."); }
            finally { setFetching(false); }
        };
        if (id) fetchTargetData();
    }, [id]);

    const dispatchUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        Object.keys(form).forEach(key => formData.append(key, form[key]));
        if (fileObj) formData.append("primary_image", fileObj);

        try {
            const res = await fetch(`/api/portfolio/update/${id}`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                body: formData
            });
            if (res.ok) {
                toast.success("Portfolio updated successfully!");
                setTimeout(() => router.push("/dashboard/portfolio"), 1000);
            } else toast.error("Update failed.");
        } finally { setLoading(false); }
    };

    const inputStyles = "w-full p-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1D1D7E] text-sm font-semibold text-slate-800 transition-all shadow-sm";
    const labelStyles = "text-[10px] font-black uppercase text-slate-400 block mb-1.5 tracking-wider";

    if (fetching) return <div className="flex justify-center py-40"><Loader2 className="animate-spin text-[#1D1D7E]" size={36} /></div>;

    return (
        <div className="p-6 md:p-10 min-h-screen bg-slate-50/40 text-slate-800 max-w-3xl mx-auto">
            <Toaster />
            <div className="sticky top-0 z-50 bg-slate-50/80 backdrop-blur-md py-4 mb-6 flex items-center gap-4 border-b border-gray-200">
                <Link href="/dashboard/portfolio" className="w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black transition-all shadow-sm">
                    <ArrowLeft size={18} />
                </Link>
                <h1 className="text-2xl font-black text-[#1D1D7E] uppercase tracking-tight">Modify Project Matrix</h1>
            </div>

            <form onSubmit={dispatchUpdate} className="bg-white p-6 md:p-10 rounded-[2rem] border border-gray-100 shadow-xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <label className={labelStyles}>Project Title *</label>
                        <input type="text" value={form.project_title} className={inputStyles} required onChange={e => setForm({ ...form, project_title: e.target.value })} />
                    </div>
                    <div>
                        <label className={labelStyles}>Category Node *</label>
                        <select value={form.category_node} className={inputStyles} onChange={e => setForm({ ...form, category_node: e.target.value })}>
                            <option value="Web Development">Web Development</option>
                            <option value="Graphic Design">Graphic Design</option>
                            <option value="UI/UX Design">UI/UX Design</option>
                            <option value="App Development">App Development</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className={labelStyles}>URL Slug *</label>
                    <input type="text" value={form.slug} className={inputStyles} required onChange={e => setForm({ ...form, slug: e.target.value })} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className={labelStyles}>Deployment Year *</label>
                        <input type="number" value={form.deployment_year} className={inputStyles} required onChange={e => setForm({ ...form, deployment_year: e.target.value })} />
                    </div>
                    <div className="md:col-span-2">
                        <label className={labelStyles}>Primary Graphic</label>
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-3.5 bg-slate-50 flex items-center gap-4 relative">
                            {preview && <img src={preview} className="w-8 h-8 rounded object-cover" />}
                            <span className="text-xs font-bold uppercase text-gray-400 truncate">{fileObj ? fileObj.name : "Change graphic"}</span>
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => { setFileObj(e.target.files[0]); setPreview(URL.createObjectURL(e.target.files[0])) }} />
                        </div>
                    </div>
                </div>

                <div>
                    <label className={labelStyles}>Business Challenge Statement *</label>
                    <ReactQuill ref={quillRefChallenge} modules={modules(quillRefChallenge)} theme="snow" value={form.business_challenge} onChange={val => setForm({ ...form, business_challenge: val })} className="h-48 mb-12" />
                </div>

                <div>
                    <label className={labelStyles}>Vortexian Strategic Solution Node *</label>
                    <ReactQuill ref={quillRefSolution} modules={modules(quillRefSolution)} theme="snow" value={form.solution_node} onChange={val => setForm({ ...form, solution_node: val })} className="h-48 mb-12" />
                </div>

                <div className="border-t pt-6 space-y-6">
                    <div className="flex items-center gap-2 text-[#1D1D7E] font-black text-xs uppercase tracking-widest"><Globe size={16} /> SEO Fields</div>
                    <div><label className={labelStyles}>Meta Title</label><input type="text" value={form.meta_title} className={inputStyles} onChange={e => setForm({ ...form, meta_title: e.target.value })} /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className={labelStyles}>Meta Description</label><textarea rows="3" value={form.meta_description} className={inputStyles} onChange={e => setForm({ ...form, meta_description: e.target.value })}></textarea></div>
                        <div><label className={labelStyles}>Meta Keywords</label><textarea rows="3" value={form.meta_keywords} className={inputStyles} onChange={e => setForm({ ...form, meta_keywords: e.target.value })}></textarea></div>
                    </div>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-[#1D1D7E] text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-neutral-900 transition-all flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" /> : <Save size={16} />} Re-Deploy Frame Node
                </button>
            </form>

            <style jsx global>{`
                .ql-editor a { color: blue !important; font-weight: bold !important; text-decoration: underline !important; }
                .ql-toolbar { border-radius: 8px 8px 0 0 !important; }
                .ql-container { border-radius: 0 0 8px 8px !important; }
            `}</style>
        </div>
    );
}