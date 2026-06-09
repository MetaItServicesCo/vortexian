"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

export default function BlogGrid({ blogs }) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const blogsPerPage = 6;

  const filteredBlogs = blogs.filter((blog) =>
    blog.title.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);

  const startIndex = (currentPage - 1) * blogsPerPage;
  const currentBlogs = filteredBlogs.slice(
    startIndex,
    startIndex + blogsPerPage,
  );

  return (
    <section className="max-w-7xl mx-auto px-5 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h2 className="text-5xl font-black text-[#0b1533]">Blogs</h2>
          <div className="w-32 h-2 bg-gradient-to-r from-[#5DB4D1] to-[#6B21D4] rounded-full mt-2" />{" "}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-[320px]">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-14 pl-12 pr-4 rounded-xl border-2 border-black/80 outline-none"
          />
        </div>
      </div>

      {/* Blog Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {currentBlogs.map((blog, index) => (
          <motion.div
            key={blog.id}
            initial={{ opacity: 0, y: 140 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{
              duration: 0.8,
              delay: index * 0.1,
            }}
            whileHover={{
              y: -10,
              scale: 1.02,
            }}
          >
            <Link href={`/blog/${blog.slug}`}>
              <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300">
                {/* Image */}
                <div className="relative h-[260px] rounded-xl overflow-hidden">
                  <Image
                    src={blog.image}
                    alt={blog.title}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>

                {/* Title */}
                <h3 className="mt-6 text-[20px] font-bold text-black leading-snug line-clamp-2 min-h-[60px]">
                  {blog.title}
                </h3>

                {/* Footer */}
                <div className="flex justify-between items-center mt-8">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#2e145c] flex items-center justify-center text-white text-xs font-bold">
                      T
                    </div>

                    <span className="font-medium text-sm">TIGI HR</span>
                  </div>

                  <span className="text-gray-600 text-sm">{blog.date}</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-14">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-4 py-2 rounded-xl border bg-white disabled:opacity-40"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`w-11 h-11 rounded-xl font-semibold transition-all
                            ${
                              currentPage === index + 1
                                ? "bg-[#6B21D4] text-white shadow-lg scale-110"
                                : "bg-white border hover:border-[#6B21D4]"
                            }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-4 py-2 rounded-xl border bg-white disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
