"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import { mediaUrl } from "@/lib/api";
import ImageAltField, { altError } from "@/components/admin/ImageAltField";

export default function EditTeamProfilePanel() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [fileObj, setFileObj] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [imageAlt, setImageAlt] = useState("");

    const [fields, setFields] = useState({
        full_name: "",
        designation: "",
        bio_description: "",
        facebook_link: "",
        instagram_link: "",
        linkedin_link: "",
    });

    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null;

    // ================= FETCH DATA =================
    useEffect(() => {
        if (!id) return;

        async function loadData() {
            try {
                const res = await fetch(
                    `/api/team/teams/${id}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                const data = await res.json();

                if (!res.ok) throw new Error(data.detail || "Fetch failed");

                setFields({
                    full_name: data.full_name || "",
                    designation: data.designation || "",
                    bio_description: data.bio_description || "",
                    facebook_link: data.facebook_link || "",
                    instagram_link: data.instagram_link || "",
                    linkedin_link: data.linkedin_link || "",
                });

                // Existing image preview
                if (data.profile_image) {
                    setPreviewUrl(mediaUrl(data.profile_image));
                    setImageAlt(data.profile_image_alt || "");
                }
            } catch (err) {
                toast.error(err.message);
            } finally {
                setFetching(false);
            }
        }

        loadData();
    }, [id, token]);

    // ================= FILE CHANGE =================
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileObj(file);
        setImageAlt(fields.full_name ? `Portrait of ${fields.full_name}` : "");
        setPreviewUrl(URL.createObjectURL(file));
    };

    // ================= UPDATE =================
    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!token) {
            toast.error("Unauthorized: Please login again");
            return;
        }
        const missingAlt = altError(true, imageAlt);
        if (missingAlt) {
            toast.error(missingAlt);
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();

            // Field names must match FastAPI endpoint params exactly
            formData.append("full_name", fields.full_name);
            formData.append("designation", fields.designation);
            formData.append("bio_description", fields.bio_description);
            formData.append("facebook_link", fields.facebook_link || "");
            formData.append("instagram_link", fields.instagram_link || "");
            formData.append("linkedin_link", fields.linkedin_link || "");

            // Only append image if user selected a new one
            formData.append("profile_image_alt", imageAlt.trim());
            if (fileObj) {
                formData.append("profile_image", fileObj);
            }

            const res = await fetch(
                `/api/team/update-team/${id}`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        // ⚠️ Content-Type bilkul mat lagao — browser khud set karta hai boundary ke saath
                    },
                    body: formData,
                }
            );

            const data = await res.json();

            if (!res.ok) {
                // 422 ka full detail console mein dikhao
                console.error("422 Validation Detail:", JSON.stringify(data, null, 2));
                throw new Error(
                    Array.isArray(data.detail)
                        ? data.detail.map((e) => `${e.loc?.join(".")} — ${e.msg}`).join(", ")
                        : data.detail || "Update failed"
                );
            }

            toast.success("Team member updated successfully!");

            setTimeout(() => {
                router.push("/dashboard/team");
            }, 1000);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const inputStyles =
        "w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";

    const labelStyles =
        "text-xs font-black uppercase text-slate-500 block mb-1.5";

    // ================= LOADING =================
    if (fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <Toaster position="top-right" />

            {/* HEADER */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/dashboard/team"
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl font-bold">Edit Team Member</h1>
            </div>

            <form onSubmit={handleUpdate} className="space-y-5">

                {/* Image Preview + Upload */}
                <div>
                    <label className={labelStyles}>Profile Image</label>
                    {previewUrl && (
                        <div className="mb-3">
                            <img
                                src={previewUrl}
                                alt={imageAlt || "Current profile"}
                                className="w-20 h-20 rounded-full object-cover border border-gray-200"
                            />
                        </div>
                    )}
                    <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                        onChange={handleFileChange}
                        className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                        Leave empty to keep existing image
                    </p>
                    <div className="mt-3">
                        <ImageAltField id="team-image-alt" value={imageAlt} onChange={setImageAlt} />
                    </div>
                </div>

                <div>
                    <label className={labelStyles}>Full Name</label>
                    <input
                        value={fields.full_name}
                        onChange={(e) =>
                            setFields({ ...fields, full_name: e.target.value })
                        }
                        className={inputStyles}
                        required
                    />
                </div>

                <div>
                    <label className={labelStyles}>Designation</label>
                    <input
                        value={fields.designation}
                        onChange={(e) =>
                            setFields({ ...fields, designation: e.target.value })
                        }
                        className={inputStyles}
                        required
                    />
                </div>

                <div>
                    <label className={labelStyles}>Bio</label>
                    <textarea
                        value={fields.bio_description}
                        onChange={(e) =>
                            setFields({ ...fields, bio_description: e.target.value })
                        }
                        className={inputStyles}
                        rows={4}
                        required
                    />
                </div>

                <div>
                    <label className={labelStyles}>Facebook</label>
                    <input
                        value={fields.facebook_link}
                        onChange={(e) =>
                            setFields({ ...fields, facebook_link: e.target.value })
                        }
                        className={inputStyles}
                        placeholder="https://facebook.com/..."
                    />
                </div>

                <div>
                    <label className={labelStyles}>Instagram</label>
                    <input
                        value={fields.instagram_link}
                        onChange={(e) =>
                            setFields({ ...fields, instagram_link: e.target.value })
                        }
                        className={inputStyles}
                        placeholder="https://instagram.com/..."
                    />
                </div>

                <div>
                    <label className={labelStyles}>LinkedIn</label>
                    <input
                        value={fields.linkedin_link}
                        onChange={(e) =>
                            setFields({ ...fields, linkedin_link: e.target.value })
                        }
                        className={inputStyles}
                        placeholder="https://linkedin.com/in/..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white p-3.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    {loading ? "Updating..." : "Update Member"}
                </button>
            </form>
        </div>
    );
}