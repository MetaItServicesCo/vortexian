"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [data, setData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ✅ Already logged in hai toh dashboard pe bhejo
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admins/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: data.email, // ✅ FastAPI OAuth2 email as username
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.detail || "Invalid credentials");
        return; // finally mein setLoading(false) hoga
      }

      localStorage.setItem("token", result.access_token);
      localStorage.setItem("admin_email", data.email);

      toast.success("Welcome Back, Admin!");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);

    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);  
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] px-4 font-sans">
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
              value={data.email}
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
              value={data.password}
              className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#5DB4D1] outline-none transition-all disabled:opacity-50"
              onChange={(e) => setData({ ...data, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1D1D7E] text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#5DB4D1] transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"
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
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-[#1D1D7E] text-[12px] hover:text-[#5DB4D1] transition-colors"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}