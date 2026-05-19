import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Team from "@/models/Team";
import fs from "fs";
import path from "path";

// ==========================================
// 1. UPDATE TARGET TEAM PROFILE
// ==========================================
export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const payloadBundle = await req.formData();

        const targetedDocument = await Team.findById(id);
        if (!targetedDocument) {
            return NextResponse.json({ message: "Professional identity node mismatch" }, { status: 404 });
        }

        let finalAssetPath = targetedDocument.image;
        const optionalFile = payloadBundle.get("image");

        if (optionalFile && optionalFile.name) {
            // Unlink legacy asset frames first
            const rawDiskPath = path.join(process.cwd(), "public", targetedDocument.image);
            if (fs.existsSync(rawDiskPath)) fs.unlinkSync(rawDiskPath);

            const binaryBuffer = Buffer.from(await optionalFile.arrayBuffer());
            const uniqueFilename = `member-${Date.now()}${path.extname(optionalFile.name)}`;
            fs.writeFileSync(path.join(process.cwd(), "public/uploads/team", uniqueFilename), binaryBuffer);
            finalAssetPath = `/uploads/team/${uniqueFilename}`;
        }

        const modifiedNode = await Team.findByIdAndUpdate(
            id,
            {
                $set: {
                    name: payloadBundle.get("name"),
                    role: payloadBundle.get("role"),
                    description: payloadBundle.get("description"), // FIXED: Bound field description inside database modification schema object
                    image: finalAssetPath,
                    facebook: payloadBundle.get("facebook") || "",
                    instagram: payloadBundle.get("instagram") || "",
                    linkedin: payloadBundle.get("linkedin") || "",
                },
            },
            { new: true }
        );

        return NextResponse.json({ message: "Profile mutated successfully!", data: modifiedNode }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ message: "Mutation thread pipeline failure." }, { status: 500 });
    }
}

// ==========================================
// 2. PURGE MEMBER NODE PERMANENTLY
// ==========================================
export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const document = await Team.findById(id);
        if (document?.image) {
            const rawDiskPath = path.join(process.cwd(), "public", document.image);
            if (fs.existsSync(rawDiskPath)) fs.unlinkSync(rawDiskPath);
        }

        await Team.findByIdAndDelete(id);
        return NextResponse.json({ message: "Profile destroyed from platform layer files clusters." });
    } catch (err) {
        return NextResponse.json({ message: "Purge sequence execution bottleneck error." }, { status: 500 });
    }
}