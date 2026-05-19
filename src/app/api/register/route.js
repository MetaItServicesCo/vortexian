import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function POST(req) {
    try {
        const { name, email, password, adminSecret } = await req.json();

        // 1. Basic Validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { message: "Please fill all required fields." },
                { status: 400 }
            );
        }

        // 2. Security Check (Admin Secret Key)
        // Yeh ensure karta hai ke har koi admin account na bana le
        const MASTER_SECRET = "secret_123";
        if (adminSecret !== MASTER_SECRET) {
            return NextResponse.json(
                { message: "Unauthorized: Invalid Admin Secret Key." },
                { status: 401 }
            );
        }

        await dbConnect();

        // 3. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { message: "This email is already registered." },
                { status: 409 }
            );
        }

        // 4. Password Hashing
        const hashedPassword = await bcrypt.hash(password, 12); // 12 rounds for better security

        // 5. Create Admin User
        await User.create({
            name,
            email,
            password: hashedPassword,
            role: "admin", // By default admin role set kar diya
        });

        return NextResponse.json(
            { message: "Admin account created successfully!" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration Error:", error);
        return NextResponse.json(
            { message: "Internal Server Error. Please try again later." },
            { status: 500 }
        );
    }
}