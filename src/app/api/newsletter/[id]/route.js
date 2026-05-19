import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Newsletter from "@/models/Newsletter";

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const droppedNode = await Newsletter.findByIdAndDelete(id);
        if (!droppedNode) {
            return NextResponse.json({ message: "Record index missing or already dropped." }, { status: 404 });
        }

        return NextResponse.json({ message: "Subscriber purged from mailing list nodes." }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ message: "Purge process bottleneck exception." }, { status: 500 });
    }
}