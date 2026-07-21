"use client";

import useNewsletterStore from "@/store/newsletterStore";

const STATUS_STYLES = {
  DRAFT: "bg-gray-100 text-gray-600",
  SCHEDULED: "bg-amber-50 text-amber-700",
  SENT: "bg-green-50 text-green-700",
  FAILED: "bg-red-50 text-red-600",
};

function formatDate(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function HistoryTab() {
  const history = useNewsletterStore((s) => s.history);
  const historyLoading = useNewsletterStore((s) => s.historyLoading);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6">
      <h3 className="font-semibold text-gray-900">Newsletter History</h3>
      <p className="text-sm text-gray-500 mt-0.5">Recently sent campaigns.</p>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-sm min-w-[650px]">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="py-2 pr-3 font-medium">Date</th>
              <th className="py-2 pr-3 font-medium">Subject</th>
              <th className="py-2 pr-3 font-medium text-right">Recipients</th>
              <th className="py-2 pr-3 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {historyLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-3" colSpan={4}>
                    <div className="h-4 bg-gray-100 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : history.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-400">
                  No campaigns sent yet.
                </td>
              </tr>
            ) : (
              history.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-50 hover:bg-gray-50/60"
                >
                  <td className="py-3 pr-3 text-gray-500">
                    {formatDate(
                      item.sent_at || item.scheduled_for || item.created_at,
                    )}
                  </td>
                  <td className="py-3 pr-3 text-gray-900 font-medium">
                    {item.subject}
                  </td>
                  <td className="py-3 pr-3 text-right text-gray-700 font-medium">
                    {(item.recipient_count ?? 0).toLocaleString()}
                  </td>
                  <td className="py-3 pr-3 text-right">
                    <span
                      className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                        STATUS_STYLES[item.status] ||
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {(item.status || "").toLowerCase()}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
