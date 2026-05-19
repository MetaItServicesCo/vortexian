import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Service from "@/models/Service";
import multer from "multer";
import path from "path";
import fs from "fs";

// --- MULTER SYSTEM STORAGE CONFIGURATION ---
const uploadDir = path.join(process.cwd(), "public/uploads/services");

// Ensure dynamic storage directory tree exist structurally
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB File constraint cap
});

// Helper validation framework to execute standard Express middleware strings inside next ecosystem
function runMiddleware(req, res, fn) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) return reject(result);
            return resolve(result);
        });
    });
}



// ==========================================
// 1. GET ALL SERVICES
// ==========================================
export async function GET() {
    try {
        await dbConnect();

        // Latest services sabse upar show karne ke liye sorting loop lagaya hai
        const services = await Service.find({}).sort({ createdAt: -1 });

        return NextResponse.json(services, { status: 200 });
    } catch (error) {
        console.error("API Fetch Error:", error);
        return NextResponse.json(
            { message: "Internal Server Error while compiling database assets." },
            { status: 500 }
        );
    }
}

// ==========================================
// 2. CREATE NEW SERVICE
// ==========================================
export async function POST(req) {
    try {
        await dbConnect();

        // Parse native Next.js Request parameters straight into standard structural objects
        const formData = await req.formData();

        const title = formData.get("title");
        const slug = formData.get("slug");
        const category = formData.get("category");
        const shortDesc = formData.get("shortDesc");
        const icon = formData.get("icon");
        const longDesc = formData.get("longDesc");

        // Parse structural JSON arrays components blocks back into clean data streams
        const features = JSON.parse(formData.get("features") || "[]");
        const whyChoose = JSON.parse(formData.get("whyChoose") || "{}");
        const seo = JSON.parse(formData.get("seo") || "{}");
        const uploadType = formData.get("uploadType");

        if (!title || !slug) {
            return NextResponse.json({ message: "Missing critical title or slug payloads." }, { status: 400 });
        }

        const existingService = await Service.findOne({ slug: slug.toLowerCase() });
        if (existingService) {
            return NextResponse.json({ message: "Conflict: Slug profile matches an ongoing record node." }, { status: 409 });
        }

        // Dynamic destination selector loop 
        let finalImagePath = "";
        if (uploadType === "url") {
            finalImagePath = formData.get("imageUrl");
        } else {
            const file = formData.get("serviceImage"); // Native HTML5 File buffer references mapping
            if (!file) {
                return NextResponse.json({ message: "Image upload stream failed." }, { status: 400 });
            }

            // Read file data chunks buffer arrays straight into public binary static nodes files paths
            const buffer = Buffer.from(await file.arrayBuffer());
            const filename = `serviceImage-${Date.now()}${path.extname(file.name)}`;
            const targetPath = path.join(process.cwd(), "public/uploads/services", filename);

            fs.writeFileSync(targetPath, buffer);
            finalImagePath = `/uploads/services/${filename}`; // Public absolute target url pattern matching client images config loader
        }

        // Assemble DB schema data mapping
        const newService = await Service.create({
            title,
            slug: slug.toLowerCase(),
            category,
            shortDesc,
            icon,
            image: finalImagePath,
            longDesc,
            features,
            whyChoose,
            seo
        });

        return NextResponse.json({ message: "Capability metrics deployed!", data: newService }, { status: 201 });

    } catch (error) {
        console.error("Transmission Node Exception:", error);
        return NextResponse.json({ message: "Pipeline failed compiling payload parameters." }, { status: 500 });
    }
}