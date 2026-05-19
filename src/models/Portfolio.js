import mongoose from 'mongoose';

const PortfolioSchema = new mongoose.Schema(
    {
        title: { type: String, required: [true, "Project title is mandatory"] },
        slug: { type: String, required: true, unique: true },
        category: { type: String, required: true },
        year: { type: String, required: true },
        mainImage: { type: String, required: true },
        challenge: { type: String, required: true },
        solution: { type: String, required: true },
        // Strict Meta Parameters JSON Map Object for Google Crawling
        seoTitle: { type: String, default: "" },
        seoDescription: { type: String, default: "" },
        seoKeywords: { type: String, default: "" },
    },
    { timestamps: true }
);

export default mongoose.models.Portfolio || mongoose.model('Portfolio', PortfolioSchema);