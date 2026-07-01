"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    adminSecret: "",
  });

  const [showPass, setShowPass] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        "/api/admins/register-admin",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: data.name,             
            email: data.email,
            password: data.password,
            admin_secret_key: data.adminSecret, 
          }),
        }
      );
      const result = await res.json();
      if (res.ok) {
        toast.success("Admin account created successfully!");
        setTimeout(() => router.push("/login"), 1500);
      } else {
        toast.error(result.detail || "Registration failed."); 
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] px-4 font-sans">
      <Toaster position="top-center" />

      <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-2xl border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-[#1D1D7E] uppercase tracking-tighter">
            Create Account
          </h2>
          <p className="text-gray-400 text-[10px] font-bold mt-2 uppercase tracking-[0.2em]">
            Register as Admin
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">
              Full Name
            </label>
            <input
              type="text"
              required
              className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#5DB4D1] outline-none transition-all"
              onChange={(e) => setData({ ...data, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">
              Email Address
            </label>
            <input
              type="email"
              required
              className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#5DB4D1] outline-none transition-all"
              onChange={(e) => setData({ ...data, email: e.target.value })}
            />
          </div>

          {/* Password Field with Toggle */}
          <div className="relative">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                required
                className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#5DB4D1] outline-none transition-all"
                onChange={(e) => setData({ ...data, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1D1D7E] transition-colors"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Admin Secret Field with Toggle */}
          <div className="relative">
            <label className="text-[10px] font-black uppercase text-red-400 ml-1">
              Admin Secret Key
            </label>
            <div className="relative">
              <input
                type={showSecret ? "text" : "password"}
                required
                placeholder="Enter master secret"
                className="w-full p-4 bg-red-50/30 border border-red-100 rounded-xl focus:ring-2 focus:ring-red-200 outline-none transition-all"
                onChange={(e) =>
                  setData({ ...data, adminSecret: e.target.value })
                }
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-red-300 hover:text-red-500 transition-colors"
              >
                {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-[#1D1D7E] text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#5DB4D1] transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Creating...
              </>
            ) : (
              "Register Now"
            )}
          </button>
        </form>

        <p className="text-center text-[11px] text-gray-400 mt-6 font-bold uppercase tracking-wider">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-[#1D1D7E] hover:text-[#5DB4D1] transition-colors"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
