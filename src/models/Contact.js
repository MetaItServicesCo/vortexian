import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: [true, "Full name is mandatory"] },
        companyName: { type: String, required: [true, "Company name is required"] },
        websiteUrl: { type: String, default: "" },
        email: { type: String, required: [true, "Email verification target path required"] },
        phone: { type: String, required: [true, "Phone sequence required"] },
        designation: { type: String, required: [true, "Designation / Role is required"] },
        subject: { type: String, required: [true, "Subject cannot be empty"] },
        message: { type: String, default: "" },
        status: { type: String, enum: ["Unread", "In Discussion", "Resolved"], default: "Unread" }
    },
    { timestamps: true }
);

// Prevent Next.js hot reloading duplicate compile errors
export default mongoose.models.Contact || mongoose.model("Contact", ContactSchema);