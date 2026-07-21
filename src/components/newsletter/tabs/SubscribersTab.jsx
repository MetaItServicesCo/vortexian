"use client";

import { useMemo, useState } from "react";
import { FiSearch, FiDownload, FiTrash2 } from "react-icons/fi";
import useNewsletterStore from "@/store/newsletterStore";

export default function SubscribersTab() {
  const subscribers = useNewsletterStore((s) => s.subscribers);
  const subscribersLoading = useNewsletterStore((s) => s.subscribersLoading);
  const subscriberSearch = useNewsletterStore((s) => s.subscriberSearch);
  const setSubscriberSearch = useNewsletterStore((s) => s.setSubscriberSearch);
  const selectedSubscribers = useNewsletterStore((s) => s.selectedSubscribers);
  const toggleSubscriber = useNewsletterStore((s) => s.toggleSubscriber);
  const toggleAllSubscribers = useNewsletterStore(
    (s) => s.toggleAllSubscribers,
  );
  const exportCsv = useNewsletterStore((s) => s.exportCsv);
  const removeSubscriber = useNewsletterStore((s) => s.removeSubscriber);

  const [deletingId, setDeletingId] = useState(null);

  const filtered = useMemo(() => subscribers, [subscribers]);

  const visibleIds = filtered.map((s) => s.id);
  const allVisibleSelected =
    visibleIds.length > 0 &&
    visibleIds.every((id) => selectedSubscribers.includes(id));

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this subscriber? This cannot be undone."))
      return;
    setDeletingId(id);
    await removeSubscriber(id);
    setDeletingId(null);
  };

  const formatDate = (isoString) => {
    if (!isoString) return "—";
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900">Subscriber List</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {filtered.length} subscribers
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={14}
            />
            <input
              type="text"
              value={subscriberSearch}
              onChange={(e) => setSubscriberSearch(e.target.value)}
              placeholder="Search name or email"
              className="pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            />
          </div>
          <button
            type="button"
            onClick={exportCsv}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-50 whitespace-nowrap"
          >
            <FiDownload size={14} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-sm min-w-[650px]">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="py-2 pr-3 w-8">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={() => toggleAllSubscribers(visibleIds)}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="py-2 pr-3 font-medium">Name</th>
              <th className="py-2 pr-3 font-medium">Email</th>
              <th className="py-2 pr-3 font-medium">Subscribed</th>
              <th className="py-2 pr-3 font-medium">Status</th>
              <th className="py-2 pr-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscribersLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-3" colSpan={6}>
                    <div className="h-4 bg-gray-100 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">
                  No subscribers found.
                </td>
              </tr>
            ) : (
              filtered.map((sub) => (
                <tr
                  key={sub.id}
                  className="border-b border-gray-50 hover:bg-gray-50/60"
                >
                  <td className="py-3 pr-3">
                    <input
                      type="checkbox"
                      checked={selectedSubscribers.includes(sub.id)}
                      onChange={() => toggleSubscriber(sub.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="py-3 pr-3 text-gray-900">{sub.name || "—"}</td>
                  <td className="py-3 pr-3 text-blue-600">{sub.email}</td>
                  <td className="py-3 pr-3 text-gray-500">
                    {formatDate(sub.subscribed_at)}
                  </td>
                  <td className="py-3 pr-3">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                        sub.status === "ACTIVE"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          sub.status === "ACTIVE"
                            ? "bg-green-500"
                            : "bg-red-400"
                        }`}
                      />
                      {sub.status === "ACTIVE" ? "Active" : sub.status}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(sub.id)}
                      disabled={deletingId === sub.id}
                      className="text-gray-400 hover:text-red-500 disabled:opacity-50"
                      aria-label={`Remove ${sub.name || sub.email}`}
                    >
                      <FiTrash2 size={15} />
                    </button>
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
