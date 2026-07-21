"use client";

import { useEffect, useState } from "react";
import {
  FiFileText,
  FiSend,
  FiLink,
  FiLoader,
  FiAlertCircle,
  FiExternalLink,
} from "react-icons/fi";
import useNewsletterStore from "@/store/newsletterStore";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (typeof window !== "undefined" ? window.location.origin : "");

const absoluteBlogUrl = (value) => {
  if (!value) return "";
  const v = String(value).trim();
  if (v.startsWith("http")) return v;
  return `${SITE_URL.replace(/\/$/, "")}/blog/${v.replace(/^\/+/, "")}`;
};

// Strip tags just to count real characters typed in the editor.
const hasText = (html) =>
  Boolean(html && html.replace(/<[^>]*>/g, "").trim().length);

export default function BlogIntegrationCard() {
  const latestBlog = useNewsletterStore((s) => s.latestBlog);
  const blogLoading = useNewsletterStore((s) => s.blogLoading);
  const blogError = useNewsletterStore((s) => s.blogError);
  const fetchLatestBlog = useNewsletterStore((s) => s.fetchLatestBlog);
  const fetchBlogMetadata = useNewsletterStore((s) => s.fetchBlogMetadata);
  const sendBlogToSubscribers = useNewsletterStore((s) => s.sendBlogToSubscribers);
  const sending = useNewsletterStore((s) => s.sending);

  // Pulled in so the card can show exactly what will be emailed.
  const composeForm = useNewsletterStore((s) => s.composeForm);
  const setActiveTab = useNewsletterStore((s) => s.setActiveTab);
  const subscribers = useNewsletterStore((s) => s.subscribers);
  const selectedSubscribers = useNewsletterStore((s) => s.selectedSubscribers);

  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchLatestBlog();
  }, [fetchLatestBlog]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleFetchMetadata = async () => {
    if (!url.trim().startsWith("http")) {
      showToast("Enter a full URL starting with http", "error");
      return;
    }
    setFetching(true);
    const data = await fetchBlogMetadata(url.trim());
    setFetching(false);
    showToast(
      data ? "Blog details fetched!" : "Couldn't fetch that blog.",
      data ? "success" : "error",
    );
  };

  const handleSend = async () => {
    const res = await sendBlogToSubscribers();
    if (res?.ok) {
      showToast(
        res.recipients
          ? `Sent to ${res.recipients} subscriber${res.recipients === 1 ? "" : "s"}!`
          : "Sent to subscribers!",
        "success",
      );
    } else {
      showToast(res?.error || "Send failed.", "error");
    }
  };

  const blogImage = latestBlog?.image || latestBlog?.coverImage || null;
  const blogUrl = absoluteBlogUrl(latestBlog?.url || latestBlog?.blog_url);

  const useSelected =
    composeForm.audience === "selected" && selectedSubscribers.length > 0;
  const recipientCount = useSelected
    ? selectedSubscribers.length
    : subscribers.length;

  const subjectPreview =
    composeForm.subject.trim() ||
    (latestBlog ? `New Blog: ${latestBlog.title}` : "");
  const contentTyped = hasText(composeForm.content);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 relative">
      {toast && (
        <div
          className={`absolute top-4 right-4 text-xs px-3 py-2 rounded-lg shadow-md z-50 ${
            toast.type === "success"
              ? "bg-gray-900 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="flex items-center gap-2">
        <FiFileText className="text-gray-700" size={16} />
        <h3 className="font-semibold text-gray-900">Blog Integration</h3>
      </div>
      <p className="text-sm text-gray-500 mt-1">
        Paste a blog link. The email sends your Compose subject and content,
        plus the post below as a clickable card.
      </p>

      {/* URL input */}
      <div className="mt-4 flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleFetchMetadata()}
          placeholder="https://yoursite.com/blog/your-post"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
        />
        <button
          type="button"
          onClick={handleFetchMetadata}
          disabled={fetching}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 shrink-0"
          aria-label="Fetch blog details"
        >
          {fetching ? <FiLoader className="animate-spin" /> : <FiLink size={16} />}
        </button>
      </div>

      {blogError && (
        <p className="mt-2 text-xs text-red-600">{blogError}</p>
      )}

      {/* Blog preview card */}
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
              <div className="h-3 w-20 bg-gray-200 rounded" />
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
              {blogUrl && (
                <a
                  href={blogUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 break-all"
                >
                  <FiExternalLink size={12} className="shrink-0" />
                  {blogUrl}
                </a>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400">No blog fetched yet.</p>
          )}
        </div>
      </div>

      {/* What will actually be emailed */}
      {latestBlog && (
        <div className="mt-4 border border-gray-200 rounded-xl p-4 bg-gray-50">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            This email will contain
          </p>

          <dl className="mt-3 space-y-2.5 text-sm">
            <div className="flex gap-2">
              <dt className="text-gray-500 w-16 shrink-0">Subject</dt>
              <dd className="text-gray-900 flex-1 break-words">
                {subjectPreview}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-500 w-16 shrink-0">Message</dt>
              <dd className="flex-1">
                {contentTyped ? (
                  <span className="text-gray-900">
                    Your Compose tab content
                  </span>
                ) : (
                  <span className="text-amber-600">
                    Empty — a short default line will be used instead
                  </span>
                )}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-500 w-16 shrink-0">Link</dt>
              <dd className="text-gray-900 flex-1 break-all">
                {blogUrl || "—"}
              </dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={() => setActiveTab("compose")}
            className="mt-3 text-xs font-medium text-gray-900 hover:underline"
          >
            Edit subject &amp; content in Compose
          </button>
        </div>
      )}

      {!contentTyped && latestBlog && (
        <div className="mt-3 flex gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <FiAlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>
            Write something in the Compose tab first so the email isn&apos;t just
            a bare link.
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={handleSend}
        disabled={!latestBlog || !blogUrl || sending}
        className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-800 disabled:opacity-50"
      >
        <FiSend size={14} />
        {sending
          ? "Sending..."
          : `Send to ${recipientCount} ${useSelected ? "selected " : ""}subscriber${recipientCount === 1 ? "" : "s"}`}
      </button>
    </div>
  );
}