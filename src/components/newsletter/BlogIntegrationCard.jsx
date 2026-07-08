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
  const sending = useNewsletterStore((s) => s.sending);

  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [toast, setToast] = useState(null);

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
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showToast("Blog details fetched!");
    } catch (error) {
      showToast("Failed to fetch blog details");
    } finally {
      setFetching(false);
    }
  };

  const handleSend = async () => {
    const ok = await sendBlogToSubscribers();
    showToast(ok ? "Sent to subscribers!" : "Send failed.");
  };

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
        Paste blog link to fetch details.
      </p>

      {/* URL Input Section */}
      <div className="mt-4 flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://yourblog.com/post"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
        />
        <button
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

      {/* Blog Preview */}
      <div className="mt-4 border border-gray-200 rounded-xl overflow-hidden">
        <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
          {latestBlog?.coverImage ? (
            <img
              src={latestBlog.coverImage}
              alt="blog"
              className="w-full h-full object-cover"
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
            </>
          ) : (
            <p className="text-sm text-gray-400">No blog fetched yet.</p>
          )}

          <button
            type="button"
            onClick={handleSend}
            disabled={!latestBlog || sending}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            <FiSend size={14} />
            {sending ? "Sending..." : "Send to Subscribers"}
          </button>
        </div>
      </div>

      {/* Auto-send Settings */}
      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
        <div>
          <p className="text-sm font-medium text-gray-700">
            Auto-send on new blog
          </p>
          <p className="text-xs text-gray-500">
            Status: {autoSendOnBlog ? "Disabled" : "Enabled"}
          </p>
        </div>
        <button
          type="button"
          onClick={toggleAutoSend}
          className={`w-10 h-5 rounded-full relative transition-colors ${autoSendOnBlog ? "bg-gray-900" : "bg-gray-200"}`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${autoSendOnBlog ? "translate-x-5" : "translate-x-0.5"}`}
          />
        </button>
      </div>
    </div>
  );
}
