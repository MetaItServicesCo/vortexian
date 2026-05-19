"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, CheckSquare } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

export default function EditQuotePage({ params }) {
    const { id } = use(params); // Unwrapping dynamic parameter safely
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const availableServices = [
        "Digital Marketing",
        "Web Development",
        "App Development",
        "UI/UX Design",
        "Cloud Solutions",
        "Lead Generation"
    ];

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        contactPref: "Email",
        services: [],
        url: "",
        completionDate: "",
        message: "",
        status: "New"
    });

    // --- FETCH EXISTING DATA ON INITIAL NODE LOAD ---
    useEffect(() => {
        async function getLeadDetails() {
            try {
                // Quotes logic updates target path endpoint calling 
                const res = await fetch(`/api/quotes`);
                if (!res.ok) throw new Error("Connection failed");

                const allQuotes = await res.json();
                const matchedQuote = allQuotes.find(q => q._id === id);

                if (!matchedQuote) {
                    toast.error("Lead entity reference mismatch.");
                    router.push("/admin/quotes");
                    return;
                }

                setFormData({
                    firstName: matchedQuote.firstName || "",
                    lastName: matchedQuote.lastName || "",
                    phone: matchedQuote.phone || "",
                    email: matchedQuote.email || "",
                    contactPref: matchedQuote.contactPref || "Email",
                    services: matchedQuote.services || [],
                    url: matchedQuote.url || "",
                    completionDate: matchedQuote.completionDate || "",
                    message: matchedQuote.message || "",
                    status: matchedQuote.status || "New"
                });
            } catch (err) {
                toast.error("Pipeline failure fetching dynamic arrays document.");
            } finally {
                setFetching(false);
            }
        }
        getLeadDetails();
    }, [id, router]);

    const toggleServiceSelector = (service) => {
        if (formData.services.includes(service)) {
            setFormData(prev => ({ ...prev, services: prev.services.filter(s => s !== service) }));
        } else {
            setFormData(prev => ({ ...prev, services: [...prev.services, service] }));
        }
    };

    // --- SAVE MUTATION PIPELINE OPERATION ---
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Hamari API standard dynamic PUT requirements structure parameter use krti hai status processing loop ke liye
            const res = await fetch(`/api/quotes/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: formData.status }) // Directly updates pipeline operational context statuses values
            });

            if (res.ok) {
                toast.success("Lead lifecycle configuration re-deployed successfully!");
                setTimeout(() => router.push("/admin/quotes"), 1500);
            } else {
                toast.error("Failed committing stream updates.");
            }
        } catch (err) {
            toast.error("Pipeline execution context error.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-slate-400 text-sm font-black uppercase tracking-widest">
                <Loader2 className="w-6 h-6 animate-spin text-[#1D1D7E] mb-1 mr-2" />
                Processing matching data structures streams...
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 min-h-screen bg-gray-50 text-slate-800 font-sans max-w-4xl mx-auto text-base">
            <Toaster position="top-center" />

            {/* --- PAGE EXECUTIVE HEADER PANEL --- */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/quotes" className="w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black transition-all shadow-sm">
                    <ArrowLeft size={18} />
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-[#1D1D7E] uppercase tracking-tight">Review Inbound Prospect</h1>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-0.5">Lead pipeline parameters module</p>
                </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
                {/* --- SECTION 1: PROSPECT LIFE CYCLE OPERATIONS --- */}
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-4">
                    <h2 className="text-sm font-black text-[#1D1D7E] uppercase tracking-widest border-b border-blue-100 pb-2">Pipeline Status Controls</h2>
                    <div>
                        <label className="text-xs font-black uppercase text-slate-500 block mb-1.5">Lead Progress Phase State</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-base font-bold outline-none focus:ring-2 focus:ring-[#1D1D7E] cursor-pointer"
                        >
                            <option value="New">New Lead Input</option>
                            <option value="In Review">In Review Matrix</option>
                            <option value="Contacted">Contacted Operations Loop</option>
                            <option value="Closed">Closed Deal Node</option>
                        </select>
                    </div>
                </div>

                {/* --- SECTION 2: READ ONLY DATA METRICS SHOWCASE --- */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-slate-100 space-y-5">
                    <h2 className="text-sm font-black text-[#1D1D7E] uppercase tracking-widest border-b border-gray-100 pb-2">Client Submitted Inbound Parameters</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="text-xs font-black uppercase text-gray-400 block mb-1">First Name</label>
                            <div className="w-full p-3.5 bg-gray-100 border border-gray-200/50 rounded-xl text-base font-semibold text-slate-500">{formData.firstName}</div>
                        </div>
                        <div>
                            <label className="text-xs font-black uppercase text-gray-400 block mb-1">Last Name</label>
                            <div className="w-full p-3.5 bg-gray-100 border border-gray-200/50 rounded-xl text-base font-semibold text-slate-500">{formData.lastName}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="text-xs font-black uppercase text-gray-400 block mb-1">Inbound Phone Endpoint</label>
                            <div className="w-full p-3.5 bg-gray-100 border border-gray-200/50 rounded-xl text-base font-semibold text-slate-500">{formData.phone}</div>
                        </div>
                        <div>
                            <label className="text-xs font-black uppercase text-gray-400 block mb-1">Inbound Verification Email</label>
                            <div className="w-full p-3.5 bg-gray-100 border border-gray-200/50 rounded-xl text-base font-semibold text-slate-500">{formData.email}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="text-xs font-black uppercase text-gray-400 block mb-1">Preferred Channel Contact Path</label>
                            <div className="w-full p-3.5 bg-gray-100 border border-gray-200/50 rounded-xl text-base font-semibold text-slate-500 capitalize">{formData.contactPref}</div>
                        </div>
                        <div>
                            <label className="text-xs font-black uppercase text-gray-400 block mb-1">Target Project Deadline/Timeframe</label>
                            <div className="w-full p-3.5 bg-gray-100 border border-gray-200/50 rounded-xl text-base font-semibold text-slate-500">{formData.completionDate}</div>
                        </div>
                    </div>

                    {formData.url && (
                        <div>
                            <label className="text-xs font-black uppercase text-gray-400 block mb-1">Target Client Corporate Website URL</label>
                            <div className="w-full p-3.5 bg-gray-100 border border-gray-200/50 rounded-xl text-base font-semibold text-slate-500">{formData.url}</div>
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-black uppercase text-gray-400 block mb-1">Project Specification Statement Description</label>
                        <div className="w-full p-4 bg-gray-100 border border-gray-200/50 rounded-xl text-base font-semibold text-slate-500 whitespace-pre-wrap leading-relaxed">{formData.message}</div>
                    </div>
                </div>

                {/* --- SECTION 3: REQUESTED SERVICES METRIC CHIPS --- */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-slate-100 space-y-4">
                    <h2 className="text-sm font-black text-[#1D1D7E] uppercase tracking-widest border-b border-gray-100 pb-2">Target Inbound Node Selection Metrics</h2>
                    <div className="flex flex-wrap gap-2.5">
                        {availableServices.map((serviceName) => {
                            const isSelectedNode = formData.services.includes(serviceName);
                            return (
                                <div
                                    key={serviceName}
                                    className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all flex items-center gap-2 ${isSelectedNode
                                        ? "bg-blue-50 text-[#1D1D7E] border-blue-200 shadow-sm font-black"
                                        : "bg-gray-50 text-gray-400 border-gray-200/60"
                                        }`}
                                >
                                    <CheckSquare size={14} className={isSelectedNode ? "text-[#1D1D7E]" : "text-gray-300"} />
                                    {serviceName}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* --- DYNAMIC ACTION CONTROLLER --- */}
                <button type="submit" disabled={loading} className="w-full bg-[#1D1D7E] text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#5DB4D1] hover:text-black transition-all shadow-xl shadow-blue-900/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm">
                    {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Modulating Status Parameters...</> : <><Save size={18} /> Commit Status Modifications</>}
                </button>
            </form>
        </div>
    );
}