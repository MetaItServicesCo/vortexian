import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Portfolio from "@/models/Portfolio";
import path from "path";
import fs from "fs";

// ------------------ PUT: UPDATE SPECIFIC NODE ------------------
export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const { id } = params;
        const bundle = await req.formData();

        const targetNode = await Portfolio.findById(id);
        if (!targetNode) return NextResponse.json({ message: "Target profile missing." }, { status: 404 });

        const updatedData = {
            title: bundle.get("title"),
            category: bundle.get("category"),
            year: bundle.get("year"),
            challenge: bundle.get("challenge"),
            solution: bundle.get("solution"),
            seoTitle: bundle.get("seoTitle") || "",
            seoDescription: bundle.get("seoDescription") || "",
            seoKeywords: bundle.get("seoKeywords") || "",
            slug: bundle.get("title").toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        };

        const file = bundle.get("mainImage");
        if (file && file.name) {
            // Clean up previous image to maintain server disk space Optimization
            const oldPath = path.join(process.cwd(), "public", targetNode.mainImage);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

            const buffer = Buffer.from(await file.arrayBuffer());
            const filename = `project-${Date.now()}${path.extname(file.name)}`;
            fs.writeFileSync(path.join(process.cwd(), "public/uploads/portfolio", filename), buffer);
            updatedData.mainImage = `/uploads/portfolio/${filename}`;
        }

        const modifiedNode = await Portfolio.findByIdAndUpdate(id, updatedData, { new: true });
        return NextResponse.json({ message: "Profile record updated!", data: modifiedNode }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ message: "Exception executing updates." }, { status: 500 });
    }
}

// ------------------ DELETE: DESTROY NODE ------------------
export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { id } = params;
        const target = await Portfolio.findById(id);

        if (target) {
            const imgPath = path.join(process.cwd(), "public", target.mainImage);
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
            await Portfolio.findByIdAndDelete(id);
        }
        return NextResponse.json({ message: "Record permanently wiped." }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ message: "Deletion execution error." }, { status: 500 });
    }
}