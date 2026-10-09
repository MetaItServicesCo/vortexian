import { Loader2 } from "lucide-react";

export const formatWhen = (iso) =>
    iso ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const STYLES = {
    draft: ["Draft", "bg-slate-100 text-slate-600"],
    sending: ["Sending…", "bg-blue-50 text-blue-700"],
    sent: ["Sent", "bg-emerald-50 text-emerald-700"],
    partial: ["Partly sent", "bg-amber-50 text-amber-800"],
    failed: ["Failed", "bg-red-50 text-red-700"],
};

export function CampaignStatus({ campaign }) {
    const [label, cls] = STYLES[campaign.status] || [campaign.status, "bg-slate-100 text-slate-600"];
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${cls}`} data-testid="campaign-status">
            {campaign.status === "sending" && <Loader2 size={12} className="animate-spin" />}
            {label}
        </span>
    );
}
