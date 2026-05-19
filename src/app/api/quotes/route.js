import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Quote from "@/models/Quote";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "public/uploads/quotes");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ==========================================
// 1. GET ALL QUOTES (For Dashboard)
// ==========================================
export async function GET() {
    try {
        await dbConnect();
        const quotes = await Quote.find({}).sort({ createdAt: -1 });
        return NextResponse.json(quotes, { status: 200 });
    } catch (err) {
        return NextResponse.json({ message: "Database connection failed compiling metrics." }, { status: 500 });
    }
}

// ==========================================
// 2. SUBMIT BRAND NEW QUOTE FORM (Public Pipeline)
// ==========================================
export async function POST(req) {
    try {
        await dbConnect();
        const formData = await req.formData();

        // Data parsing logic block setups
        const file = formData.get("projectFile");
        let savedFilePath = "";

        if (file && file.name) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const filename = `quoteDoc-${Date.now()}${path.extname(file.name)}`;
            fs.writeFileSync(path.join(uploadDir, filename), buffer);
            savedFilePath = `/uploads/quotes/${filename}`;
        }

        const newQuote = await Quote.create({
            firstName: formData.get("firstName"),
            lastName: formData.get("lastName"),
            phone: formData.get("phone"),
            email: formData.get("email"),
            contactPref: formData.get("contactPref"),
            services: JSON.parse(formData.get("services") || "[]"),
            url: formData.get("url") || "",
            projectFile: savedFilePath,
            completionDate: formData.get("completionDate"),
            message: formData.get("message")
        });

        return NextResponse.json({ message: "Quote system committed successfully!", data: newQuote }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Server exception recording form entry payload data." }, { status: 500 });
    }
}