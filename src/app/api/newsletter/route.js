import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Newsletter from "@/models/Newsletter";

// ==========================================
// 1. FETCH ALL SUBSCRIBERS (For Admin View)
// ==========================================
export async function GET() {
    try {
        await dbConnect();
        const subscribers = await Newsletter.find({}).sort({ createdAt: -1 });
        return NextResponse.json(subscribers, { status: 200 });
    } catch (err) {
        return NextResponse.json({ message: "Failed compiling subscriber matrix records." }, { status: 500 });
    }
}

// ==========================================
// 2. REGISTER NEW SUBSCRIBER (From Footer Box)
// ==========================================
export async function POST(req) {
    try {
        await dbConnect();
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ message: "Email parameter is required." }, { status: 400 });
        }

        // Checking duplication stream natively
        const exists = await Newsletter.findOne({ email: email.toLowerCase() });
        if (exists) {
            return NextResponse.json({ message: "You are already a registered subscriber!" }, { status: 409 });
        }

        const newSubscriber = await Newsletter.create({ email });
        return NextResponse.json({ message: "Subscription activated successfully!", data: newSubscriber }, { status: 201 });

    } catch (error) {
        if (error.name === "ValidationError") {
            return NextResponse.json({ message: error.errors.email.message }, { status: 400 });
        }
        return NextResponse.json({ message: "Internal server pipeline configuration fault." }, { status: 500 });
    }
}