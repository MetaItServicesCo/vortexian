"use client";
import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Image as ImageIcon, Upload, Link2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import { slugify, slugifyTyping } from "@/lib/slugify";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("@/components/editor/RichTextEditor"), { ssr: false });

const BASE_URL = "/api/services";

export default function EditServicePage({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [uploadType, setUploadType] = useState("url");
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        category: "Marketing",
        shortDesc: "",
        icon: "Share2",
        image: "",
        longDesc: "",
        features: ["", "", "", ""],
        whyChoose: { expertise: "", scalability: "", quality: "" },
        seo: { title: "", description: "", keywords: "" }
    });

    // ✅ FETCH — backend field names se map karo
    useEffect(() => {
        async function getServiceDetails() {
            try {
                const res = await fetch(`${BASE_URL}/id/${id}`);
                if (!res.ok) throw new Error("Failed");

                const data = await res.json();

                const isLocalUpload = data.image_showcase_url?.startsWith("/uploads/");
                setUploadType(isLocalUpload ? "file" : "url");
                setPreviewUrl(data.image_showcase_url || "");

                setFormData({
                    title: data.service_title || "",
                    slug: data.url_slug || "",
                    category: data.category_stack || "Marketing",
                    shortDesc: data.short_description || "",
                    icon: data.lucide_icon || "Share2",
                    image: isLocalUpload ? "" : (data.image_showcase_url || ""),
                    longDesc: data.long_description || "",
                    features: [
                        data.feature_1 || "",
                        data.feature_2 || "",
                        data.feature_3 || "",
                        data.feature_4 || "",
                    ],
                    whyChoose: {
                        expertise: data.why_choose_1 || "",
                        scalability: data.why_choose_2 || "",
                        quality: data.why_choose_3 || "",
                    },
                    seo: {
                        title: data.meta_title || "",
                        description: data.meta_description || "",
                        keywords: data.keywords || "",
                    }
                });
            } catch (err) {
                toast.error("Error loading service data.");
                router.push("/dashboard/services");
            } finally {
                setFetching(false);
            }
        }
        getServiceDetails();
    }, [id, router]);

    const handleNestedChange = (parent, field, val) => {
        setFormData((prev) => ({
            ...prev,
            [parent]: { ...prev[parent], [field]: val }
        }));
    };

    const handleFeatureArray = (index, val) => {
        const updatedFeatures = [...formData.features];
        updatedFeatures[index] = val;
        setFormData((prev) => ({ ...prev, features: updatedFeatures }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        toast.success("Image selected — it will upload when you save.");
    };

    // ✅ SUBMIT — backend field names, PATCH, JSON body
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            const updatePayload = {
                service_title: formData.title,
                url_slug: formData.slug,
                category_stack: formData.category,
                lucide_icon: formData.icon,
                short_description: formData.shortDesc,
                long_description: formData.longDesc,
                image_source_type: uploadType,
                image_showcase_url: uploadType === "url" ? formData.image : undefined,
                feature_1: formData.features[0],
                feature_2: formData.features[1],
                feature_3: formData.features[2],
                feature_4: formData.features[3],
                why_choose_1: formData.whyChoose.expertise,
                why_choose_2: formData.whyChoose.scalability,
                why_choose_3: formData.whyChoose.quality,
                meta_title: formData.seo.title,
                meta_description: formData.seo.description,
                keywords: formData.seo.keywords,
            };

            const res = await fetch(`${BASE_URL}/update-service/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updatePayload),
            });

            if (res.ok && uploadType === "file" && selectedFile) {
                const imageData = new FormData();
                imageData.append("image_file", selectedFile);

                const imageRes = await fetch(`${BASE_URL}/update-service-image/${id}`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: imageData,
                });

                if (!imageRes.ok) {
                    const errorData = await imageRes.json().catch(() => ({}));
                    toast.error(errorData.detail || "Details saved, but image upload failed.");
                    return;
                }
            }

            if (res.ok) {
                toast.success("Service updated successfully!");
                setTimeout(() => router.push("/dashboard/services"), 1500);
            } else {
                const errorData = await res.json();
                toast.error(errorData.detail || "Update failed.");
            }
        } catch (err) {
            toast.error("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-slate-400 text-sm font-black uppercase tracking-widest">
                <Loader2 className="w-6 h-6 animate-spin text-[#1D1D7E] mb-1 mr-2" />
                Fetching existing node configurations...
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 min-h-screen bg-gray-50 text-slate-800 font-sans max-w-4xl mx-auto text-base">
            <Toaster position="top-center" />

            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard/services" className="w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black transition-all shadow-sm">
                    <ArrowLeft size={18} />
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-[#1D1D7E] uppercase tracking-tight">Modify Capability Layer</h1>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-0.5">Editing: {formData.title || "Node Instance"}</p>
                </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
                {/* CORE PARAMETERS */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-slate-100 space-y-4">
                    <h2 className="text-sm font-black text-[#1D1D7E] uppercase tracking-widest border-b border-gray-100 pb-2">Core Parameters</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">Service Title</label>
                            <input type="text" required value={formData.title || ""} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-[#5DB4D1] focus:bg-white transition-all"
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">URL Slug</label>
                            <input type="text" required value={formData.slug || ""} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-[#5DB4D1] focus:bg-white transition-all"
                                onChange={(e) => setFormData({ ...formData, slug: slugifyTyping(e.target.value) })} />
                            <p className={`text-xs mt-1 ${formData.slug && slugify(formData.slug) !== formData.slug ? "text-amber-600 font-semibold" : "text-gray-400"}`}>
                                {formData.slug && slugify(formData.slug) !== formData.slug
                                    ? `This address will be cleaned up when you save: /services/${slugify(formData.slug)}`
                                    : `Page address: /services/${formData.slug || "…"}`}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                            <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">Category Stack</label>
                            <select value={formData.category} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-[#5DB4D1] focus:bg-white transition-all cursor-pointer"
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                                <option value="Marketing">Marketing</option>
                                <option value="Design">Design</option>
                                <option value="Technology">Technology</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">Lucide Icon String</label>
                            <input type="text" value={formData.icon || ""} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-[#5DB4D1] focus:bg-white transition-all"
                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">Image Source Type</label>
                            <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200/50">
                                <button type="button" onClick={() => setUploadType("url")}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${uploadType === "url" ? "bg-white text-[#1D1D7E] shadow-sm" : "text-gray-400"}`}>
                                    <Link2 size={14} /> URL Link
                                </button>
                                <button type="button" onClick={() => setUploadType("file")}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${uploadType === "file" ? "bg-white text-[#1D1D7E] shadow-sm" : "text-gray-400"}`}>
                                    <Upload size={14} /> Local File
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-2">
                        {uploadType === "url" ? (
                            <div>
                                <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">Image Showcase URL</label>
                                <input type="text" placeholder="https://images.unsplash.com/..." className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-[#5DB4D1] focus:bg-white transition-all"
                                    value={formData.image || ""}
                                    onChange={(e) => {
                                        setFormData({ ...formData, image: e.target.value });
                                        setPreviewUrl(e.target.value);
                                    }} />
                            </div>
                        ) : (
                            <div>
                                <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">Upload Local Asset Image</label>
                                <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />
                                <button type="button" onClick={() => fileInputRef.current.click()}
                                    className="w-full p-5 border-2 border-dashed border-gray-200 bg-gray-50 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:bg-gray-100/50 hover:border-[#5DB4D1] transition-all cursor-pointer">
                                    <Upload size={24} className="text-gray-400" />
                                    <span className="text-sm font-bold uppercase tracking-wider text-slate-600">
                                        {selectedFile ? `Selected: ${selectedFile.name}` : "Replace Local Image File (Max 5MB)"}
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>

                    {previewUrl && (
                        <div className="mt-2 p-2 border border-dashed border-gray-200 rounded-2xl bg-gray-50">
                            <p className="text-[10px] font-black uppercase text-gray-400 mb-2 flex items-center gap-1">
                                <ImageIcon size={12} /> Active Live Preview Matrix
                            </p>
                            <div className="relative w-full h-52 rounded-xl overflow-hidden shadow-inner bg-white flex items-center justify-center">
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = "https://placehold.co/600x400?text=Invalid+Image"; }} />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">Short Description</label>
                        <textarea rows="2" required value={formData.shortDesc || ""} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-[#5DB4D1] focus:bg-white transition-all"
                            onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">Deep Long Content Description</label>
                        <RichTextEditor
                            value={formData.longDesc || ""}
                            onChange={(value) => setFormData((prev) => ({ ...prev, longDesc: value }))}
                            minHeight={220}
                        />
                    </div>
                </div>

                {/* FEATURES */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-slate-100 space-y-4">
                    <h2 className="text-sm font-black text-[#1D1D7E] uppercase tracking-widest border-b border-gray-100 pb-2">Technical Operational Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formData.features.map((feat, index) => (
                            <div key={index}>
                                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1.5">Feature Module #{index + 1}</label>
                                <input type="text" value={feat || ""} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-[#5DB4D1] focus:bg-white transition-all"
                                    onChange={(e) => handleFeatureArray(index, e.target.value)} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* WHY CHOOSE */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-slate-100 space-y-4">
                    <h2 className="text-sm font-black text-[#1D1D7E] uppercase tracking-widest border-b border-gray-100 pb-2">Why Choose Matrix Framework</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">Technical Expertise Statement</label>
                            <input type="text" required value={formData.whyChoose.expertise || ""} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-[#5DB4D1] focus:bg-white transition-all"
                                onChange={(e) => handleNestedChange("whyChoose", "expertise", e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">Scalability Assurance Statement</label>
                            <input type="text" required value={formData.whyChoose.scalability || ""} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-[#5DB4D1] focus:bg-white transition-all"
                                onChange={(e) => handleNestedChange("whyChoose", "scalability", e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">Quality Operations Statement</label>
                            <input type="text" required value={formData.whyChoose.quality || ""} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-[#5DB4D1] focus:bg-white transition-all"
                                onChange={(e) => handleNestedChange("whyChoose", "quality", e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* SEO */}
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100/60 space-y-4">
                    <h2 className="text-sm font-black text-[#1D1D7E] uppercase tracking-widest border-b border-blue-100 pb-2">Programmatic SEO Head Parameters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-black uppercase text-slate-500 block mb-1.5">Meta Title Tag</label>
                            <input type="text" required value={formData.seo.title || ""} className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-[#1D1D7E] transition-all"
                                onChange={(e) => handleNestedChange("seo", "title", e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-black uppercase text-slate-500 block mb-1.5">Meta Crawl Keywords (Comma Separated)</label>
                            <input type="text" required value={formData.seo.keywords || ""} className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-[#1D1D7E] transition-all"
                                onChange={(e) => handleNestedChange("seo", "keywords", e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-black uppercase text-slate-500 block mb-1.5">Meta Target Search Snippet Description</label>
                        <textarea rows="2" required value={formData.seo.description || ""} className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-[#1D1D7E] transition-all"
                            onChange={(e) => handleNestedChange("seo", "description", e.target.value)} />
                    </div>
                </div>

                {/* SUBMIT */}
                <button type="submit" disabled={loading} className="w-full bg-[#1D1D7E] text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#5DB4D1] hover:text-black transition-all shadow-xl shadow-blue-900/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm">
                    {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Re-Deploying Core State Data...</> : <><Save size={18} /> Save Changes & Re-Deploy</>}
                </button>
            </form>
        </div>
    );
}