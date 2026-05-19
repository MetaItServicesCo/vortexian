import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Team from "@/models/Team";
import path from "path";
import fs from "fs";

const storageDiskPath = path.join(process.cwd(), "public/uploads/team");
if (!fs.existsSync(storageDiskPath)) {
    fs.mkdirSync(storageDiskPath, { recursive: true });
}

// ==========================================
// 1. GET ALL MEMBERS PIPELINE
// ==========================================
export async function GET() {
    try {
        await dbConnect();
        const members = await Team.find({}).sort({ createdAt: -1 });
        return NextResponse.json(members, { status: 200 });
    } catch (err) {
        return NextResponse.json({ message: "Cluster query execution error." }, { status: 500 });
    }
}

// ==========================================
// 2. CREATE NEW MEMBER NODE
// ==========================================
export async function POST(req) {
    try {
        await dbConnect();
        const payloadBundle = await req.formData();

        // 1. Strict Validation Check for Text and Textarea inputs
        const name = payloadBundle.get("name");
        const role = payloadBundle.get("role");
        const description = payloadBundle.get("description"); // CATCHING BIO DESCRIPTION FROM FORM

        if (!name || !role || !description) {
            return NextResponse.json(
                { message: "Validation failure: Name, Role, and Description are required metrics." },
                { status: 400 }
            );
        }

        // 2. Binary File Upload Handling Pipeline
        const file = payloadBundle.get("image");
        if (!file || !file.name) {
            return NextResponse.json({ message: "Asset verification error: Image field can't be null." }, { status: 400 });
        }

        const binaryBuffer = Buffer.from(await file.arrayBuffer());
        const uniqueFilename = `member-${Date.now()}${path.extname(file.name)}`;
        fs.writeFileSync(path.join(storageDiskPath, uniqueFilename), binaryBuffer);

        const savedAssetLink = `/uploads/team/${uniqueFilename}`;

        // 3. MERN Document Node Creation inside MongoDB Atlas Clusters
        const newTeamNode = await Team.create({
            name: name,
            role: role,
            description: description, // FIXED: Registered description dynamically in Database document Creation
            image: savedAssetLink,
            facebook: payloadBundle.get("facebook") || "",
            instagram: payloadBundle.get("instagram") || "",
            linkedin: payloadBundle.get("linkedin") || "",
        });

        return NextResponse.json({ message: "Team profile saved safely!", data: newTeamNode }, { status: 201 });
    } catch (error) {
        console.error("Critical Runtime Endpoint Exception Error:", error);
        return NextResponse.json({ message: "Server exception recording profile input payload." }, { status: 500 });
    }
}