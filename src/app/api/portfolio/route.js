import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Portfolio from "@/models/Portfolio";
import path from "path";
import fs from "fs";

const storageDiskPath = path.join(process.cwd(), "public/uploads/portfolio");
if (!fs.existsSync(storageDiskPath)) {
    fs.mkdirSync(storageDiskPath, { recursive: true });
}

// ------------------ GET: READ ALL RECORDS ------------------
export async function GET() {
    try {
        await dbConnect();
        const data = await Portfolio.find({}).sort({ createdAt: -1 });
        return NextResponse.json(data, { status: 200 });
    } catch (err) {
        return NextResponse.json({ message: "Cluster query error." }, { status: 500 });
    }
}

// ------------------ POST: CREATE FRESH ENTRY ------------------
export async function POST(req) {
    try {
        await dbConnect();
        const bundle = await req.formData();

        const title = bundle.get("title");
        const category = bundle.get("category");
        const year = bundle.get("year");
        const challenge = bundle.get("challenge");
        const solution = bundle.get("solution");
        const seoTitle = bundle.get("seoTitle") || "";
        const seoDescription = bundle.get("seoDescription") || "";
        const seoKeywords = bundle.get("seoKeywords") || "";

        if (!title || !category || !year || !challenge || !solution) {
            return NextResponse.json({ message: "Mandatory fields missing." }, { status: 400 });
        }

        const file = bundle.get("mainImage");
        if (!file || !file.name) {
            return NextResponse.json({ message: "Primary graphic asset required." }, { status: 400 });
        }

        // Dynamic clean url slug generator
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `project-${Date.now()}${path.extname(file.name)}`;
        fs.writeFileSync(path.join(storageDiskPath, filename), buffer);
        const mainImage = `/uploads/portfolio/${filename}`;

        const node = await Portfolio.create({
            title, slug, category, year, mainImage, challenge, solution, seoTitle, seoDescription, seoKeywords
        });

        return NextResponse.json({ message: "Project saved successfully!", data: node }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: "Exception recording portfolio asset data." }, { status: 500 });
    }
}