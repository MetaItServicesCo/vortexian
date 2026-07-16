"use client";

import { useEffect, useState } from "react";
import { FiFileText, FiSend, FiLink, FiLoader } from "react-icons/fi";
import useNewsletterStore from "@/store/newsletterStore";

export default function BlogIntegrationCard() {
  const latestBlog = useNewsletterStore((s) => s.latestBlog);
  const blogLoading = useNewsletterStore((s) => s.blogLoading);
  const autoSendOnBlog = useNewsletterStore((s) => s.autoSendOnBlog);
  const fetchLatestBlog = useNewsletterStore((s) => s.fetchLatestBlog);
  const toggleAutoSend = useNewsletterStore((s) => s.toggleAutoSend);
  const sendBlogToSubscribers = useNewsletterStore(
    (s) => s.sendBlogToSubscribers,
  );
  const fetchBlogMetadata = useNewsletterStore((s) => s.fetchBlogMetadata);

  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [toast, setToast] = useState(null);
  const [isSendingBlog, setIsSendingBlog] = useState(false);

  useEffect(() => {
    fetchLatestBlog();
  }, [fetchLatestBlog]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleFetchMetadata = async () => {
    if (!url.startsWith("http")) {
      showToast("Please enter a valid URL");
      return;
    }
    setFetching(true);
    const data = await fetchBlogMetadata(url);
    setFetching(false);
    showToast(data ? "Blog details fetched!" : "Failed to fetch blog details");
  };

  const handleSend = async () => {
    setIsSendingBlog(true);
    const ok = await sendBlogToSubscribers();
    showToast(ok ? "Sent to subscribers!" : "Send failed.");
    setIsSendingBlog(false);
  };

  // Backend returns `image` (already an absolute URL via _absolute_url).
  const blogImage = latestBlog?.image || latestBlog?.coverImage || null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 relative">
      {toast && (
        <div className="absolute top-4 right-4 text-xs px-3 py-2 rounded-lg shadow-md bg-gray-900 text-white z-50">
          {toast}
        </div>
      )}

      <div className="flex items-center gap-2">
        <FiFileText className="text-gray-700" size={16} />
        <h3 className="font-semibold text-gray-900">Blog Integration</h3>
      </div>
      <p className="text-sm text-gray-500 mt-1">
        Paste a blog link to fetch its details.
      </p>

      <div className="mt-4 flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://yourblog.com/post"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
        />
        <button
          type="button"
          onClick={handleFetchMetadata}
          disabled={fetching}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {fetching ? (
            <FiLoader className="animate-spin" />
          ) : (
            <FiLink size={16} />
          )}
        </button>
      </div>

      <div className="mt-4 border border-gray-200 rounded-xl overflow-hidden">
        <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
          {blogImage ? (
            <img
              src={blogImage}
              alt={latestBlog?.title || "blog"}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <FiFileText className="text-gray-300" size={40} />
          )}
        </div>

        <div className="p-4">
          {blogLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 w-2/3 bg-gray-200 rounded" />
            </div>
          ) : latestBlog ? (
            <>
              <span className="inline-block text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                Latest Blog
              </span>
              <p className="text-sm font-semibold text-gray-900 mt-2">
                {latestBlog.title}
              </p>
              {latestBlog.excerpt && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {latestBlog.excerpt}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400">No blog fetched yet.</p>
          )}

          <button
            type="button"
            onClick={handleSend}
            disabled={!latestBlog || isSendingBlog}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-medium px-1 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            <FiSend size={14} />
            {isSendingBlog ? "Sending..." : "Send to Subscribers"}
          </button>
        </div>
      </div>

    </div>
  );
}
