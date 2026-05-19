import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Contact from "@/models/Contact";

// 1. MODULATE STATUS BADGE
export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const { status } = await req.json();

        const updated = await Contact.findByIdAndUpdate(id, { $set: { status } }, { new: true });
        return NextResponse.json({ message: "Inquiry operational phase mutated!", data: updated }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ message: "Server execution error." }, { status: 500 });
    }
}

// 2. DROP RECORD FROM INSTANCE STORAGE
export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        await Contact.findByIdAndDelete(id);
        return NextResponse.json({ message: "Inquiry log permanent deleted from storage nodes." }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ message: "Purge execution fault parameters exception." }, { status: 500 });
    }
}