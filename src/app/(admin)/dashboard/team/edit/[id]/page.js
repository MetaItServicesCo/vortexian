"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, FileImage } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

export default function EditTeamProfilePanel({ params }) {
    const { id } = params;
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [fileObj, setFileObj] = useState(null);

    const [fields, setFields] = useState({
        full_name: "",
        designation: "",
        bio_description: "",
        facebook_link: "",
        instagram_link: "",
        linkedin_link: ""
    });

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // ================= FETCH SINGLE TEAM =================
    useEffect(() => {
        async function loadData() {
            try {
                const res = await fetch(
                    `http://localhost:8000/api/team/teams/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await res.json();

                if (!res.ok) throw new Error(data.detail);

                setFields({
                    full_name: data.full_name || "",
                    designation: data.designation || "",
                    bio_description: data.bio_description || "",
                    facebook_link: data.facebook_link || "",
                    instagram_link: data.instagram_link || "",
                    linkedin_link: data.linkedin_link || ""
                });

            } catch (err) {
                toast.error(err.message || "Fetch failed");
            } finally {
                setFetching(false);
            }
        }

        loadData();
    }, [id]);

    // ================= UPDATE TEAM =================
    const handleUpdate = async (e) => {
        e.preventDefault();

        setLoading(true);

        try {
            const formData = new FormData();

            formData.append("full_name", fields.full_name);
            formData.append("designation", fields.designation);
            formData.append("bio_description", fields.bio_description);

            formData.append("facebook_link", fields.facebook_link);
            formData.append("instagram_link", fields.instagram_link);
            formData.append("linkedin_link", fields.linkedin_link);

            if (fileObj) {
                formData.append("image", fileObj);
            }

            const res = await fetch(
                `http://localhost:8000/api/team/update-team/${id}`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: formData
                }
            );

            const data = await res.json();

            if (!res.ok) throw new Error(data.detail);

            toast.success("Team updated successfully!");

            setTimeout(() => {
                router.push("/dashboard/team");
            }, 1200);

        } catch (err) {
            toast.error(err.message || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    const inputStyles =
        "w-full p-3.5 bg-white border border-gray-200 rounded-xl";

    const labelStyles =
        "text-xs font-black uppercase text-slate-500 block mb-1.5";

    if (fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <Toaster />

            {/* HEADER */}
            <div className="flex items-center gap-4 mb-6">
                <Link href="/dashboard/team">
                    <ArrowLeft />
                </Link>

                <h1 className="text-xl font-bold">Edit Team Member</h1>
            </div>

            <form onSubmit={handleUpdate} className="space-y-5">

                <div>
                    <label className={labelStyles}>Full Name</label>
                    <input
                        value={fields.full_name}
                        onChange={(e) =>
                            setFields({ ...fields, full_name: e.target.value })
                        }
                        className={inputStyles}
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
                        rows="4"
                    />
                </div>

                <div>
                    <label className={labelStyles}>Image</label>
                    <input
                        type="file"
                        onChange={(e) => setFileObj(e.target.files[0])}
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
                    />
                </div>

                <button
                    disabled={loading}
                    className="w-full bg-blue-600 text-white p-3 rounded"
                >
                    {loading ? "Updating..." : "Update"}
                </button>

            </form>
        </div>
    );
}