"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, FileImage, Globe } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import dynamic from "next/dynamic";

// Quill styles import
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function CreatePortfolioAssetForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fileObj, setFileObj] = useState(null);
  const quillRef = useRef(null);
const API_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000"
  const [form, setForm] = useState({
    project_title: "",
    slug: "",
    category_node: "Web Development",
    deployment_year: new Date().getFullYear().toString(),
    business_challenge: "",
    solution_node: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
  });

  // Custom Image Handler for Alt Tags
  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = () => {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const altText = prompt("Enter Alt Text for this image:");
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, "image", reader.result);

        setTimeout(() => {
          const images = document.querySelectorAll(".ql-editor img");
          const img = images[images.length - 1];
          if (altText) img.setAttribute("alt", altText);
        }, 0);
      };
      reader.readAsDataURL(file);
    };
  }, []);

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline", "link"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["image"],
        ["clean"],
      ],
      handlers: { image: imageHandler },
    },
  };

  const dispatchSubmission = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (
      !form.project_title ||
      !form.slug ||
      !form.business_challenge ||
      !form.solution_node ||
      !fileObj
    ) {
      toast.error("Please deploy all baseline mandatory metrics!");
      return;
    }

    setLoading(true);
    const bundle = new FormData();
    Object.keys(form).forEach((key) => bundle.append(key, form[key]));
    bundle.append("image_file", fileObj);

    try {
      const res = await fetch( `${API_URL}/api/portfolio/create`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: bundle,
      });
      if (res.ok) {
        toast.success("Case study compiled natively!");
        setTimeout(() => router.push("/dashboard/portfolio"), 1200);
      } else {
        toast.error("Transaction deployment error.");
      }
    } catch {
      toast.error("API proxy cluster loss.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyles =
    "w-full p-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1D1D7E] text-sm font-semibold text-slate-800 transition-all shadow-sm";
  const labelStyles =
    "text-[10px] font-black uppercase text-slate-400 block mb-1.5 tracking-wider";

  return (
    <div className="p-6 md:p-10 min-h-screen bg-slate-50/40 text-slate-800 max-w-3xl mx-auto">
      <Toaster />

      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-slate-50/80 backdrop-blur-md py-4 mb-6 flex items-center gap-4 border-b border-gray-200">
        <Link
          href="/dashboard/portfolio"
          className="w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black transition-all shadow-sm"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[#1D1D7E] uppercase tracking-tight">
            Instantiate Project Node
          </h1>
        </div>
      </div>

      <form
        onSubmit={dispatchSubmission}
        className="bg-white p-6 md:p-10 rounded-[2rem] border border-gray-100 shadow-xl space-y-6"
      >
        {/* Title & Category */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className={labelStyles}>Project Title *</label>
            <input
              type="text"
              className={inputStyles}
              placeholder="e.g. Quantum Analytics Suite"
              required
              onChange={(e) =>
                setForm({ ...form, project_title: e.target.value })
              }
            />
          </div>
          <div>
            {/* <label className={labelStyles}>Category Node *</label>
                        <select className={inputStyles} onChange={e => setForm({ ...form, category_node: e.target.value })}>
                            <option value="Web Development">Web Development</option>
                            <option value="Graphic Design">Graphic Design</option>
                            <option value="UI/UX Design">UI/UX Design</option>
                            <option value="App Development">App Development</option>
                        </select> */}
            <label className={labelStyles}>Category Node *</label>
            <select
              className={inputStyles}
              value={
                [
                  "Web Development",
                  "Graphic Design",
                  "UI/UX Design",
                  "App Development",
                ].includes(form.category_node)
                  ? form.category_node
                  : "Other"
              }
              onChange={(e) => {
                if (e.target.value === "Other") {
                  setForm({ ...form, category_node: "" });
                } else {
                  setForm({ ...form, category_node: e.target.value });
                }
              }}
            >
              <option value="Web Development">Web Development</option>
              <option value="Graphic Design">Graphic Design</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="App Development">App Development</option>
              <option value="Other">Other (Add Manually)</option>
            </select>

            {![
              "Web Development",
              "Graphic Design",
              "UI/UX Design",
              "App Development",
            ].includes(form.category_node) && (
              <input
                type="text"
                className={`${inputStyles} mt-2`}
                placeholder="Enter custom category"
                value={form.category_node}
                onChange={(e) =>
                  setForm({ ...form, category_node: e.target.value })
                }
                autoFocus
              />
            )}
          </div>
        </div>

        {/* Slug, Year & Image */}
        <div>
          <label className={labelStyles}>URL Slug *</label>
          <input
            type="text"
            value={form.slug}
            className={inputStyles}
            placeholder="e.g. quantum-analytics-suite"
            required
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <label className={labelStyles}>Deployment Year *</label>
            <input
              type="number"
              value={form.deployment_year}
              className={inputStyles}
              required
              onChange={(e) =>
                setForm({ ...form, deployment_year: e.target.value })
              }
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelStyles}>
              Primary Representation Graphic *
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-3.5 bg-slate-50 relative flex items-center gap-4">
              <FileImage className="text-gray-400" size={24} />
              <span className="text-xs font-bold uppercase text-gray-400 truncate">
                {fileObj ? fileObj.name : "Upload file"}
              </span>
              <input
                type="file"
                required
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => setFileObj(e.target.files[0])}
              />
            </div>
          </div>
        </div>

        {/* Rich Editors */}
        <div>
          <label className={labelStyles}>
            The Business Challenge Statement *
          </label>
          <ReactQuill
            ref={quillRef}
            theme="snow"
            modules={modules}
            value={form.business_challenge}
            onChange={(val) => setForm({ ...form, business_challenge: val })}
            className="h-48 mb-12"
          />
        </div>

        <div>
          <label className={labelStyles}>
            Vortexian Strategic Solution Node *
          </label>
          <ReactQuill
            theme="snow"
            modules={modules}
            value={form.solution_node}
            onChange={(val) => setForm({ ...form, solution_node: val })}
            className="h-48 mb-12"
          />
        </div>

        {/* SEO Section */}
        <div className="border-t pt-6 space-y-6">
          <div className="flex items-center gap-2 text-[#1D1D7E] font-black text-xs uppercase tracking-widest">
            <Globe size={16} /> SEO Fields
          </div>
          <div>
            <label className={labelStyles}>Meta Title</label>
            <input
              type="text"
              className={inputStyles}
              onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelStyles}>Meta Description</label>
              <textarea
                rows="3"
                className={inputStyles}
                onChange={(e) =>
                  setForm({ ...form, meta_description: e.target.value })
                }
              ></textarea>
            </div>
            <div>
              <label className={labelStyles}>Meta Keywords</label>
              <textarea
                rows="3"
                className={inputStyles}
                onChange={(e) =>
                  setForm({ ...form, meta_keywords: e.target.value })
                }
              ></textarea>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1D1D7E] text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-neutral-900 transition-all flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Save size={16} />}{" "}
          Deploy Portfolio Unit
        </button>
      </form>

      <style jsx global>{`
        .ql-editor a {
          color: blue !important;
          font-weight: bold !important;
          text-decoration: underline !important;
        }
        .ql-toolbar {
          border-radius: 8px 8px 0 0 !important;
        }
        .ql-container {
          border-radius: 0 0 8px 8px !important;
        }
      `}</style>
    </div>
  );
}
