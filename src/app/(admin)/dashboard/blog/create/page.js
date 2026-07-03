"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import "react-quill-new/dist/quill.snow.css";
import { useRouter } from "next/navigation";

const ReactQuill = dynamic(
    () => import("react-quill-new"),
    { ssr: false }
);

export default function AddBlog() {
    const [loading, setLoading] = useState(false);
    const quillRef = useRef(null);

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        excerpt: "",
        category: "",
        author: "",
        meta_title: "",
        meta_description: "",
        content: "",
        image: null,
    });

    // ---------------- SCHEMA MARKUP STATE ----------------
    const [schemaType, setSchemaType] = useState("none"); // none | faq | howto | event

    const [faqItems, setFaqItems] = useState([
        { question: "", answer: "" },
    ]);

    const [howToData, setHowToData] = useState({
        name: "",
        description: "",
        totalTime: "", // e.g. PT30M (ISO 8601 duration)
        steps: [{ name: "", text: "" }],
    });

    const [eventData, setEventData] = useState({
        name: "",
        startDate: "",
        endDate: "",
        locationName: "",
        locationAddress: "",
        description: "",
        eventStatus: "EventScheduled",
        isOnline: false,
    });

    const router = useRouter();

    // ---------------- FAQ HANDLERS ----------------
    const addFaqItem = () => {
        setFaqItems([...faqItems, { question: "", answer: "" }]);
    };

    const removeFaqItem = (index) => {
        setFaqItems(faqItems.filter((_, i) => i !== index));
    };

    const updateFaqItem = (index, field, value) => {
        const updated = [...faqItems];
        updated[index][field] = value;
        setFaqItems(updated);
    };

    // ---------------- HOWTO HANDLERS ----------------
    const addHowToStep = () => {
        setHowToData({
            ...howToData,
            steps: [...howToData.steps, { name: "", text: "" }],
        });
    };

    const removeHowToStep = (index) => {
        setHowToData({
            ...howToData,
            steps: howToData.steps.filter((_, i) => i !== index),
        });
    };

    const updateHowToStep = (index, field, value) => {
        const updated = [...howToData.steps];
        updated[index][field] = value;
        setHowToData({ ...howToData, steps: updated });
    };

    // ---------------- SCHEMA JSON-LD BUILDER ----------------
    const buildSchemaMarkup = () => {
        if (schemaType === "faq") {
            const validItems = faqItems.filter(
                (item) => item.question.trim() && item.answer.trim()
            );

            if (validItems.length === 0) return null;

            return {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: validItems.map((item) => ({
                    "@type": "Question",
                    name: item.question,
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: item.answer,
                    },
                })),
            };
        }

        if (schemaType === "howto") {
            const validSteps = howToData.steps.filter(
                (step) => step.name.trim() && step.text.trim()
            );

            if (!howToData.name.trim() || validSteps.length === 0) return null;

            return {
                "@context": "https://schema.org",
                "@type": "HowTo",
                name: howToData.name,
                description: howToData.description,
                ...(howToData.totalTime && { totalTime: howToData.totalTime }),
                step: validSteps.map((step) => ({
                    "@type": "HowToStep",
                    name: step.name,
                    text: step.text,
                })),
            };
        }

        if (schemaType === "event") {
            if (!eventData.name.trim() || !eventData.startDate) return null;

            return {
                "@context": "https://schema.org",
                "@type": "Event",
                name: eventData.name,
                startDate: eventData.startDate,
                ...(eventData.endDate && { endDate: eventData.endDate }),
                eventAttendanceMode: eventData.isOnline
                    ? "https://schema.org/OnlineEventAttendanceMode"
                    : "https://schema.org/OfflineEventAttendanceMode",
                eventStatus: `https://schema.org/${eventData.eventStatus}`,
                description: eventData.description,
                location: eventData.isOnline
                    ? {
                        "@type": "VirtualLocation",
                        url: "",
                    }
                    : {
                        "@type": "Place",
                        name: eventData.locationName,
                        address: eventData.locationAddress,
                    },
            };
        }

        return null;
    };

    // ---------------- IMAGE HANDLER (EDITOR) ----------------
    const imageHandler = useCallback(() => {
        const editor = quillRef.current?.getEditor();
        if (!editor) return;

        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.click();

        input.onchange = () => {
            const file = input.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = () => {
                const range = editor.getSelection(true);
                const altText =
                    window.prompt("Image k liye ALT text likhein (SEO k liye zaroori hai):", "") || "";

                editor.insertEmbed(range.index, "image", reader.result);

                setTimeout(() => {
                    const images = editor.root.querySelectorAll("img");
                    const lastImage = images[images.length - 1];
                    if (lastImage) {
                        lastImage.setAttribute("alt", altText);
                    }
                }, 50);

                editor.setSelection(range.index + 1);
            };
            reader.readAsDataURL(file);
        };
    }, []);

    useEffect(() => {
        const editor = quillRef.current?.getEditor();
        if (!editor) return;

        const editorRoot = editor.root;

        const handleImageClick = (e) => {
            if (e.target.tagName === "IMG") {
                const currentAlt = e.target.getAttribute("alt") || "";
                const newAlt = window.prompt(
                    "Is image ka ALT text update karein:",
                    currentAlt
                );
                if (newAlt !== null) {
                    e.target.setAttribute("alt", newAlt);
                }
            }
        };

        editorRoot.addEventListener("click", handleImageClick);

        return () => {
            editorRoot.removeEventListener("click", handleImageClick);
        };
    }, [formData.content]);

    const modules = {
        toolbar: {
            container: [
                [{ header: [1, 2, 3, false] }],
                [{ size: ["small", false, "large", "huge"] }],
                ["bold", "italic", "underline", "strike"],
                [{ color: [] }, { background: [] }],
                [{ script: "sub" }, { script: "super" }],
                ["blockquote", "code-block", "link", "image"],
                [{ list: "ordered" }, { list: "bullet" }],
                [{ indent: "-1" }, { indent: "+1" }],
                [{ align: [] }],
                ["clean"],
            ],
            handlers: {
                image: imageHandler,
            },
        },
    };

    // ---------------- SUBMIT ----------------
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            if (!token) {
                alert("Please login first.");
                return;
            }

            const schemaMarkup = buildSchemaMarkup();

            const data = new FormData();

            data.append("title", formData.title);
            data.append("slug", formData.slug);
            data.append("excerpt", formData.excerpt);
            data.append("content", formData.content);
            data.append("category", formData.category);
            data.append("author", formData.author);
            data.append("meta_title", formData.meta_title);
            data.append("meta_description", formData.meta_description);
            data.append("schema_type", schemaType);
            data.append(
                "schema_markup",
                schemaMarkup ? JSON.stringify(schemaMarkup) : ""
            );

            if (formData.image) {
                data.append("image", formData.image);
            }

            const response = await axios.post(
                "/api/blog/create",
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log(response.data);

            alert("Blog Created Successfully");
            router.push("/dashboard/blog");
            setFormData({
                title: "",
                slug: "",
                excerpt: "",
                category: "",
                author: "",
                meta_title: "",
                meta_description: "",
                content: "",
                image: null,
            });
            setSchemaType("none");
            setFaqItems([{ question: "", answer: "" }]);
            setHowToData({ name: "", description: "", totalTime: "", steps: [{ name: "", text: "" }] });
            setEventData({
                name: "",
                startDate: "",
                endDate: "",
                locationName: "",
                locationAddress: "",
                description: "",
                eventStatus: "EventScheduled",
                isOnline: false,
            });

            const fileInput = document.getElementById("blog-image");
            if (fileInput) {
                fileInput.value = "";
            }
        } catch (error) {
            console.log("FULL ERROR:", error);

            if (error.response) {
                console.log("STATUS:", error.response.status);
                console.log("DATA:", error.response.data);
                console.log("HEADERS:", error.response.headers);
            }

            console.log("REQUEST URL:", error.config?.url);

            alert(
                error.response?.data?.detail ||
                error.message ||
                "Server Error"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8">
                Create Blog
            </h1>

            <form
                onSubmit={handleSubmit}
                className="bg-white shadow rounded-lg p-6 space-y-6"
            >
                <div className="grid md:grid-cols-2 gap-4">
                    <InputField
                        label="Title"
                        value={formData.title}
                        onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                        }
                    />

                    <InputField
                        label="Slug"
                        value={formData.slug}
                        onChange={(e) =>
                            setFormData({ ...formData, slug: e.target.value })
                        }
                    />

                    <InputField
                        label="Category"
                        value={formData.category}
                        onChange={(e) =>
                            setFormData({ ...formData, category: e.target.value })
                        }
                    />

                    <InputField
                        label="Author"
                        value={formData.author}
                        onChange={(e) =>
                            setFormData({ ...formData, author: e.target.value })
                        }
                    />

                    <div>
                        <label className="block mb-2 font-medium">
                            Blog Image
                        </label>

                        <input
                            id="blog-image"
                            type="file"
                            accept="image/*"
                            className="border rounded w-full p-2"
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    image: e.target.files?.[0] || null,
                                })
                            }
                        />
                    </div>
                </div>

                <div>
                    <label className="block mb-2 font-medium">Excerpt</label>
                    <textarea
                        className="w-full border rounded p-3 h-28"
                        value={formData.excerpt}
                        onChange={(e) =>
                            setFormData({ ...formData, excerpt: e.target.value })
                        }
                    />
                </div>

                <div>
                    <label className="block mb-2 font-medium">Meta Title</label>
                    <input
                        className="w-full border rounded p-3"
                        value={formData.meta_title}
                        onChange={(e) =>
                            setFormData({ ...formData, meta_title: e.target.value })
                        }
                    />
                </div>

                <div>
                    <label className="block mb-2 font-medium">
                        Meta Description
                    </label>
                    <textarea
                        className="w-full border rounded p-3 h-24"
                        value={formData.meta_description}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                meta_description: e.target.value,
                            })
                        }
                    />
                </div>

                <div>
                    <label className="block mb-2 font-medium">Content</label>

                    <ReactQuill
                        ref={quillRef}
                        theme="snow"
                        modules={modules}
                        value={formData.content}
                        onChange={(value) =>
                            setFormData({ ...formData, content: value })
                        }
                        className="mb-16 blog-editor"
                    />
                </div>

                {/* ==================== SCHEMA MARKUP SECTION ==================== */}
                <div className="border-t pt-6">
                    <h2 className="text-xl font-bold mb-4">Schema Markup (SEO)</h2>

                    <div className="mb-6">
                        <label className="block mb-2 font-medium">Schema Type</label>
                        <select
                            value={schemaType}
                            onChange={(e) => setSchemaType(e.target.value)}
                            className="w-full border rounded p-3"
                        >
                            <option value="none">None</option>
                            <option value="faq">FAQ Page</option>
                            <option value="howto">How-To</option>
                            <option value="event">Event</option>
                        </select>
                    </div>

                    {/* ---------------- FAQ FIELDS ---------------- */}
                    {schemaType === "faq" && (
                        <div className="space-y-4 bg-gray-50 p-4 rounded">
                            {faqItems.map((item, index) => (
                                <div
                                    key={index}
                                    className="border rounded p-4 bg-white space-y-3 relative"
                                >
                                    <div>
                                        <label className="block mb-1 text-sm font-medium">
                                            Question {index + 1}
                                        </label>
                                        <input
                                            type="text"
                                            value={item.question}
                                            onChange={(e) =>
                                                updateFaqItem(index, "question", e.target.value)
                                            }
                                            className="w-full border rounded p-2"
                                            placeholder="e.g. Aapki service kya hai?"
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-1 text-sm font-medium">
                                            Answer
                                        </label>
                                        <textarea
                                            value={item.answer}
                                            onChange={(e) =>
                                                updateFaqItem(index, "answer", e.target.value)
                                            }
                                            className="w-full border rounded p-2 h-20"
                                            placeholder="Answer likhein..."
                                        />
                                    </div>

                                    {faqItems.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeFaqItem(index)}
                                            className="text-red-600 text-sm font-medium"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addFaqItem}
                                className="bg-[#111133] text-white px-4 py-2 rounded text-sm font-medium"
                            >
                                + Add FAQ
                            </button>
                        </div>
                    )}

                    {/* ---------------- HOWTO FIELDS ---------------- */}
                    {schemaType === "howto" && (
                        <div className="space-y-4 bg-gray-50 p-4 rounded">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1 text-sm font-medium">
                                        How-To Title
                                    </label>
                                    <input
                                        type="text"
                                        value={howToData.name}
                                        onChange={(e) =>
                                            setHowToData({ ...howToData, name: e.target.value })
                                        }
                                        className="w-full border rounded p-2"
                                        placeholder="e.g. Website kaise banayein"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium">
                                        Total Time (optional, e.g. PT30M = 30 mins)
                                    </label>
                                    <input
                                        type="text"
                                        value={howToData.totalTime}
                                        onChange={(e) =>
                                            setHowToData({
                                                ...howToData,
                                                totalTime: e.target.value,
                                            })
                                        }
                                        className="w-full border rounded p-2"
                                        placeholder="PT30M"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block mb-1 text-sm font-medium">
                                    Description
                                </label>
                                <textarea
                                    value={howToData.description}
                                    onChange={(e) =>
                                        setHowToData({
                                            ...howToData,
                                            description: e.target.value,
                                        })
                                    }
                                    className="w-full border rounded p-2 h-20"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="block text-sm font-medium">Steps</label>

                                {howToData.steps.map((step, index) => (
                                    <div
                                        key={index}
                                        className="border rounded p-4 bg-white space-y-3"
                                    >
                                        <input
                                            type="text"
                                            value={step.name}
                                            onChange={(e) =>
                                                updateHowToStep(index, "name", e.target.value)
                                            }
                                            className="w-full border rounded p-2"
                                            placeholder={`Step ${index + 1} Title`}
                                        />
                                        <textarea
                                            value={step.text}
                                            onChange={(e) =>
                                                updateHowToStep(index, "text", e.target.value)
                                            }
                                            className="w-full border rounded p-2 h-16"
                                            placeholder="Step ki details"
                                        />

                                        {howToData.steps.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeHowToStep(index)}
                                                className="text-red-600 text-sm font-medium"
                                            >
                                                Remove Step
                                            </button>
                                        )}
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={addHowToStep}
                                    className="bg-[#111133] text-white px-4 py-2 rounded text-sm font-medium"
                                >
                                    + Add Step
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ---------------- EVENT FIELDS ---------------- */}
                    {schemaType === "event" && (
                        <div className="space-y-4 bg-gray-50 p-4 rounded">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1 text-sm font-medium">
                                        Event Name
                                    </label>
                                    <input
                                        type="text"
                                        value={eventData.name}
                                        onChange={(e) =>
                                            setEventData({ ...eventData, name: e.target.value })
                                        }
                                        className="w-full border rounded p-2"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium">
                                        Event Status
                                    </label>
                                    <select
                                        value={eventData.eventStatus}
                                        onChange={(e) =>
                                            setEventData({
                                                ...eventData,
                                                eventStatus: e.target.value,
                                            })
                                        }
                                        className="w-full border rounded p-2"
                                    >
                                        <option value="EventScheduled">Scheduled</option>
                                        <option value="EventPostponed">Postponed</option>
                                        <option value="EventCancelled">Cancelled</option>
                                        <option value="EventRescheduled">Rescheduled</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium">
                                        Start Date & Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={eventData.startDate}
                                        onChange={(e) =>
                                            setEventData({
                                                ...eventData,
                                                startDate: e.target.value,
                                            })
                                        }
                                        className="w-full border rounded p-2"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium">
                                        End Date & Time (optional)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={eventData.endDate}
                                        onChange={(e) =>
                                            setEventData({
                                                ...eventData,
                                                endDate: e.target.value,
                                            })
                                        }
                                        className="w-full border rounded p-2"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isOnline"
                                    checked={eventData.isOnline}
                                    onChange={(e) =>
                                        setEventData({
                                            ...eventData,
                                            isOnline: e.target.checked,
                                        })
                                    }
                                />
                                <label htmlFor="isOnline" className="text-sm font-medium">
                                    Ye online event hai
                                </label>
                            </div>

                            {!eventData.isOnline && (
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-1 text-sm font-medium">
                                            Location Name
                                        </label>
                                        <input
                                            type="text"
                                            value={eventData.locationName}
                                            onChange={(e) =>
                                                setEventData({
                                                    ...eventData,
                                                    locationName: e.target.value,
                                                })
                                            }
                                            className="w-full border rounded p-2"
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-1 text-sm font-medium">
                                            Address
                                        </label>
                                        <input
                                            type="text"
                                            value={eventData.locationAddress}
                                            onChange={(e) =>
                                                setEventData({
                                                    ...eventData,
                                                    locationAddress: e.target.value,
                                                })
                                            }
                                            className="w-full border rounded p-2"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block mb-1 text-sm font-medium">
                                    Event Description
                                </label>
                                <textarea
                                    value={eventData.description}
                                    onChange={(e) =>
                                        setEventData({
                                            ...eventData,
                                            description: e.target.value,
                                        })
                                    }
                                    className="w-full border rounded p-2 h-20"
                                />
                            </div>
                        </div>
                    )}
                </div>
                {/* ==================== END SCHEMA MARKUP SECTION ==================== */}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded font-semibold"
                >
                    {loading ? "Creating Blog..." : "Create Blog"}
                </button>
            </form>

            {/* Editor ki custom styling */}
            <style jsx global>{`
                .blog-editor .ql-toolbar {
                    position: sticky;
                    top: 0;
                    z-index: 20;
                    background: #ffffff;
                    border-top-left-radius: 6px;
                    border-top-right-radius: 6px;
                }

                .blog-editor .ql-container {
                    min-height: 500px;
                    max-height: 700px;
                    overflow-y: auto;
                    font-size: 16px;
                }

                .blog-editor .ql-editor {
                    min-height: 500px;
                }

                .blog-editor .ql-editor a {
                    color: #2563eb !important;
                    font-weight: 700 !important;
                    text-decoration: underline;
                }

                .blog-editor .ql-editor img {
                    cursor: pointer;
                    max-width: 100%;
                }
            `}</style>
        </div>
    );
}

function InputField({ label, value, onChange }) {
    return (
        <div>
            <label className="block mb-2 font-medium">{label}</label>
            <input
                type="text"
                value={value}
                onChange={onChange}
                className="w-full border rounded p-3"
            />
        </div>
    );
}