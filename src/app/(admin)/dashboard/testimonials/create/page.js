"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Star, Loader2, Upload } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import ImageAltField, { altError } from "@/components/admin/ImageAltField";

const API_BASE = "";

export default function CreateTestimonialPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [fileObj, setFileObj] = useState(null);
    const [imageAlt, setImageAlt] = useState("");
    const [previewUrl, setPreviewUrl] = useState(null);

    const [fields, setFields] = useState({
        client_name: "",
        client_designation: "",
        testimonial_text: "",
        company: "",
    });

    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null;

    function handleChange(e) {
        setFields({ ...fields, [e.target.name]: e.target.value });
    }

    function handleFile(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileObj(file);
        setPreviewUrl(URL.createObjectURL(file));
        setImageAlt(fields.client_name ? `Photo of ${fields.client_name}` : "");
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!fields.client_name.trim() || !fields.testimonial_text.trim()) {
            toast.error("Name and testimonial text are required");
            return;
        }
        const missingAlt = altError(!!fileObj, imageAlt);
        if (missingAlt) {
            toast.error(missingAlt);
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("client_name", fields.client_name);
            formData.append("client_designation", fields.client_designation);
            formData.append("testimonial_text", fields.testimonial_text);
            formData.append("company", fields.company || "");
            formData.append("rating", String(rating));

            if (fileObj) {
                formData.append("profile_image", fileObj);
                formData.append("profile_image_alt", imageAlt.trim());
            }

            const res = await fetch(`${API_BASE}/api/testimonials/create`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                console.error("Create Error:", data);
                throw new Error(
                    Array.isArray(data.detail)
                        ? data.detail
                              .map((e) => `${e.loc?.join(".")} — ${e.msg}`)
                              .join(", ")
                        : data.detail || "Create failed"
                );
            }

            toast.success("Testimonial added successfully!");
            setTimeout(() => {
                router.push("/dashboard/testimonials");
            }, 1000);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }

    const inputStyles =
        "w-full p-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1D1D7E]/20 focus:border-[#1D1D7E] transition-all";

    const labelStyles =
        "text-xs font-black uppercase tracking-wider text-gray-400 block mb-1.5";

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <Toaster position="top-right" />

            {/* HEADER */}
            <div className="flex items-center gap-3 mb-8">
                <Link href="/dashboard/testimonials">
                    <button className="w-9 h-9 border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors">
                        <ArrowLeft size={18} />
                    </button>
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">
                        Add Testimonial
                    </h1>
                    <p className="text-xs text-gray-400 mt-0.5">
                        New customer review
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

                {/* Profile Image Upload */}
                <div>
                    <label className={labelStyles}>Profile Image</label>
                    <div className="flex items-center gap-4">
                        {previewUrl ? (
                            <div
                                className="w-14 h-14 overflow-hidden shrink-0"
                                style={{
                                    clipPath:
                                        "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                                }}
                            >
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div
                                className="w-14 h-14 bg-[#1D1D7E]/10 shrink-0 flex items-center justify-center"
                                style={{
                                    clipPath:
                                        "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                                }}
                            >
                                <Upload size={14} className="text-[#1D1D7E]" />
                            </div>
                        )}
                        <div className="flex-1">
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                                onChange={handleFile}
                                className="text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#1D1D7E]/10 file:text-[#1D1D7E] hover:file:bg-[#1D1D7E]/20 cursor-pointer"
                            />
                            <p className="text-[11px] text-gray-400 mt-1">
                                Optional — JPG, PNG or WEBP, up to 10 MB
                            </p>
                        </div>
                    </div>
                    {fileObj && (
                        <div className="mt-3">
                            <ImageAltField id="testimonial-image-alt" value={imageAlt} onChange={setImageAlt} />
                        </div>
                    )}
                </div>

                <div className="h-px bg-gray-100" />

                {/* Name + Designation */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelStyles}>
                            Full Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            name="client_name"
                            value={fields.client_name}
                            onChange={handleChange}
                            placeholder="e.g. David Coper"
                            className={inputStyles}
                            required
                        />
                    </div>
                    <div>
                        <label className={labelStyles}>Designation</label>
                        <input
                            name="client_designation"
                            value={fields.client_designation}
                            onChange={handleChange}
                            placeholder="e.g. Happy Customer"
                            className={inputStyles}
                        />
                    </div>
                </div>

                {/* Company */}
                <div>
                    <label className={labelStyles}>Company (optional)</label>
                    <input
                        name="company"
                        value={fields.company}
                        onChange={handleChange}
                        placeholder="e.g. Acme Corp"
                        className={inputStyles}
                    />
                </div>

                <div className="h-px bg-gray-100" />

                {/* Testimonial Text */}
                <div>
                    <label className={labelStyles}>
                        Testimonial Text{" "}
                        <span className="text-red-400">*</span>
                    </label>
                    <textarea
                        name="testimonial_text"
                        value={fields.testimonial_text}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Write the customer's review here..."
                        className={inputStyles}
                        required
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                        {fields.testimonial_text.length} characters
                    </p>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Star Rating */}
                <div>
                    <label className={labelStyles}>Rating</label>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }, (_, i) => i + 1).map(
                            (val) => (
                                <button
                                    key={val}
                                    type="button"
                                    onClick={() => setRating(val)}
                                    onMouseEnter={() => setHoverRating(val)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="p-0.5"
                                    aria-label={`${val} star`}
                                >
                                    <Star
                                        size={24}
                                        className={
                                            val <= (hoverRating || rating)
                                                ? "fill-amber-400 text-amber-400 transition-colors"
                                                : "text-gray-200 transition-colors"
                                        }
                                    />
                                </button>
                            )
                        )}
                        <span className="text-sm text-gray-400 ml-2">
                            {rating} / 5
                        </span>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Link href="/dashboard/testimonials">
                        <button
                            type="button"
                            className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#1D1D7E] hover:bg-[#16166a] disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors"
                    >
                        {loading && (
                            <Loader2 size={15} className="animate-spin" />
                        )}
                        {loading ? "Saving..." : "Save Testimonial"}
                    </button>
                </div>
            </form>
        </div>
    );
}