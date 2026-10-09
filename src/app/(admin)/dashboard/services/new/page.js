"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { slugify, slugifyTyping } from "@/lib/slugify";
import ImageAltField, { altError } from "@/components/admin/ImageAltField";
import { richTextAltError } from "@/lib/richText";
import dynamic from "next/dynamic";
import axios from "axios";
import MenuToggle from "@/components/admin/services/MenuToggle";
import SchemaMarkupField, { schemaJsonError } from "@/components/admin/SchemaMarkupField";
import {
    ArrowLeft,
    Loader2,
    Save,
    Image as ImageIcon,
    Upload,
    Link2
} from "lucide-react";

import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

const RichTextEditor = dynamic(() => import("@/components/editor/RichTextEditor"), { ssr: false });

export default function CreateNewService() {

    const router = useRouter();

    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(false);

    const [uploadType, setUploadType] = useState("url");

    const [selectedFile, setSelectedFile] = useState(null);

    const [previewUrl, setPreviewUrl] = useState("");

    // FASTAPI URL
    const API_URL = "/api/services/create-service";


    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        category: "Marketing",
        shortDesc: "",
        icon: "Share2",
        image: "",
        image_alt: "",
        longDesc: "",
        features: ["", "", "", ""],
        showInMenu: true,
        schemaJson: "",

        whyChoose: {
            expertise: "",
            scalability: "",
            quality: ""
        },

        seo: {
            title: "",
            description: "",
            keywords: ""
        }
    });

    // NESTED CHANGE
    const handleNestedChange = (parent, field, val) => {
        setFormData((prev) => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [field]: val
            }
        }));
    };

    // FEATURES
    const handleFeatureArray = (index, val) => {

        const updatedFeatures = [...formData.features];

        updatedFeatures[index] = val;

        setFormData((prev) => ({
            ...prev,
            features: updatedFeatures
        }));
    };

    // FILE CHANGE
    const handleFileChange = (e) => {

        const file = e.target.files[0];

        if (!file) return;

        setSelectedFile(file);

        setPreviewUrl(URL.createObjectURL(file));

        toast.success("Image selected successfully!");
    };

    // SUBMIT
    const handleFormSubmit = async (e) => {

        e.preventDefault();

        // VALIDATION
        if (uploadType === "url" && !formData.image) {
            toast.error("Please provide image URL");
            return;
        }

        if (uploadType === "file" && !selectedFile) {
            toast.error("Please upload image");
            return;
        }

        const altProblem = altError(true, formData.image_alt) || richTextAltError(formData.longDesc, "long description");
        if (altProblem) {
            toast.error(altProblem);
            return;
        }
        const schemaProblem = schemaJsonError(formData.schemaJson);
        if (schemaProblem) {
            toast.error(`Schema markup is not valid JSON: ${schemaProblem}`);
            return;
        }

        setLoading(true);

        try {

            const token = localStorage.getItem("token");

            const submitData = new FormData();

            // BASIC FIELDS
            submitData.append(
                "service_title",
                formData.title
            );

            submitData.append(
                "url_slug",
                formData.slug
            );

            submitData.append(
                "category_stack",
                formData.category
            );

            submitData.append(
                "lucide_icon",
                formData.icon
            );

            submitData.append(
                "short_description",
                formData.shortDesc
            );

            submitData.append(
                "long_description",
                formData.longDesc
            );

            // IMAGE TYPE
            submitData.append(
                "image_source_type",
                uploadType
            );

            submitData.append("image_alt", formData.image_alt.trim());

            // IMAGE URL OR FILE
            if (uploadType === "url") {

                submitData.append(
                    "image_showcase_url",
                    formData.image
                );

            } else {

                submitData.append("image_file", selectedFile);
            }

            // FEATURES
            submitData.append(
                "feature_1",
                formData.features[0]
            );

            submitData.append(
                "feature_2",
                formData.features[1]
            );

            submitData.append(
                "feature_3",
                formData.features[2]
            );

            submitData.append(
                "feature_4",
                formData.features[3]
            );

            submitData.append("show_in_menu", formData.showInMenu ? "true" : "false");
            submitData.append("schema_json", formData.schemaJson.trim());

            // WHY CHOOSE
            submitData.append(
                "why_choose_1",
                formData.whyChoose.expertise
            );

            submitData.append(
                "why_choose_2",
                formData.whyChoose.scalability
            );

            submitData.append(
                "why_choose_3",
                formData.whyChoose.quality
            );

            // SEO
            submitData.append(
                "meta_title",
                formData.seo.title
            );

            submitData.append(
                "meta_description",
                formData.seo.description
            );

            submitData.append(
                "keywords",
                formData.seo.keywords
            );

            // API REQUEST
            const res = await axios.post(
                API_URL,
                submitData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type":
                            "multipart/form-data",
                    },
                }
            );

            console.log(res.data);

            toast.success(
                "Capability added successfully!"
            );

            setTimeout(() => {
                router.push("/dashboard/services");
            }, 1500);

        } catch (err) {

            console.error(err);

            toast.error(
                err?.response?.data?.detail ||
                "Internal processing transmission error."
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-10 min-h-screen bg-gray-50 text-slate-800 font-sans max-w-4xl mx-auto text-base">

            <Toaster position="top-center" />

            {/* HEADER */}
            <div className="flex items-center gap-4 mb-8">

                <Link
                    href="/dashboard/services"
                    className="w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black transition-all shadow-sm"
                >
                    <ArrowLeft size={18} />
                </Link>

                <div>
                    <h1 className="text-2xl font-black text-[#1D1D7E] uppercase tracking-tight">
                        Add Digital Capability
                    </h1>

                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-0.5">
                        Register architectural node profiles
                    </p>
                </div>
            </div>

            <form
                onSubmit={handleFormSubmit}
                className="space-y-6"
            >

                {/* SECTION 1 */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-slate-100 space-y-4">

                    <h2 className="text-sm font-black text-[#1D1D7E] uppercase tracking-widest border-b border-gray-100 pb-2">
                        Core Parameters
                    </h2>

                    <MenuToggle checked={formData.showInMenu} onChange={(value) => setFormData((prev) => ({ ...prev, showInMenu: value }))} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* TITLE */}
                        <div>
                            <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">
                                Service Title
                            </label>

                            <input
                                type="text"
                                required
                                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-[#5DB4D1] focus:bg-white transition-all"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        title: e.target.value
                                    })
                                }
                            />
                        </div>

                        {/* SLUG */}
                        <div>
                            <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">
                                URL Slug
                            </label>

                            <input
                                type="text"
                                required
                                placeholder="e.g. leads-generation-services"
                                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-[#5DB4D1] focus:bg-white transition-all"
                                value={formData.slug}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        slug: slugifyTyping(e.target.value)
                                    })
                                }
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Page address: /services/{slugify(formData.slug) || "…"}
                            </p>
                        </div>
                    </div>

                    {/* CATEGORY + ICON + TYPE */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                        <div>
                            <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">
                                Category Stack
                            </label>

                            <select
                                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl"
                                value={formData.category}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        category: e.target.value
                                    })
                                }
                            >
                                <option value="Marketing">
                                    Marketing
                                </option>

                                <option value="Design">
                                    Design
                                </option>

                                <option value="Technology">
                                    Technology
                                </option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">
                                Lucide Icon String
                            </label>

                            <input
                                type="text"
                                placeholder="Share2"
                                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl"
                                value={formData.icon}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        icon: e.target.value
                                    })
                                }
                            />
                        </div>

                        {/* IMAGE TYPE */}
                        <div>
                            <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">
                                Image Source Type
                            </label>

                            <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200/50">

                                <button
                                    type="button"
                                    onClick={() => {
                                        setUploadType("url");
                                        setPreviewUrl("");
                                    }}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${uploadType === "url"
                                        ? "bg-white text-[#1D1D7E] shadow-sm"
                                        : "text-gray-400"
                                        }`}
                                >
                                    <Link2 size={14} />
                                    URL Link
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setUploadType("file");
                                        setPreviewUrl("");
                                    }}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${uploadType === "file"
                                        ? "bg-white text-[#1D1D7E] shadow-sm"
                                        : "text-gray-400"
                                        }`}
                                >
                                    <Upload size={14} />
                                    Local File
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* IMAGE */}
                    <div className="mt-2">

                        {uploadType === "url" ? (

                            <div>

                                <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">
                                    Image Showcase URL
                                </label>

                                <input
                                    type="text"
                                    placeholder="https://images.unsplash.com/..."
                                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl"
                                    value={formData.image}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            image: e.target.value
                                        });

                                        setPreviewUrl(e.target.value);
                                    }}
                                />
                            </div>

                        ) : (

                            <div>

                                <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">
                                    Upload Local Asset Image
                                </label>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        fileInputRef.current.click()
                                    }
                                    className="w-full p-5 border-2 border-dashed border-gray-200 bg-gray-50 rounded-xl flex flex-col items-center justify-center gap-2"
                                >
                                    <Upload size={24} />

                                    <span className="text-sm font-bold uppercase tracking-wider text-slate-600">
                                        {selectedFile
                                            ? `Selected: ${selectedFile.name}`
                                            : "Choose Image File"}
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* PREVIEW */}
                    {previewUrl && (
                        <div className="mt-2 p-2 border border-dashed border-gray-200 rounded-2xl bg-gray-50">

                            <p className="text-[10px] font-black uppercase text-gray-400 mb-2 flex items-center gap-1">
                                <ImageIcon size={12} />
                                Live Showcase Asset Preview
                            </p>

                            <div className="relative w-full h-52 rounded-xl overflow-hidden shadow-inner bg-white flex items-center justify-center">

                                <img
                                    src={previewUrl}
                                    alt={formData.image_alt || "Preview"}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    )}

                    <ImageAltField
                        id="service-image-alt"
                        value={formData.image_alt}
                        onChange={(value) => setFormData((prev) => ({ ...prev, image_alt: value }))}
                    />

                    {/* SHORT DESC */}
                    <div>
                        <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">
                            Short Description
                        </label>

                        <textarea
                            rows="2"
                            required
                            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl"
                            value={formData.shortDesc}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    shortDesc: e.target.value
                                })
                            }
                        />
                    </div>

                    {/* LONG DESC */}
                    <div>
                        <label className="text-xs font-black uppercase text-gray-400 block mb-1.5">
                            Deep Long Content Description
                        </label>

                        <RichTextEditor
                            value={formData.longDesc}
                            onChange={(value) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    longDesc: value
                                }))
                            }
                            minHeight={220}
                        />
                    </div>
                </div>

                {/* FEATURES */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-slate-100 space-y-4">

                    <h2 className="text-sm font-black text-[#1D1D7E] uppercase tracking-widest border-b border-gray-100 pb-2">
                        Technical Operational Features
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {formData.features.map((feat, index) => (

                            <div key={index}>

                                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1.5">
                                    Feature #{index + 1}
                                </label>

                                <input
                                    type="text"
                                    required
                                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl"
                                    value={feat}
                                    onChange={(e) =>
                                        handleFeatureArray(
                                            index,
                                            e.target.value
                                        )
                                    }
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* WHY CHOOSE */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-slate-100 space-y-4">

                    <h2 className="text-sm font-black text-[#1D1D7E] uppercase tracking-widest border-b border-gray-100 pb-2">
                        Why Choose Matrix
                    </h2>

                    <div className="space-y-4">

                        <input
                            type="text"
                            required
                            placeholder="Technical Expertise"
                            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl"
                            value={formData.whyChoose.expertise}
                            onChange={(e) =>
                                handleNestedChange(
                                    "whyChoose",
                                    "expertise",
                                    e.target.value
                                )
                            }
                        />

                        <input
                            type="text"
                            required
                            placeholder="Scalability Assurance"
                            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl"
                            value={formData.whyChoose.scalability}
                            onChange={(e) =>
                                handleNestedChange(
                                    "whyChoose",
                                    "scalability",
                                    e.target.value
                                )
                            }
                        />

                        <input
                            type="text"
                            required
                            placeholder="Quality Operations"
                            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl"
                            value={formData.whyChoose.quality}
                            onChange={(e) =>
                                handleNestedChange(
                                    "whyChoose",
                                    "quality",
                                    e.target.value
                                )
                            }
                        />
                    </div>
                </div>

                {/* SEO */}
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100/60 space-y-4">

                    <h2 className="text-sm font-black text-[#1D1D7E] uppercase tracking-widest border-b border-blue-100 pb-2">
                        SEO Parameters
                    </h2>

                    <input
                        type="text"
                        required
                        placeholder="Meta Title"
                        className="w-full p-3.5 bg-white border border-gray-200 rounded-xl"
                        value={formData.seo.title}
                        onChange={(e) =>
                            handleNestedChange(
                                "seo",
                                "title",
                                e.target.value
                            )
                        }
                    />

                    <input
                        type="text"
                        required
                        placeholder="Keywords"
                        className="w-full p-3.5 bg-white border border-gray-200 rounded-xl"
                        value={formData.seo.keywords}
                        onChange={(e) =>
                            handleNestedChange(
                                "seo",
                                "keywords",
                                e.target.value
                            )
                        }
                    />

                    <textarea
                        rows="2"
                        required
                        placeholder="Meta Description"
                        className="w-full p-3.5 bg-white border border-gray-200 rounded-xl"
                        value={formData.seo.description}
                        onChange={(e) =>
                            handleNestedChange(
                                "seo",
                                "description",
                                e.target.value
                            )
                        }
                    />
                </div>

                <SchemaMarkupField kind="service" id="service-schema-json" value={formData.schemaJson} onChange={(value) => setFormData((prev) => ({ ...prev, schemaJson: value }))} />

                {/* SUBMIT */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#1D1D7E] text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#5DB4D1] hover:text-black transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 text-sm cursor-pointer"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Committing Nodes...
                        </>
                    ) : (
                        <>
                            <Save size={18} />
                            Deploy Capability Node
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}