"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, FileImage } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

export default function EditTeamProfilePanel({ params }) {
    const { id } = use(params);
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [fileObj, setFileObj] = useState(null);

    // FIXED: Added description inside the initial fields state object mapping
    const [fields, setFields] = useState({
        name: "",
        role: "",
        description: "",
        facebook: "",
        instagram: "",
        linkedin: ""
    });

    useEffect(() => {
        async function loadTargetDoc() {
            try {
                const res = await fetch("/api/team");
                if (res.ok) {
                    const list = await res.json();
                    const target = list.find((m) => m._id === id);
                    if (target) {
                        setFields({
                            name: target.name || "",
                            role: target.role || "",
                            description: target.description || "", // FIXED: Sync description data from DB node
                            facebook: target.facebook || "",
                            instagram: target.instagram || "",
                            linkedin: target.linkedin || "",
                        });
                    }
                }
            } catch (err) {
                toast.error("Internal retrieval pipeline error compiling data logs.");
            } finally {
                setFetching(false);
            }
        }
        loadTargetDoc();
    }, [id]);

    const handleUpdateSequence = async (e) => {
        e.preventDefault();

        if (!fields.name || !fields.role || !fields.description) {
            toast.error("Name, Role, and Bio Description are absolute mandatory parameters!");
            return;
        }

        setLoading(true);

        const bundle = new FormData();
        bundle.append("name", fields.name);
        bundle.append("role", fields.role);
        bundle.append("description", fields.description); // FIXED: Appended controlled state bio description
        if (fileObj) bundle.append("image", fileObj);
        bundle.append("facebook", fields.facebook);
        bundle.append("instagram", fields.instagram);
        bundle.append("linkedin", fields.linkedin);

        try {
            const response = await fetch(`/api/team/${id}`, { method: "PUT", body: bundle });
            if (response.ok) {
                toast.success("Identity configuration space mutated correctly!");
                setTimeout(() => router.push("/dashboard/team"), 1200);
            } else {
                toast.error("Failed committing data parameters updates.");
            }
        } catch (err) {
            toast.error("Mutation failure pipeline crash context.");
        } finally {
            setLoading(false);
        }
    };

    const inputStyles = "w-full p-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1D1D7E] text-base font-semibold text-slate-800 transition-all shadow-sm";
    const labelStyles = "text-xs font-black uppercase text-slate-500 block mb-1.5 tracking-wider";

    if (fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-slate-400 text-sm font-black uppercase tracking-widest">
                <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#1D1D7E]" /> Restructuring memory mapping pointers...
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 min-h-screen bg-gray-50 text-slate-800 font-sans max-w-2xl mx-auto text-base">
            <Toaster position="top-center" />

            <div className="flex items-center gap-4 mb-10">
                <Link href="/admin/team" className="w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black transition-all shadow-sm">
                    <ArrowLeft size={18} />
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-[#1D1D7E] uppercase tracking-tight">Mutate Identity Parameters</h1>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-0.5">MERN Frame structural modifier panel</p>
                </div>
            </div>

            <form onSubmit={handleUpdateSequence} className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-slate-100 space-y-6">
                <div>
                    <label className={labelStyles}>Full Identity Name *</label>
                    <input type="text" value={fields.name} onChange={(e) => setFields({ ...fields, name: e.target.value })} className={inputStyles} required />
                </div>
                <div>
                    <label className={labelStyles}>Designation Corporate Capacity *</label>
                    <input type="text" value={fields.role} onChange={(e) => setFields({ ...fields, role: e.target.value })} className={inputStyles} required />
                </div>

                {/* --- NEW ADDED INTERACTIVE TEXTAREA FIELD FOR BIO DESCRIPTION --- */}
                <div>
                    <label className={labelStyles}>Professional Statement / Bio Description *</label>
                    <textarea
                        value={fields.description}
                        onChange={(e) => setFields({ ...fields, description: e.target.value })}
                        rows="4"
                        className={`${inputStyles} resize-none`}
                        required
                    ></textarea>
                </div>

                <div>
                    <label className={labelStyles}>Optional Representation Alternate Asset Graphic</label>
                    <div className="border-2 border-dashed border-gray-200 hover:border-[#1D1D7E] rounded-xl p-6 transition-all bg-slate-50/50 flex flex-col items-center text-center justify-center relative">
                        <FileImage className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{fileObj ? fileObj.name : "Leave empty if you don't wish to override asset image files"}</span>
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFileObj(e.target.files[0])} />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 pt-6">
                    <div>
                        <label className={labelStyles}>Facebook Link</label>
                        <input type="text" value={fields.facebook} onChange={(e) => setFields({ ...fields, facebook: e.target.value })} className={inputStyles} />
                    </div>
                    <div>
                        <label className={labelStyles}>Instagram Link</label>
                        <input type="text" value={fields.instagram} onChange={(e) => setFields({ ...fields, instagram: e.target.value })} className={inputStyles} />
                    </div>
                    <div>
                        <label className={labelStyles}>Linkedin Link</label>
                        <input type="text" value={fields.linkedin} onChange={(e) => setFields({ ...fields, linkedin: e.target.value })} className={inputStyles} />
                    </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-[#1D1D7E] text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#5DB4D1] hover:text-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs cursor-pointer shadow-md mt-4">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Mutating Parameters Core...</> : <><Save size={16} /> Update Profile Properties</>}
                </button>
            </form>
        </div>
    );
}