"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, Quote, Star } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import { useSelection } from "@/lib/useSelection";
import BulkActions from "@/components/admin/bulk/BulkActions";
import { SelectRowCheckbox } from "@/components/admin/bulk/SelectCheckbox";

const API_BASE = "";

export default function TestimonialsListPage() {
    const router = useRouter();
    const [testimonials, setTestimonials] = useState([]);
    const [fetching, setFetching] = useState(true);
    const selection = useSelection(testimonials);

    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null;

    useEffect(() => {
        fetchTestimonials();
    }, []);

    async function fetchTestimonials() {
        try {
            const res = await fetch(`${API_BASE}/api/testimonials/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Fetch failed");
            setTestimonials(Array.isArray(data) ? data : []);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setFetching(false);
        }
    }

    async function handleDelete(id) {
        if (!confirm("Delete this testimonial?\n\nYou can restore it from Recently deleted for 7 days.")) return;
        try {
            const res = await fetch(
                `${API_BASE}/api/testimonials/delete/${id}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Delete failed");
            }
            toast.success("Testimonial deleted");
            setTestimonials((prev) => prev.filter((t) => t.id !== id));
        } catch (err) {
            toast.error(err.message);
        }
    }

    function renderStars(rating) {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                size={12}
                className={
                    i < rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-200"
                }
            />
        ));
    }

    function getInitials(name) {
        return name
            .split(" ")
            .slice(0, 2)
            .map((w) => w[0])
            .join("")
            .toUpperCase();
    }

    const avgRating =
        testimonials.length > 0
            ? (
                testimonials.reduce((sum, t) => sum + (t.rating || 5), 0) /
                testimonials.length
            ).toFixed(1)
            : "0.0";

    if (fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-[#1D1D7E]" size={28} />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <Toaster position="top-right" />

            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">
                        Testimonials
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Manage customer reviews shown on the website
                    </p>
                </div>
                <Link href="/dashboard/testimonials/create">
                    <button className="flex items-center gap-2 bg-[#1D1D7E] hover:bg-[#16166a] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                        <Plus size={16} />
                        Add Testimonial
                    </button>
                </Link>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                        Total
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                        {testimonials.length}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">testimonials</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                        Avg. Rating
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                        {avgRating}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">out of 5</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                        Status
                    </p>
                    <p className="text-2xl font-bold text-green-600">Active</p>
                    <p className="text-xs text-gray-400 mt-0.5">all visible</p>
                </div>
            </div>

            {/* LIST */}
            {testimonials.length === 0 ? (
                <div className="border border-dashed border-gray-200 rounded-2xl p-16 text-center">
                    <Quote size={32} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                        No testimonials yet
                    </p>
                    <p className="text-xs text-gray-400 mt-1 mb-4">
                        Add your first customer review
                    </p>
                    <Link href="/dashboard/testimonials/create">
                        <button className="bg-[#1D1D7E] text-white px-4 py-2 rounded-xl text-sm font-semibold">
                            Add Testimonial
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    <BulkActions
                        resource="testimonials"
                        selection={selection}
                        noun={["testimonial", "testimonials"]}
                        onDeleted={(ids) => setTestimonials((prev) => prev.filter((t) => !ids.includes(t.id)))}
                    />
                    {testimonials.map((t) => (
                        <div
                            key={t.id}
                            className={`border rounded-2xl p-5 flex items-start gap-4 hover:shadow-sm transition-all ${selection.isSelected(t.id) ? "bg-indigo-50/60 border-indigo-200" : "bg-white border-gray-100 hover:border-gray-200"}`}
                        >
                            <div className="pt-4">
                                <SelectRowCheckbox selection={selection} id={t.id} label={`Select testimonial from ${t.client_name}`} />
                            </div>
                            {/* Diamond Avatar */}
                            <div className="shrink-0 mt-1">
                                {t.profile_image ? (
                                    <div
                                        className="w-11 h-11 overflow-hidden"
                                        style={{
                                            clipPath:
                                                "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                                        }}
                                    >
                                        <img
                                            src={`${API_BASE}${t.profile_image}`}
                                            alt={t.client_name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = "none";
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="w-11 h-11 bg-[#1D1D7E]/10 flex items-center justify-center"
                                        style={{
                                            clipPath:
                                                "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                                        }}
                                    >
                                        <span className="text-[#1D1D7E] text-xs font-bold">
                                            {getInitials(t.client_name || "?")}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-500 italic leading-relaxed line-clamp-2 mb-2">
                                    &ldquo;{t.testimonial_text}&rdquo;
                                </p>
                                <div className="flex items-center gap-3">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">
                                            {t.client_name}
                                        </p>
                                        <p className="text-xs text-[#5DB4D1] uppercase tracking-wider font-semibold">
                                            {t.client_designation}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-0.5 ml-auto">
                                        {renderStars(t.rating || 5)}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => handleDelete(t.id)}
                                    className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-300 transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}