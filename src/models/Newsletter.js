import mongoose from "mongoose";

const NewsletterSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, "Email address is mandatory"],
            unique: true, // Stops duplicate subscribers entries
            trim: true,
            lowercase: true,
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email format"]
        },
        isActive: {
            type: Boolean,
            default: true // Helpful if user clicks "Unsubscribe" in the future
        }
    },
    { timestamps: true }
);

export default mongoose.models.Newsletter || mongoose.model("Newsletter", NewsletterSchema);