"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  Quote,
  Star,
  Search,
  ArrowUpDown,
  Building2,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export default function TestimonialsListPage() {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("newest"); // newest | rating_high | rating_low | name

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    fetchTestimonials();
  }, []);

  async function fetchTestimonials() {
    try {
      const res = await fetch(`${API_BASE}/api/testimonial/admin`, {
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
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/testimonial/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
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
        size={13}
        className={
          i < rating ? "fill-amber-400 text-amber-400" : "text-gray-200"
        }
      />
    ));
  }

  function getInitials(name) {
    return (name || "?")
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

  // ---------------- FILTER + SORT ----------------
  const visibleTestimonials = useMemo(() => {
    let list = [...testimonials];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          (t.full_name || "").toLowerCase().includes(q) ||
          (t.company || "").toLowerCase().includes(q) ||
          (t.designation || "").toLowerCase().includes(q) ||
          (t.testimonial_text || "").toLowerCase().includes(q),
      );
    }

    switch (sortKey) {
      case "rating_high":
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "rating_low":
        list.sort((a, b) => (a.rating || 0) - (b.rating || 0));
        break;
      case "name":
        list.sort((a, b) =>
          (a.full_name || "").localeCompare(b.full_name || ""),
        );
        break;
      default:
        list.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    return list;
  }, [testimonials, search, sortKey]);

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#1D1D7E]" size={28} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Testimonials</h1>
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
          <p className="text-2xl font-bold text-gray-900">{avgRating}</p>
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

      {/* TOOLBAR: SEARCH + SORT */}
      {testimonials.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, company, or review..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1D1D7E]/20 focus:border-[#1D1D7E] transition-all"
            />
          </div>

          <div className="relative">
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="appearance-none pl-4 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1D1D7E]/20 focus:border-[#1D1D7E] cursor-pointer"
            >
              <option value="newest">Newest first</option>
              <option value="rating_high">Rating: High to low</option>
              <option value="rating_low">Rating: Low to high</option>
              <option value="name">Name A–Z</option>
            </select>
            <ArrowUpDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
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
      ) : visibleTestimonials.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <Search size={28} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-400">
            No results for "{search}"
          </p>
        </div>
      ) : (
        /* ==================== TABLE ==================== */
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Customer
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Company
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 w-[38%]">
                    Review
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Rating
                  </th>
                  <th className="text-right px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleTestimonials.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors group"
                  >
                    {/* CUSTOMER */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="shrink-0">
                          {t.profile_image ? (
                            <div
                              className="w-10 h-10 overflow-hidden"
                              style={{
                                clipPath:
                                  "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                              }}
                            >
                              <img
                                src={`${API_BASE}${t.profile_image}`}
                                alt={t.full_name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              className="w-10 h-10 bg-[#1D1D7E]/10 flex items-center justify-center"
                              style={{
                                clipPath:
                                  "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                              }}
                            >
                              <span className="text-[#1D1D7E] text-[11px] font-bold">
                                {getInitials(t.full_name)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {t.full_name}
                          </p>
                          <p className="text-xs text-[#5DB4D1] uppercase tracking-wide font-semibold truncate">
                            {t.designation || "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* COMPANY */}
                    <td className="px-5 py-4">
                      {t.company ? (
                        <span className="inline-flex items-center gap-1.5 text-gray-600">
                          <Building2 size={13} className="text-gray-400" />
                          {t.company}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>

                    {/* REVIEW */}
                    <td className="px-5 py-4">
                      <p className="text-gray-500 italic line-clamp-2 leading-relaxed">
                        "{t.testimonial_text}"
                      </p>
                    </td>

                    {/* RATING */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-0.5">
                        {renderStars(t.rating || 5)}
                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                        <Link href={`/dashboard/testimonials/edit/${t.id}`}>
                          <button className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1D1D7E] hover:border-[#1D1D7E] transition-colors">
                            <Edit size={14} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-300 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/40">
            <p className="text-xs text-gray-400">
              Showing {visibleTestimonials.length} of {testimonials.length}{" "}
              testimonial{testimonials.length !== 1 && "s"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}