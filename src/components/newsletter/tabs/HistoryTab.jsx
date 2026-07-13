"use client";

import { FiTrash2 } from "react-icons/fi";
import useNewsletterStore from "@/store/newsletterStore";

export default function HistoryTab() {
  const history = useNewsletterStore((s) => s.history);
  const historyLoading = useNewsletterStore((s) => s.historyLoading);
  const deleteHistoryItem = useNewsletterStore((s) => s.deleteHistoryItem);

  // Duplicate check logic
  const getIsDuplicate = (subject, currentIndex) => {
    return history.some(
      (item, i) => item.subject === subject && i !== currentIndex,
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6">
      <h3 className="font-semibold text-gray-900">Newsletter History</h3>
      <p className="text-sm text-gray-500 mt-0.5">Recently sent campaigns.</p>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="py-2 pr-3 font-medium">Sent Date</th>
              <th className="py-2 pr-3 font-medium">Subject</th>
              <th className="py-2 pr-3 font-medium text-right">Recipients</th>
              <th className="py-2 pr-3 font-medium text-center">Status</th>
              <th className="py-2 pr-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {historyLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-3" colSpan={5}>
                    <div className="h-4 bg-gray-100 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : history.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">
                  No campaigns sent yet.
                </td>
              </tr>
            ) : (
              history.map((item, i) => {
                const isDuplicate = getIsDuplicate(item.subject, i);
                return (
                  <tr
                    key={i}
                    className={`border-b border-gray-50 transition-colors ${
                      isDuplicate ? "bg-red-50/50" : "hover:bg-gray-50/60"
                    }`}
                  >
                    <td className="py-3 pr-3 text-orange-500 font-medium">
                      {item.sentDate}
                    </td>
                    <td className="py-3 pr-3 text-gray-900 font-medium">
                      {item.subject}
                      {isDuplicate && (
                        <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                          Duplicate
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-3 text-right text-orange-500 font-medium">
                      {item.recipients.toLocaleString()}
                    </td>
                    <td className="py-3 pr-3 text-center">
                      <span className="inline-block text-xs font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-right">
                      <button
                        onClick={() => deleteHistoryItem(i)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        title="Delete Campaign"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
