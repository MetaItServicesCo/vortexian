import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Contact from "@/models/Contact";

// ==========================================
// 1. GET ALL GENERAL INQUIRIES (For Dashboard)
// ==========================================
export async function GET() {
    try {
        await dbConnect();
        const inquiries = await Contact.find({}).sort({ createdAt: -1 });
        return NextResponse.json(inquiries, { status: 200 });
    } catch (err) {
        return NextResponse.json({ message: "Database pipeline connectivity exception" }, { status: 500 });
    }
}

// ==========================================
// 2. POST BRAND NEW INQUIRY (From Home Page Form)
// ==========================================
export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();

        const { fullName, companyName, email, phone, designation, subject } = body;
        if (!fullName || !companyName || !email || !phone || !designation || !subject) {
            return NextResponse.json({ message: "Validation failure: Required parameters missing." }, { status: 400 });
        }

        const entry = await Contact.create(body);
        return NextResponse.json({ message: "Inquiry logged into system storage nodes!", data: entry }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: "Internal runtime pipeline execution fault." }, { status: 500 });
    }
}