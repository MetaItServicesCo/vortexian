import mongoose from "mongoose";

// Agar code hot-reload mein purana model pick kar raha hai, to hum usse fresh re-compile karwayenge
if (mongoose.models.Team) {
    delete mongoose.models.Team;
}

const TeamSchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, "Member name is mandatory"] },
        role: { type: String, required: [true, "Professional role is required"] },
        description: { type: String, required: [true, "Bio description parameter is required"] },
        image: { type: String, required: [true, "Profile asset path node links mandatory"] },
        facebook: { type: String, default: "" },
        instagram: { type: String, default: "" },
        linkedin: { type: String, default: "" },
    },
    { timestamps: true }
);

export default mongoose.model("Team", TeamSchema);