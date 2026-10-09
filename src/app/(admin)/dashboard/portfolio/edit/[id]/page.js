"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2, Save, FileImage } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import ImageAltField, { altError } from "@/components/admin/ImageAltField";
import SchemaMarkupField, { schemaJsonError } from "@/components/admin/SchemaMarkupField";
import { adminFetch } from "@/lib/adminApi";
import { mediaUrl } from "@/lib/api";

export default function EditPortfolioAssetForm() {
    const router = useRouter();
    const { id } = useParams();
    const [fetching, setFetching] = useState(true);
    const [loading, setLoading] = useState(false);
    const [fileObj, setFileObj] = useState(null);
    const [preview, setPreview] = useState("");
    const [imageAlt, setImageAlt] = useState("");

    const [form, setForm] = useState({
        project_title: "",
        category_node: "Web Development",
        deployment_year: "",
        business_challenge: "",
        solution_node: "",
        meta_title: "",
        meta_description: "",
        meta_keywords: "",
        schema_json: ""
    });

    useEffect(() => {
        const fetchTargetData = async () => {
            try {
                const res = await fetch(
                    `/api/portfolio/${id}`
                );

                if (!res.ok) {
                    throw new Error("Failed to fetch data");
                }

                const data = await res.json();

                setForm({
                    project_title: data.project_title || "",
                    category_node: data.category_node || "Web Development",
                    deployment_year: data.deployment_year || "",
                    business_challenge: data.business_challenge || "",
                    solution_node: data.solution_node || "",
                    meta_title: data.meta_title || "",
                    meta_description: data.meta_description || "",
                    meta_keywords: data.meta_keywords || "",
                    schema_json: data.schema_json || ""
                });

                setPreview(data.primary_image ? mediaUrl(data.primary_image) : "");
                setImageAlt(data.primary_image_alt || "");
            } catch (error) {
                console.error(error);
                toast.error("Failed to load portfolio data.");
            } finally {
                setFetching(false);
            }
        };

        if (id) {
            fetchTargetData();
        }
    }, [id]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileObj(file);
            setPreview(URL.createObjectURL(file));
            setImageAlt(""); // describe the new picture
        }
    };

    const dispatchUpdate = async (e) => {
        e.preventDefault();
        const missingAlt = altError(true, imageAlt);
        if (missingAlt) {
            toast.error(missingAlt);
            return;
        }
        const schemaProblem = schemaJsonError(form.schema_json);
        if (schemaProblem) {
            toast.error(`Schema markup is not valid JSON: ${schemaProblem}`);
            return;
        }
        setLoading(true);

        try {

            // FastAPI Form fields ke mutabiq FormData taiyar karna
            const formData = new FormData();
            formData.append("project_title", form.project_title);
            formData.append("category_node", form.category_node);
            formData.append("deployment_year", parseInt(form.deployment_year) || 0);
            formData.append("business_challenge", form.business_challenge);
            formData.append("solution_node", form.solution_node);
            formData.append("meta_title", form.meta_title || "");
            formData.append("meta_description", form.meta_description || "");
            formData.append("meta_keywords", form.meta_keywords || "");
            formData.append("schema_json", (form.schema_json || "").trim());

            formData.append("primary_image_alt", imageAlt.trim());
            // The API expects the new file as "image_file" (it was sent as "primary_image", so changes were ignored)
            if (fileObj) {
                formData.append("image_file", fileObj);
            }

            await adminFetch(`/api/portfolio/update/${id}`, { method: "PATCH", body: formData });
            toast.success("Portfolio updated successfully!");
            setTimeout(() => {
                router.push("/dashboard/portfolio");
            }, 1000);
        } catch (error) {
            toast.error(
                error.message === "Failed to fetch"
                    ? "Could not reach the server. Check your internet connection and try again."
                    : `Could not save: ${error.message}`
            );
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className={labelStyles}>Deployment Year *</label>
                        <input type="number" value={form.deployment_year} className={inputStyles} required onChange={e => setForm({ ...form, deployment_year: e.target.value })} />
                    </div>
                    <div className="md:col-span-2">
                        <label className={labelStyles}>Asset Re-Allocation Framework</label>
                        <div className="border-2 border-dashed border-gray-200 hover:border-[#1D1D7E] rounded-xl p-3.5 transition-all bg-slate-50/50 flex items-center gap-4 relative">
                            {preview ? (
                                <img src={preview} alt="Preview" className="w-8 h-8 rounded object-cover border border-gray-200" />
                            ) : (
                                <FileImage className="text-gray-400" size={24} />
                            )}
                            <span className="text-xs font-bold uppercase text-gray-400 truncate">{fileObj ? fileObj.name : "Select to rewrite graphic data source"}</span>
                            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <ImageAltField id="portfolio-image-alt" value={imageAlt} onChange={setImageAlt} />
                    </div>
                </div>

                <div>
                    <label className={labelStyles}>The Business Challenge Statement *</label>
                    <textarea rows="4" value={form.business_challenge} className={`${inputStyles} resize-none`} required onChange={e => setForm({ ...form, business_challenge: e.target.value })}></textarea>
                </div>

                <div>
                    <label className={labelStyles}>Vortexian Strategic Solution Node *</label>
                    <textarea rows="4" value={form.solution_node} className={`${inputStyles} resize-none`} required onChange={e => setForm({ ...form, solution_node: e.target.value })}></textarea>
                </div>

                <div className="border-t border-gray-100 pt-6 space-y-6">
                    <div className="text-[#1D1D7E] font-black text-xs uppercase tracking-widest">Active Search Indexes Setup</div>
                    <div>
                        <label className={labelStyles}>Meta Target Title Mapping</label>
                        <input type="text" value={form.meta_title} className={inputStyles} onChange={e => setForm({ ...form, meta_title: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelStyles}>Meta Index Description String</label>
                            <textarea rows="3" value={form.meta_description} className={`${inputStyles} resize-none`} onChange={e => setForm({ ...form, meta_description: e.target.value })}></textarea>
                        </div>
                        <div>
                            <label className={labelStyles}>Meta Priority Context Keywords</label>
                            <textarea rows="3" value={form.meta_keywords} className={`${inputStyles} resize-none`} onChange={e => setForm({ ...form, meta_keywords: e.target.value })}></textarea>
                        </div>
                    </div>
                </div>

                <SchemaMarkupField kind="portfolio" id="portfolio-schema-json" value={form.schema_json} onChange={(value) => setForm((prev) => ({ ...prev, schema_json: value }))} />

                <button type="submit" disabled={loading} className="w-full bg-[#1D1D7E] text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-neutral-900 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer shadow-md">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Committing Changes...</> : <><Save size={16} /> Re-Deploy Frame Node</>}
                </button>
            </form>
        </div>
    );
}