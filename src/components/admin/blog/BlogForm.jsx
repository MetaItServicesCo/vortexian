"use client";

// Shared by "Create Blog" and "Edit Blog" so the editor looks and behaves the
// same before and after a post is published.
import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import ImageAltField, { altError } from "@/components/admin/ImageAltField";
import { adminFetch } from "@/lib/adminApi";
import SchemaMarkupField, { schemaJsonError } from "@/components/admin/SchemaMarkupField";
import { mediaUrl } from "@/lib/api";
import { richTextAltError } from "@/lib/richText";
import { slugify, slugifyTyping } from "@/lib/slugify";

const RichTextEditor = dynamic(() => import("@/components/editor/RichTextEditor"), { ssr: false });

const LIMITS = { title: 200, slug: 220, category: 100, author: 100, meta_title: 60, meta_description: 160 };
const MAX_IMAGE_MB = 10;

const inputClass = "w-full border rounded p-3";
const labelClass = "block mb-2 font-medium";

function Counter({ value, limit }) {
    const length = (value || "").length;
    return (
        <span className={`text-xs ${length > limit ? "text-red-600 font-semibold" : "text-gray-400"}`}>
            {length}/{limit}
        </span>
    );
}

export default function BlogForm({ initial }) {
    const router = useRouter();
    const isEdit = Boolean(initial?.id);

    const [form, setForm] = useState({
        title: initial?.title || "",
        slug: initial?.slug || "",
        category: initial?.category || "",
        author: initial?.author || "",
        excerpt: initial?.excerpt || "",
        meta_title: initial?.meta_title || "",
        meta_description: initial?.meta_description || "",
        content: initial?.content || "",
        image_alt: initial?.featured_image_alt || "",
        schema_json: initial?.schema_json || "",
    });
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(initial?.featured_image ? mediaUrl(initial.featured_image) : "");
    // New posts follow the title; published posts keep their URL unless edited on purpose
    const [slugTouched, setSlugTouched] = useState(isEdit);
    const [saving, setSaving] = useState(false);

    const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

    const handleTitle = (value) => {
        setForm((prev) => ({ ...prev, title: value, slug: slugTouched ? prev.slug : slugify(value) }));
    };

    const handleImage = (file) => {
        if (!file) return;
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
        set("image_alt", ""); // a new picture needs its own description
    };

    const validate = () => {
        const required = { title: "Title", category: "Category", author: "Author", excerpt: "Excerpt", meta_title: "Meta title", meta_description: "Meta description" };
        const missing = Object.entries(required).filter(([key]) => !form[key].trim()).map(([, label]) => label);
        if (missing.length) return `Please fill in: ${missing.join(", ")}.`;
        if (!slugify(form.slug || form.title)) return "Please enter a URL slug.";
        if (!form.content.trim()) return "Please write the blog content.";
        for (const [key, limit] of Object.entries(LIMITS)) {
            if ((form[key] || "").length > limit) return `${key.replace("_", " ")} is too long (max ${limit} characters).`;
        }
        if (imageFile && imageFile.size > MAX_IMAGE_MB * 1024 * 1024) return `The image is too large (max ${MAX_IMAGE_MB} MB).`;
        const schemaProblem = schemaJsonError(form.schema_json);
        if (schemaProblem) return `Schema markup is not valid JSON: ${schemaProblem}`;
        return altError(Boolean(preview), form.image_alt) || richTextAltError(form.content);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const problem = validate();
        if (problem) {
            toast.error(problem, { duration: 6000 });
            return;
        }

        setSaving(true);
        const fields = {
            title: form.title.trim(),
            slug: slugify(form.slug) || slugify(form.title),
            category: form.category.trim(),
            author: form.author.trim(),
            excerpt: form.excerpt.trim(),
            meta_title: form.meta_title.trim(),
            meta_description: form.meta_description.trim(),
            content: form.content,
            schema_json: form.schema_json.trim(),
        };

        try {
            if (!isEdit) {
                const data = new FormData();
                Object.entries(fields).forEach(([key, value]) => data.append(key, value));
                if (imageFile) {
                    data.append("image", imageFile);
                    data.append("featured_image_alt", form.image_alt.trim());
                }
                await adminFetch("/api/blog/create", { method: "POST", body: data });
                toast.success("Blog published");
            } else {
                await adminFetch(`/api/blog/update/${initial.id}`, {
                    method: "PATCH",
                    body: { ...fields, ...(preview && !imageFile ? { featured_image_alt: form.image_alt.trim() } : {}) },
                });
                if (imageFile) {
                    const data = new FormData();
                    data.append("image", imageFile);
                    data.append("featured_image_alt", form.image_alt.trim());
                    await adminFetch(`/api/blog/update-image/${initial.id}`, { method: "POST", body: data });
                }
                toast.success("Changes saved");
            }
            setTimeout(() => router.push("/dashboard/blog"), 800);
        } catch (err) {
            toast.error(err.message === "Failed to fetch" ? "Could not reach the server. Please try again." : err.message, { duration: 6000 });
        } finally {
            setSaving(false);
        }
    };

    const slugChanged = isEdit && initial.slug && slugify(form.slug) !== initial.slug;

    return (
        <div className="max-w-6xl mx-auto p-8">
            <Toaster position="top-center" />
            <div className="flex items-center justify-between gap-4 mb-8">
                <h1 className="text-3xl font-bold">{isEdit ? "Edit Blog" : "Create Blog"}</h1>
                {isEdit && initial.slug && (
                    <a href={`/blog/${initial.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-semibold text-[#1D1D7E] hover:underline">
                        View post <ExternalLink size={14} />
                    </a>
                )}
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6" noValidate>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="blog-title" className={labelClass}>Title *</label>
                        <input id="blog-title" className={inputClass} value={form.title} maxLength={LIMITS.title} onChange={(e) => handleTitle(e.target.value)} />
                    </div>

                    <div>
                        <label htmlFor="blog-slug" className={labelClass}>Slug (URL) *</label>
                        <div className="flex items-center border rounded focus-within:ring-2 focus-within:ring-[#1D1D7E]/30">
                            <span className="pl-3 text-gray-400 select-none">/blog/</span>
                            <input
                                id="blog-slug"
                                className="flex-1 p-3 outline-none rounded"
                                value={form.slug}
                                maxLength={LIMITS.slug}
                                placeholder="my-blog-post"
                                onChange={(e) => { setSlugTouched(true); set("slug", slugifyTyping(e.target.value)); }}
                            />
                        </div>
                        <p className={`text-xs mt-1 ${slugChanged ? "text-amber-600 font-semibold" : "text-gray-400"}`}>
                            {slugChanged
                                ? `Changing the URL of a published post breaks links to /blog/${initial.slug}.`
                                : isEdit ? "The post's web address." : "Filled in from the title; you can edit it."}
                        </p>
                    </div>

                    <div>
                        <label htmlFor="blog-category" className={labelClass}>Category *</label>
                        <input id="blog-category" className={inputClass} value={form.category} maxLength={LIMITS.category} onChange={(e) => set("category", e.target.value)} />
                    </div>

                    <div>
                        <label htmlFor="blog-author" className={labelClass}>Author *</label>
                        <input id="blog-author" className={inputClass} value={form.author} maxLength={LIMITS.author} onChange={(e) => set("author", e.target.value)} />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 items-start">
                    <div>
                        <label htmlFor="blog-image" className={labelClass}>Featured Image</label>
                        <input
                            id="blog-image"
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                            className="border rounded w-full p-2"
                            onChange={(e) => handleImage(e.target.files?.[0] || null)}
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            {preview && isEdit && !imageFile ? "Choose a file to replace the current image. " : ""}JPG, PNG or WEBP, up to {MAX_IMAGE_MB} MB.
                        </p>
                        {preview && (
                            // eslint-disable-next-line @next/next/no-img-element -- admin preview
                            <img src={preview} alt={form.image_alt || "Featured image preview"} className="mt-3 w-48 h-32 object-cover rounded border" />
                        )}
                    </div>
                    {preview && (
                        <ImageAltField id="blog-image-alt" value={form.image_alt} onChange={(value) => set("image_alt", value)} />
                    )}
                </div>

                <div>
                    <label htmlFor="blog-excerpt" className={labelClass}>Excerpt *</label>
                    <textarea id="blog-excerpt" className="w-full border rounded p-3 h-28" value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
                </div>

                <div>
                    <label htmlFor="blog-meta-title" className={`${labelClass} flex justify-between`}>
                        <span>Meta Title *</span> <Counter value={form.meta_title} limit={LIMITS.meta_title} />
                    </label>
                    <input id="blog-meta-title" className={inputClass} value={form.meta_title} onChange={(e) => set("meta_title", e.target.value)} />
                </div>

                <div>
                    <label htmlFor="blog-meta-description" className={`${labelClass} flex justify-between`}>
                        <span>Meta Description *</span> <Counter value={form.meta_description} limit={LIMITS.meta_description} />
                    </label>
                    <textarea id="blog-meta-description" className="w-full border rounded p-3 h-24" value={form.meta_description} onChange={(e) => set("meta_description", e.target.value)} />
                </div>

                <div>
                    <label className={labelClass}>Content *</label>
                    <RichTextEditor value={form.content} onChange={(value) => set("content", value)} minHeight={400} />
                </div>

                <SchemaMarkupField kind="blog" id="blog-schema-json" value={form.schema_json} onChange={(value) => set("schema_json", value)} />

                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded font-semibold disabled:opacity-60"
                    >
                        {saving ? "Saving..." : isEdit ? "Save Changes" : "Publish Blog"}
                    </button>
                    <Link href="/dashboard/blog" className="px-6 py-3 border rounded font-semibold text-gray-600 hover:bg-gray-50">
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
