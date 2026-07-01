"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useState } from "react";

export default function BlogGrid({ blogs }) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const blogsPerPage = 12;

  // ✅ SAFE ARRAY
  const safeBlogs = Array.isArray(blogs) ? blogs : [];

  // ✅ FILTER
  // const filteredBlogs = safeBlogs.filter((blog) =>
  //   (blog?.title || "").toLowerCase().includes(search.toLowerCase()),
  // );
  // ✅ FILTER AND SORT
  const filteredBlogs = safeBlogs
    .filter((blog) =>
      (blog?.title || "").toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      // created_at ke base par sort karein
      return new Date(b.created_at) - new Date(a.created_at);
    });
  // ✅ TOTAL PAGES
  const totalPages = Math.max(
    1,
    Math.ceil(filteredBlogs.length / blogsPerPage),
  );

  // ✅ CURRENT SLICE
  const startIndex = (currentPage - 1) * blogsPerPage;

  const currentBlogs = filteredBlogs.slice(
    startIndex,
    startIndex + blogsPerPage,
  );

  // ✅ IMAGE FIX (IMPORTANT)
  const getImageUrl = (img) => {
    if (!img) return "/placeholder.jpg";

    // already full URL
    if (img.startsWith("http")) return img;

    // backend relative path fix
    return `${img}`;
  };

  return (
    <section className="max-w-7xl mx-auto px-5 py-12">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-bold text-[#0b1533]">Blogs</h2>

          <div className="w-24 h-[6px] bg-gradient-to-r from-cyan-400 via-purple-500 to-indigo-600 rounded-full" />
        </div>
        {/* SEARCH */}
        <div className="relative w-full md:w-[320px]">
          <Search className="absolute left-3 top-3 text-gray-400" />

          <input
            className="pl-10 pr-4 py-2 border rounded-lg w-full"
            placeholder="Search blogs..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* EMPTY STATE */}
      {currentBlogs.length === 0 ? (
        <p className="text-center text-gray-500">No blogs found</p>
      ) : (
        /* GRID */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentBlogs.map((blog, index) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={`/blog/${blog.id}`}
                className="block rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition"
              >
                <div className="bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden">
                  {/* IMAGE */}
                  <div className="relative h-56 w-full">
                    <img
                      src={getImageUrl(blog.featured_image)}
                      alt={blog.title}
                      className="w-full h-56 object-cover"
                    />
                  </div>

                  {/* CONTENT */}
                  <div className="p-5">
                    {/* TITLE */}
                    <h3 className="text-lg font-bold mb-2 line-clamp-2">
                      {blog.title}
                    </h3>

                    {/* EXCERPT */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {blog.excerpt}
                    </p>

                    {/* FOOTER */}
                    <div className="flex justify-between text-xs text-gray-500">
                      {/* AUTHOR */}
                      <span>👤 {blog.author || "Admin"}</span>

                      {/* DATE */}
                      <span>
                        📅{" "}
                        {blog.created_at
                          ? new Date(blog.created_at).toLocaleDateString()
                          : "No date"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === i + 1 ? "bg-black text-white" : ""
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
