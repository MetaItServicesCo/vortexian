"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { Loader2 } from "lucide-react"; // Spinner icon ke liye

export default function LoginPage() {
    const [data, setData] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await signIn("credentials", {
                ...data,
                redirect: false,
            });

            if (res?.error) {
                // Agar admin nahi hai ya credentials galat hain
                toast.error(res.error || "Invalid Access Denied!");
                setLoading(false);
            } else if (res?.ok) {
                toast.success("Welcome Back, Admin!");
                // Thora delay taake user toast dekh sake
                setTimeout(() => {
                    router.push("/dashboard");
                }, 1000);
            }
        } catch (err) {
            toast.error("Something went wrong. Try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] px-4 font-sans">
            {/* Toast Container */}
            <Toaster position="top-center" reverseOrder={false} />

            <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-2xl border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-[#1D1D7E] uppercase tracking-tighter">
                        Vortexian Admin
                    </h2>
                    <p className="text-gray-400 text-[12px] font-bold mt-2 uppercase tracking-[0.2em]">
                        Sign in to manage your site
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="text-[14px] font-black uppercase text-gray-400 ml-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            disabled={loading}
                            className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#5DB4D1] outline-none transition-all disabled:opacity-50"
                            onChange={(e) => setData({ ...data, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-[14px] font-black uppercase text-gray-400 ml-1">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            disabled={loading}
                            className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#5DB4D1] outline-none transition-all disabled:opacity-50"
                            onChange={(e) => setData({ ...data, password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#1D1D7E] text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#5DB4D1] transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            "Login Now"
                        )}
                    </button>
                </form>
                <p className="text-center text-[12px] text-gray-400 mt-6 font-bold uppercase tracking-wider">
                    Dont have an account?{" "}
                    <a href="/register" className="text-[#1D1D7E] text-[12px] hover:text-[#5DB4D1] transition-colors">Register</a>
                </p>
            </div>
        </div>
    );
}