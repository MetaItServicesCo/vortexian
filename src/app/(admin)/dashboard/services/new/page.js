"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Image as ImageIcon, Upload, Link2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

export default function CreateNewService() {
    const router = useRouter();
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [uploadType, setUploadType] = useState("url");
    const [selectedFile, setSelectedFile] = useState(null); // File object store karne ke liye
    const [previewUrl, setPreviewUrl] = useState(""); // UI preview ke liye

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        category: "Marketing",
        shortDesc: "",
        icon: "Share2",
        image: "", // Agar URL method ho to isme jayega
        longDesc: "",
        features: ["", "", "", ""],
        whyChoose: { expertise: "", scalability: "", quality: "" },
        seo: { title: "", description: "", keywords: "" }
    });

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

    // --- LOCAL FILE HANDLER ---
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file)); // Blob URL for instant preview
        toast.success("Image selected from local storage!");
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (uploadType === "url" && !formData.image) {
            toast.error("Please provide an Image URL.");
            return;
        }
        if (uploadType === "file" && !selectedFile) {
            toast.error("Please upload an image file.");
            return;
        }

        setLoading(true);

        // --- MULTER INTEGRATION USING FORMDATA ---
        const submissionData = new FormData();

        // Append text fields and structural JSON data strings
        submissionData.append("title", formData.title);
        submissionData.append("slug", formData.slug);
        submissionData.append("category", formData.category);
        submissionData.append("shortDesc", formData.shortDesc);
        submissionData.append("icon", formData.icon);
        submissionData.append("longDesc", formData.longDesc);
        submissionData.append("features", JSON.stringify(formData.features));
        submissionData.append("whyChoose", JSON.stringify(formData.whyChoose));

        // Process keywords array format dynamically
        const keywordsArray = formData.seo.keywords.split(",").map(k => k.trim()).filter(Boolean);
        submissionData.append("seo", JSON.stringify({
            title: formData.seo.title,
            description: formData.seo.description,
            keywords: keywordsArray
        }));

        // Append conditional images data payload
        submissionData.append("uploadType", uploadType);
        if (uploadType === "url") {
            submissionData.append("imageUrl", formData.image);
        } else {
            submissionData.append("serviceImage", selectedFile); // Key matches multer single upload parameter
        }

        try {
            const res = await fetch("/api/services", {
                method: "POST",
                body: submissionData, // Content-Type header Next.js automatic handles multipart with boundary data tokens
            });

            if (res.ok) {
                toast.success("Capability added successfully!");
                setTimeout(() => router.push("/dashboard/services"), 1500);
            } else {
                const errorData = await res.json();
                toast.error(errorData.message || "Failed to submit database nodes.");
            }
        } catch (err) {
            toast.error("Internal processing transmission error.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-10 min-h-screen bg-gray-50 text-slate-800 font-sans max-w-4xl mx-auto text-base">
            <Toaster position="top-center" />

            {/* --- FORM HEADER CONTROLS --- */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard/services" className="w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black transition-all shadow-sm">
                    <ArrowLeft size={18} />
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-[#1D1D7E] uppercase tracking-tight">Add Digital Capability</h1>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-0.5">Register architectural node profiles</p>
                </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
                {/* --- SECTION 1: CORE FIELDS CONFIGURATIONS --- */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-slate-100 space-y-4">
                    <h2 className="text-sm font-black text-[#1D1D7E] uppercase tracking-widest border-b border-gray-100 pb-2">Core Parameters</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">Service Title</label>
                            <input type="text" required className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-[#5DB4D1] focus:bg-white transition-all"
                                value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">URL Slug</label>
                            <input type="text" required placeholder="e.g. leads-generation-services" className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-[#5DB4D1] focus:bg-white transition-all"
                                value={formData.slug || ""} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                            <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">Category Stack</label>
                            <select className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-[#5DB4D1] focus:bg-white transition-all cursor-pointer"
                                value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                                <option value="Marketing">Marketing</option>
                                <option value="Design">Design</option>
                                <option value="Technology">Technology</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">Lucide Icon String</label>
                            <input type="text" placeholder="Share2, Layers, Code" className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-[#5DB4D1] focus:bg-white transition-all"
                                value={formData.icon || ""} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">Image Source Type</label>
                            <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200/50">
                                <button type="button" onClick={() => { setUploadType("url"); setPreviewUrl(""); }}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${uploadType === "url" ? "bg-white text-[#1D1D7E] shadow-sm" : "text-gray-400"}`}>
                                    <Link2 size={14} /> URL Link
                                </button>
                                <button type="button" onClick={() => { setUploadType("file"); setPreviewUrl(""); }}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${uploadType === "file" ? "bg-white text-[#1D1D7E] shadow-sm" : "text-gray-400"}`}>
                                    <Upload size={14} /> Local File
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Image Input Blocks */}
                    <div className="mt-2">
                        {uploadType === "url" ? (
                            <div>
                                <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">Image Showcase URL</label>
                                {/* FIXED BUG: Added safety evaluation fallback fallback values loop */}
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
                                        {selectedFile ? `Selected: ${selectedFile.name}` : "Choose Image File (Max 5MB)"}
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* --- DYNAMIC UNIVERSAL PREVIEW --- */}
                    {previewUrl && (
                        <div className="mt-2 p-2 border border-dashed border-gray-200 rounded-2xl bg-gray-50">
                            <p className="text-[10px] font-black uppercase text-gray-400 mb-2 flex items-center gap-1">
                                <ImageIcon size={12} /> Live Showcase Asset Preview
                            </p>
                            <div className="relative w-full h-52 rounded-xl overflow-hidden shadow-inner bg-white flex items-center justify-center">
                                <img src={previewUrl} alt="Preview Pipeline" className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = "https://placehold.co/600x400?text=Invalid+Image+Resource"; }} />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">Short Description</label>
                        <textarea rows="2" required className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-[#5DB4D1] focus:bg-white transition-all"
                            value={formData.shortDesc || ""} onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })} />
                    </div>

                    <div>
                        <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">Deep Long Content Description</label>
                        <textarea rows="4" required className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-[#5DB4D1] focus:bg-white transition-all"
                            value={formData.longDesc || ""} onChange={(e) => setFormData({ ...formData, longDesc: e.target.value })} />
                    </div>
                </div>

                {/* --- SECTION 2: FEATURES --- */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-slate-100 space-y-4">
                    <h2 className="text-sm font-black text-[#1D1D7E] uppercase tracking-widest border-b border-gray-100 pb-2">Technical Operational Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formData.features.map((feat, index) => (
                            <div key={index}>
                                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1.5">Feature #{index + 1}</label>
                                <input type="text" required placeholder="Feature specification" className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-[#5DB4D1] focus:bg-white transition-all"
                                    value={feat || ""} onChange={(e) => handleFeatureArray(index, e.target.value)} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- SECTION 3: WHY CHOOSE MATRIX --- */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-slate-100 space-y-4">
                    <h2 className="text-sm font-black text-[#1D1D7E] uppercase tracking-widest border-b border-gray-100 pb-2">Why Choose Matrix</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">Technical Expertise</label>
                            <input type="text" required className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-[#5DB4D1] focus:bg-white transition-all"
                                value={formData.whyChoose.expertise || ""} onChange={(e) => handleNestedChange("whyChoose", "expertise", e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">Scalability Assurance</label>
                            <input type="text" required className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-[#5DB4D1] focus:bg-white transition-all"
                                value={formData.whyChoose.scalability || ""} onChange={(e) => handleNestedChange("whyChoose", "scalability", e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">Quality Operations</label>
                            <input type="text" required className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-[#5DB4D1] focus:bg-white transition-all"
                                value={formData.whyChoose.quality || ""} onChange={(e) => handleNestedChange("whyChoose", "quality", e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* --- SECTION 4: SEO PARAMETERS --- */}
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100/60 space-y-4">
                    <h2 className="text-sm font-black text-[#1D1D7E] uppercase tracking-widest border-b border-blue-100 pb-2">SEO Parameters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-black uppercase text-slate-500 block mb-1.5">Meta Title</label>
                            <input type="text" required className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-[#1D1D7E] transition-all"
                                value={formData.seo.title || ""} onChange={(e) => handleNestedChange("seo", "title", e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-black uppercase text-slate-500 block mb-1.5">Keywords (Comma Separated)</label>
                            <input type="text" required className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-[#1D1D7E] transition-all"
                                value={formData.seo.keywords || ""} onChange={(e) => handleNestedChange("seo", "keywords", e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-black uppercase text-slate-500 block mb-1.5">Meta Description</label>
                        <textarea rows="2" required className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-[#1D1D7E] transition-all"
                            value={formData.seo.description || ""} onChange={(e) => handleNestedChange("seo", "description", e.target.value)} />
                    </div>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-[#1D1D7E] text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#5DB4D1] hover:text-black transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 text-sm cursor-pointer">
                    {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Committing Nodes...</> : <><Save size={18} /> Deploy Capability Node</>}
                </button>
            </form>
        </div>
    );
}