import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Service title is required"],
            trim: true,
        },
        slug: {
            type: String,
            required: [true, "Slug is required"],
            unique: true,
            trim: true,
            lowercase: true,
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            enum: ["Marketing", "Design", "Technology"],
            default: "Marketing",
        },
        shortDesc: {
            type: String,
            required: [true, "Short description is required"],
        },
        icon: {
            type: String,
            default: "Share2",
        },
        image: {
            type: String,
            required: [true, "Image URL/path is required"],
        },
        longDesc: {
            type: String,
            required: [true, "Long description content is required"],
        },
        // Multi-feature Array Tags
        features: {
            type: [String],
            default: [],
        },
        // Nested Value Matrix Framework
        whyChoose: {
            expertise: { type: String, required: true },
            scalability: { type: String, required: true },
            quality: { type: String, required: true },
        },
        // Programmatic SEO Parameters
        seo: {
            title: { type: String, required: true },
            description: { type: String, required: true },
            keywords: { type: [String], default: [] },
        },
    },
    {
        timestamps: true, // Auto handles createdAt and updatedAt nodes
    }
);

// Next.js hot-reloading loop fix
export default mongoose.models.Service || mongoose.model("Service", ServiceSchema);