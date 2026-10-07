"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, FileImage } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import ImageAltField, { altError } from "@/components/admin/ImageAltField";

export default function CreateTeamProfilePanel() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fileObj, setFileObj] = useState(null);
    const [imageAlt, setImageAlt] = useState("");

    // Controlled input state tracking parameters
    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [description, setDescription] = useState("");
    const [facebook, setFacebook] = useState("");
    const [instagram, setInstagram] = useState("");
    const [linkedin, setLinkedin] = useState("");

    const handleFormSubmission = async (e) => {
        e.preventDefault();

        if (!name || !role || !description || !fileObj) {
            toast.error("Name, Role, Description and Image are required!");
            return;
        }
        const missingAlt = altError(true, imageAlt);
        if (missingAlt) {
            toast.error(missingAlt);
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();

            formData.append("full_name", name);
            formData.append("designation", role);
            formData.append("bio_description", description);

            formData.append("facebook_link", facebook);
            formData.append("instagram_link", instagram);
            formData.append("linkedin_link", linkedin);

            formData.append("image", fileObj);
            formData.append("profile_image_alt", imageAlt.trim());

            const token = localStorage.getItem("token");

            const response = await fetch(
                "/api/team/create-team",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail || "Failed to create team member"
                );
            }

            toast.success("Team member created successfully!");

            setTimeout(() => {
                router.push("/dashboard/team");
            }, 1500);

        } catch (error) {
            console.error(error);
            toast.error(error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const inputStyles = "w-full p-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1D1D7E] text-base font-semibold text-slate-800 transition-all shadow-sm";
    const labelStyles = "text-xs font-black uppercase text-slate-500 block mb-1.5 tracking-wider";

    return (
        <div className="p-6 md:p-10 min-h-screen bg-gray-50 text-slate-800 font-sans max-w-2xl mx-auto text-base">
            <Toaster position="top-center" />

            <div className="flex items-center gap-4 mb-10">
                <Link href="/dashboard/team" className="w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black transition-all shadow-sm">
                    <ArrowLeft size={18} />
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-[#1D1D7E] uppercase tracking-tight">Initialize Staff Node</h1>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-0.5">MERN Stream profile addition matrix</p>
                </div>
            </div>

            <form onSubmit={handleFormSubmission} className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-slate-100 space-y-6">
                <div>
                    <label className={labelStyles}>Full Name *</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputStyles} placeholder="Name" required />
                </div>

                <div>
                    <label className={labelStyles}>Designation Corporate Capacity *</label>
                    <input type="text" value={role} onChange={(e) => setRole(e.target.value)} className={inputStyles} placeholder="e.g. FULL STACK DEVELOPER" required />
                </div>

                {/* --- NEW ADDED DESCRIPTION FIELD NODE --- */}
                <div>
                    <label className={labelStyles}> Bio Description *</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows="4"
                        className={`${inputStyles} resize-none`}
                        placeholder="Add Description..."
                        required
                    ></textarea>
                </div>

                <div>
                    <label className={labelStyles}>Profile Representation Graphic Asset *</label>
                    <div className="border-2 border-dashed border-gray-200 hover:border-[#1D1D7E] rounded-xl p-6 transition-all bg-slate-50/50 flex flex-col items-center text-center justify-center relative">
                        <FileImage className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{fileObj ? fileObj.name : "Select binary chunk image format files"}</span>
                        <input type="file" required accept="image/png,image/jpeg,image/webp,image/gif,image/avif" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => { const f = e.target.files[0] || null; setFileObj(f); if (f) setImageAlt(name ? `Portrait of ${name}` : ""); }} />
                    </div>
                    {fileObj && (
                        <div className="mt-3">
                            <ImageAltField id="team-image-alt" value={imageAlt} onChange={setImageAlt} />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 pt-6">
                    <div>
                        <label className={labelStyles}>Facebook Link</label>
                        <input type="text" value={facebook} onChange={(e) => setFacebook(e.target.value)} className={inputStyles} placeholder="#" />
                    </div>
                    <div>
                        <label className={labelStyles}>Instagram Link</label>
                        <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} className={inputStyles} placeholder="#" />
                    </div>
                    <div>
                        <label className={labelStyles}>Linkedin Link</label>
                        <input type="text" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className={inputStyles} placeholder="#" />
                    </div>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-[#1D1D7E] text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#5DB4D1] hover:text-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs cursor-pointer shadow-md mt-4">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Provisioning Node...</> : <><Save size={16} /> Deploy Identity Frame</>}
                </button>
            </form>
        </div>
    );
}