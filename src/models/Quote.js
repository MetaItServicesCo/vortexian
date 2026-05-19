import mongoose from "mongoose";

const QuoteSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: [true, "First name is mandatory"] },
        lastName: { type: String, required: [true, "Last name is mandatory"] },
        phone: { type: String, required: [true, "Phone sequence validation required"] },
        email: { type: String, required: [true, "Email address is verification target"] },
        contactPref: { type: String, required: true, enum: ["Phone", "Email", "other"] },
        services: { type: [String], default: [] }, // Array containing all selected node variations
        url: { type: String, default: "" },
        projectFile: { type: String, default: "" }, // Storage path node link reference
        completionDate: { type: String, required: true },
        message: { type: String, required: true },
        // Management Administrative State Tracking
        status: { type: String, enum: ["New", "In Review", "Contacted", "Closed"], default: "New" }
    },
    { timestamps: true }
);

export default mongoose.models.Quote || mongoose.model("Quote", QuoteSchema);