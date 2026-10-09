"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

// A button press (not just opening the link) unsubscribes, so email
// security scanners that open every link can't unsubscribe people.
export default function UnsubscribeForm({ token }) {
    const [state, setState] = useState("ask");
    const [message, setMessage] = useState("");

    if (!token) {
        return <p className="mt-4 text-slate-600">This unsubscribe link is incomplete. Please use the link from the bottom of the newsletter email.</p>;
    }

    const unsubscribe = async () => {
        setState("busy");
        try {
            const res = await fetch("/api/newsletter/unsubscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setMessage(data.message);
            setState("done");
        } catch {
            setMessage("Something went wrong. Please try again in a moment.");
            setState("ask");
        }
    };

    if (state === "done") {
        return (
            <div className="mt-4 space-y-4" role="status">
                <p className="text-lg font-semibold text-slate-800">{message}</p>
                <p className="text-slate-600">You won&apos;t receive any more newsletters from us. You can subscribe again anytime from the website footer.</p>
                <Link href="/" className="inline-block font-semibold text-[#1D1D7E] underline">Back to the website</Link>
            </div>
        );
    }

    return (
        <div className="mt-4 space-y-5">
            <p className="text-slate-600">Do you want to stop receiving the Vortexian Tech newsletter?</p>
            {message && <p className="text-sm text-red-600" role="alert">{message}</p>}
            <button
                type="button"
                onClick={unsubscribe}
                disabled={state === "busy"}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1D1D7E] px-6 py-3 font-semibold text-white hover:bg-[#16166a] disabled:opacity-60"
            >
                {state === "busy" && <Loader2 size={16} className="animate-spin" />} Unsubscribe
            </button>
            <p className="text-sm"><Link href="/" className="text-slate-500 underline">No, take me to the website</Link></p>
        </div>
    );
}
