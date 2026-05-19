import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Service from "@/models/Service";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "public/uploads/services");

// ==========================================
// 1. GET SINGLE SERVICE BY ID
// ==========================================
export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const service = await Service.findById(id);
        if (!service) {
            return NextResponse.json(
                { message: "Service not found in database." },
                { status: 404 }
            );
        }

        return NextResponse.json(service, { status: 200 });
    } catch (error) {
        console.error("Fetch Single Service Error:", error);
        return NextResponse.json(
            { message: "Internal server error fetching the capability node." },
            { status: 500 }
        );
    }
}

// ==========================================
// 2. UPDATE / EDIT SERVICE BY ID (FormData & Unlink Optimized)
// ==========================================
export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        // Native Form-Data interface parsing streams
        const formData = await req.formData();

        const title = formData.get("title");
        const slug = formData.get("slug");
        const category = formData.get("category");
        const shortDesc = formData.get("shortDesc");
        const icon = formData.get("icon");
        const longDesc = formData.get("longDesc");

        const features = JSON.parse(formData.get("features") || "[]");
        const whyChoose = JSON.parse(formData.get("whyChoose") || "{}");
        const seo = JSON.parse(formData.get("seo") || "{}");
        const uploadType = formData.get("uploadType");

        // Existing Document Lookup verification
        const serviceExists = await Service.findById(id);
        if (!serviceExists) {
            return NextResponse.json({ message: "Service node not found for updates." }, { status: 404 });
        }

        // URL Slug change validation for routing structural leaks
        if (slug && slug !== serviceExists.slug) {
            const duplicateSlug = await Service.findOne({
                slug: slug.toLowerCase(),
                _id: { $ne: id },
            });
            if (duplicateSlug) {
                return NextResponse.json(
                    { message: "SEO Conflict: This URL slug is already taken by another service." },
                    { status: 409 }
                );
            }
        }

        // Image stream resolution pipeline selection
        let finalImagePath = serviceExists.image; // Fallback to current image placeholder state

        if (uploadType === "url") {
            const imageUrl = formData.get("imageUrl");
            if (imageUrl) {
                // If previous asset was a local storage file, clean it up
                if (serviceExists.image.startsWith("/uploads/")) {
                    const oldFilePath = path.join(process.cwd(), "public", serviceExists.image);
                    if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
                }
                finalImagePath = imageUrl;
            }
        } else {
            const file = formData.get("serviceImage"); // Extract binary references structure 
            if (file && file.name) {
                // If previous image file exists on local block storage, purge it first
                if (serviceExists.image.startsWith("/uploads/")) {
                    const oldFilePath = path.join(process.cwd(), "public", serviceExists.image);
                    if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
                }

                // Write new incoming stream into filesystem
                const buffer = Buffer.from(await file.arrayBuffer());
                const filename = `serviceImage-${Date.now()}${path.extname(file.name)}`;
                const targetPath = path.join(uploadDir, filename);

                fs.writeFileSync(targetPath, buffer);
                finalImagePath = `/uploads/services/${filename}`;
            }
        }

        // Mutating document elements states cleanly
        const updatedService = await Service.findByIdAndUpdate(
            id,
            {
                $set: {
                    title,
                    slug: slug ? slug.toLowerCase() : serviceExists.slug,
                    category,
                    shortDesc,
                    icon,
                    image: finalImagePath,
                    longDesc,
                    features,
                    whyChoose,
                    seo
                }
            },
            { new: true, runValidators: true }
        );

        return NextResponse.json(
            { message: "Capability metrics updated successfully!", data: updatedService },
            { status: 200 }
        );
    } catch (error) {
        console.error("API Update Error:", error);

        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((err) => err.message);
            return NextResponse.json({ message: messages.join(", ") }, { status: 400 });
        }

        return NextResponse.json(
            { message: "Internal server error while updating payload configurations." },
            { status: 500 }
        );
    }
}

// ==========================================
// 3. DELETE SERVICE BY ID (With Filesystem Purge)
// ==========================================
export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        // Fetch capability first to locate asset storage tree location
        const service = await Service.findById(id);
        if (!service) {
            return NextResponse.json({ message: "Service not found or already purged." }, { status: 404 });
        }

        // If service contains local disk images, drop binary file completely
        if (service.image && service.image.startsWith("/uploads/")) {
            const filePath = path.join(process.cwd(), "public", service.image);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Drop schema data entity row node
        await Service.findByIdAndDelete(id);

        return NextResponse.json(
            { message: "Capability purged successfully from system storage." },
            { status: 200 }
        );
    } catch (error) {
        console.error("API Delete Error:", error);
        return NextResponse.json(
            { message: "Internal server error executing data purge." },
            { status: 500 }
        );
    }
}