import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Quote from "@/models/Quote";
import fs from "fs";
import path from "path";

// 1. ADMIN ROW STATE REMODULATOR (Status Change)
export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const { status } = await req.json();

        const updated = await Quote.findByIdAndUpdate(id, { $set: { status } }, { new: true });
        return NextResponse.json({ message: "Record status modulated successfully!", data: updated });
    } catch (err) {
        return NextResponse.json({ message: "Failed executing status pipeline." }, { status: 500 });
    }
}

// 2. PURGE RECORDS ENTITY
export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const targetedRow = await Quote.findById(id);
        if (targetedRow?.projectFile) {
            const targetDiskLocation = path.join(process.cwd(), "public", targetedRow.projectFile);
            if (fs.existsSync(targetDiskLocation)) fs.unlinkSync(targetDiskLocation);
        }

        await Quote.findByIdAndDelete(id);
        return NextResponse.json({ message: "Lead instance purged from platform schema storage." });
    } catch (err) {
        return NextResponse.json({ message: "Purge exception fault error." }, { status: 500 });
    }
}