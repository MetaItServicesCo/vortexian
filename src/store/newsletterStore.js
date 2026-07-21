import { create } from "zustand";
import {
  getSignupForm,
  updateSignupForm,
  getSubscribers,
  searchSubscribers,
  deleteSubscriber,
  exportSubscribersCsv,
  createCampaign,
  sendCampaignNow,
  sendTestEmail,
  getRecipientsCount,
  getHistory,
  getTemplates,
  createTemplate,
  getBlogPreview,
  getBlogSetting,
  updateBlogSetting,
  parseBlogUrl,
} from "@/lib/api/newsletter";

// Public site the blog links should point at. /blog-preview returns only a
// slug, so a bare value like "my-post" would be a dead link in the email.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (typeof window !== "undefined" ? window.location.origin : "");

const absoluteBlogUrl = (value) => {
  if (!value) return "";
  const v = String(value).trim();
  if (v.startsWith("http")) return v;
  return `${SITE_URL.replace(/\/$/, "")}/blog/${v.replace(/^\/+/, "")}`;
};

const escapeHtml = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Builds the email body for a blog send:
 *   [ your Compose tab content ]  +  [ blog card: image, title, excerpt, link ]
 * Inline styles only — email clients strip <style> blocks and classes.
 */
const buildBlogEmailHtml = ({ content = "", blog = {}, blogUrl = "" }) => {
  const title = escapeHtml(blog.title || "");
  const excerpt = escapeHtml(blog.excerpt || "");
  const image = blog.image || blog.coverImage || "";

  const intro = content?.trim()
    ? content
    : `<p style="margin:0 0 16px 0;">Hi {{name}},</p><p style="margin:0 0 16px 0;">We just published something new.</p>`;

  return `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:16px;line-height:1.7;color:#1a1d21;max-width:600px;margin:0 auto;">

  <div style="margin:0 0 24px 0;">${intro}</div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
         style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;background:#ffffff;">
    ${
      image
        ? `<tr><td style="padding:0;font-size:0;line-height:0;">
             <a href="${blogUrl}" style="display:block;">
               <img src="${image}" alt="${title}" width="600"
                    style="display:block;width:100%;max-width:600px;height:auto;border:0;">
             </a>
           </td></tr>`
        : ""
    }
    <tr>
      <td style="padding:24px;">
        <p style="margin:0 0 10px 0;font-size:11px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:#6b7280;">
          New article
        </p>
        <h2 style="margin:0 0 12px 0;font-size:22px;line-height:1.3;font-weight:700;color:#111827;">
          <a href="${blogUrl}" style="color:#111827;text-decoration:none;">${title}</a>
        </h2>
        ${
          excerpt
            ? `<p style="margin:0 0 20px 0;font-size:15px;line-height:1.7;color:#4b5563;">${excerpt}</p>`
            : ""
        }
        <a href="${blogUrl}"
           style="display:inline-block;background:#111827;color:#ffffff;font-size:15px;font-weight:600;
                  text-decoration:none;padding:13px 26px;border-radius:10px;">
          Read the full article
        </a>
        <p style="margin:18px 0 0 0;font-size:13px;color:#6b7280;word-break:break-all;">
          Or open this link: <a href="${blogUrl}" style="color:#111827;">${escapeHtml(blogUrl)}</a>
        </p>
      </td>
    </tr>
  </table>

</div>`.trim();
};

const useNewsletterStore = create((set, get) => ({
  activeTab: "compose",
  setActiveTab: (tab) => set({ activeTab: tab }),

  stats: {
    totalSubscribers: 0,
    sentThisMonth: 0,
    avgOpenRate: 0,
    scheduled: 0,
    nextScheduled: null,
  },
  statsLoading: false,
  fetchStats: async () => {
    set({ statsLoading: true });
    try {
      const [subscribers, history] = await Promise.all([
        getSubscribers(),
        getHistory(),
      ]);
      const now = new Date();
      const list = Array.isArray(history) ? history : [];

      const sentThisMonth = list.filter((h) => {
        if (!h.sent_at) return false;
        const d = new Date(h.sent_at);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }).length;

      const scheduled = list.filter((h) => h.status === "SCHEDULED").length;

      set({
        stats: {
          totalSubscribers: Array.isArray(subscribers) ? subscribers.length : 0,
          sentThisMonth,
          avgOpenRate: 0,
          scheduled,
          nextScheduled: null,
        },
        statsLoading: false,
      });
    } catch (e) {
      console.warn(
        `[stats] ${e?.status} — ${e?.message}\n${e?.raw || "(empty body)"}`,
      );
      set({ statsLoading: false });
    }
  },

  subscribers: [],
  subscribersLoading: false,
  subscriberSearch: "",
  selectedSubscribers: [],

  fetchSubscribers: async () => {
    set({ subscribersLoading: true });
    try {
      const data = await getSubscribers();
      set({ subscribers: data || [], subscribersLoading: false });
    } catch (e) {
      console.warn(
        `[subscribers] ${e?.status} — ${e?.message}\n${e?.raw || "(empty body)"}`,
      );
      set({ subscribersLoading: false });
    }
  },

  searchSubscribersList: async (query) => {
    set({ subscribersLoading: true, subscriberSearch: query });
    try {
      const data = query.trim()
        ? await searchSubscribers(query)
        : await getSubscribers();
      set({ subscribers: data || [], subscribersLoading: false });
    } catch (e) {
      console.warn(
        `[search] ${e?.status} — ${e?.message}\n${e?.raw || "(empty body)"}`,
      );
      set({ subscribersLoading: false });
    }
  },

  setSubscriberSearch: (val) => get().searchSubscribersList(val),

  removeSubscriber: async (subscriberId) => {
    const previous = get().subscribers;
    set({ subscribers: previous.filter((s) => s.id !== subscriberId) });
    try {
      await deleteSubscriber(subscriberId);
      get().fetchStats();
      return true;
    } catch (e) {
      console.warn(
        `[delete-sub] ${e?.status} — ${e?.message}\n${e?.raw || "(empty body)"}`,
      );
      set({ subscribers: previous });
      return false;
    }
  },

  // Selecting subscribers flows straight into Compose: a non-empty selection
  // flips the audience to "selected", an empty one back to "all".
  toggleSubscriber: (id) => {
    const selected = get().selectedSubscribers;
    const next = selected.includes(id)
      ? selected.filter((s) => s !== id)
      : [...selected, id];
    set((state) => ({
      selectedSubscribers: next,
      composeForm: {
        ...state.composeForm,
        audience: next.length > 0 ? "selected" : "all",
      },
    }));
  },

  toggleAllSubscribers: (visibleIds) => {
    const { selectedSubscribers } = get();
    const allSelected = visibleIds.every((id) =>
      selectedSubscribers.includes(id),
    );
    const next = allSelected
      ? selectedSubscribers.filter((id) => !visibleIds.includes(id))
      : Array.from(new Set([...selectedSubscribers, ...visibleIds]));
    set((state) => ({
      selectedSubscribers: next,
      composeForm: {
        ...state.composeForm,
        audience: next.length > 0 ? "selected" : "all",
      },
    }));
  },

  clearSelectedSubscribers: () =>
    set((state) => ({
      selectedSubscribers: [],
      composeForm: { ...state.composeForm, audience: "all" },
    })),

  exportCsv: async () => {
    try {
      await exportSubscribersCsv();
      return true;
    } catch (e) {
      console.warn(`[export] ${e?.status} — ${e?.message}`);
      return false;
    }
  },

  composeForm: {
    subject: "",
    content: "",
    audience: "all",
    scheduleEnabled: false,
    scheduleDate: "",
  },
  sending: false,
  sendingTest: false,
  recipientsCount: 0,

  testEmail: "",
  setTestEmail: (email) => set({ testEmail: email }),

  setComposeField: (field, value) =>
    set((state) => ({ composeForm: { ...state.composeForm, [field]: value } })),

  loadTemplateIntoCompose: (template) =>
    set((state) => ({
      composeForm: {
        ...state.composeForm,
        subject: template.subject || "",
        content: template.body || "",
      },
      activeTab: "compose",
    })),

  fetchRecipientsCount: async () => {
    const { composeForm, selectedSubscribers } = get();
    try {
      const data = await getRecipientsCount(
        composeForm.audience === "selected" ? "SELECTED" : "ALL",
        composeForm.audience === "selected" ? selectedSubscribers : [],
      );
      set({ recipientsCount: data?.count ?? 0 });
    } catch (e) {
      console.warn(
        `[recipients] ${e?.status} — ${e?.message}\n${e?.raw || "(empty body)"}`,
      );
    }
  },

  sendNewsletterNow: async () => {
    // latestBlog must come from the store — it was referenced without being
    // read here, which threw a ReferenceError before the request ever fired.
    const { composeForm, selectedSubscribers, latestBlog } = get();

    if (!composeForm.subject.trim() || !composeForm.content.trim()) {
      return { ok: false, error: "Subject and content are both required." };
    }
    if (
      composeForm.audience === "selected" &&
      selectedSubscribers.length === 0
    ) {
      return { ok: false, error: "Select at least one subscriber first." };
    }
    if (composeForm.scheduleEnabled && !composeForm.scheduleDate) {
      return { ok: false, error: "Pick a date and time to schedule." };
    }

    set({ sending: true });
    try {
      const campaign = await createCampaign({
        subject: composeForm.subject,
        body: composeForm.content,
        audience_type: composeForm.audience === "selected" ? "SELECTED" : "ALL",
        // [] not null — the backend schema rejects null with a 422.
        subscriber_ids:
          composeForm.audience === "selected" ? selectedSubscribers : [],
        scheduled_for: composeForm.scheduleEnabled
          ? composeForm.scheduleDate
          : null,
        blog_url:
          absoluteBlogUrl(latestBlog?.url || latestBlog?.blog_url) || null,
      });

      const campaignId = campaign?.id ?? campaign?.campaign_id ?? campaign?._id;

      if (!composeForm.scheduleEnabled) {
        if (!campaignId) {
          console.warn("[campaign] created but no id on response:", campaign);
          set({ sending: false });
          return {
            ok: false,
            error:
              "Campaign was created but the server returned no id, so it couldn't be sent.",
          };
        }
        const result = await sendCampaignNow(campaignId);
        console.warn("[campaign-send] server responded:", result);
      }

      set({ sending: false });
      get().fetchHistory();
      get().fetchStats();
      return { ok: true, scheduled: composeForm.scheduleEnabled };
    } catch (e) {
      console.warn(
        `[campaign] ${e?.status} — ${e?.message}\n${e?.raw || "(empty body)"}`,
      );
      set({ sending: false });
      return {
        ok: false,
        error: e?.message || "Couldn't send the newsletter.",
      };
    }
  },

  // POST /send-test requires `email` on the body.
  sendTest: async (email) => {
    const { composeForm, testEmail } = get();
    const to = String(email ?? testEmail ?? "").trim();

    if (!composeForm.subject.trim() || !composeForm.content.trim()) {
      return { ok: false, error: "Subject and content are both required." };
    }
    if (!to) {
      return {
        ok: false,
        error: "Enter an email address to send the test to.",
      };
    }

    set({ sendingTest: true });
    try {
      await sendTestEmail({
        email: to,
        subject: composeForm.subject,
        body: composeForm.content,
      });
      set({ sendingTest: false, testEmail: to });
      return { ok: true };
    } catch (e) {
      console.warn(
        `[send-test] ${e?.status} — ${e?.message}\n${e?.raw || "(empty body)"}`,
      );
      set({ sendingTest: false });
      return {
        ok: false,
        error: e?.message || "Couldn't send the test email.",
      };
    }
  },

  // ───────────────────────────────────────────────
  // Blog integration
  // ───────────────────────────────────────────────
  latestBlog: null,
  blogLoading: false,
  blogError: null,
  autoSendOnBlog: false,

  fetchLatestBlog: async () => {
    set({ blogLoading: true, blogError: null });

    const [blogRes, settingRes] = await Promise.allSettled([
      getBlogPreview(),
      getBlogSetting(),
    ]);

    const next = { blogLoading: false };

    if (blogRes.status === "fulfilled") {
      next.latestBlog = blogRes.value || null;
      next.blogError = null;
    } else {
      const err = blogRes.reason;
      next.latestBlog = null;
      next.blogError =
        err?.status === 404
          ? null
          : err?.message || "Couldn't load the latest blog post.";
      console.warn(
        `[blog-preview] ${err?.status} — ${err?.message}\n${err?.raw || "(empty body)"}`,
      );
    }

    if (settingRes.status === "fulfilled") {
      next.autoSendOnBlog = Boolean(settingRes.value?.enabled);
    } else {
      const err = settingRes.reason;
      next.autoSendOnBlog = false;
      console.warn(
        `[blog-setting] ${err?.status} — ${err?.message}\n${err?.raw || "(empty body)"}`,
      );
    }

    set(next);
  },

  fetchBlogMetadata: async (url) => {
    set({ blogLoading: true, blogError: null });
    try {
      const data = await parseBlogUrl(url);
      // Remember the URL the user actually pasted — it's the reliable link.
      set({
        latestBlog: { ...data, url: data?.url || url },
        blogLoading: false,
      });
      return data;
    } catch (e) {
      console.warn(
        `[parse-blog] ${e?.status} — ${e?.message}\n${e?.raw || "(empty body)"}`,
      );
      set({
        blogLoading: false,
        blogError: e?.message || "Could not fetch blog details",
      });
      return null;
    }
  },

  toggleAutoSend: async () => {
    const next = !get().autoSendOnBlog;
    set({ autoSendOnBlog: next });
    try {
      await updateBlogSetting(next);
      return true;
    } catch (e) {
      console.warn(
        `[auto-send] ${e?.status} — ${e?.message}\n${e?.raw || "(empty body)"}`,
      );
      set({ autoSendOnBlog: !next, blogError: e.message });
      return false;
    }
  },

  /**
   * Sends the blog announcement. The email carries THREE things:
   *   1. the Compose tab's Email Content (your message)
   *   2. the blog card — image, title, excerpt
   *   3. a clickable link to the post (button + plain URL fallback)
   * The subject is the Compose tab's Subject Line, falling back to the title.
   */
  sendBlogToSubscribers: async () => {
    const { latestBlog, composeForm, selectedSubscribers } = get();

    if (!latestBlog) {
      set({ blogError: "There's no blog post to send yet." });
      return { ok: false, error: "Paste a blog link and fetch it first." };
    }

    const blogUrl = absoluteBlogUrl(latestBlog.url || latestBlog.blog_url);

    if (!blogUrl) {
      set({ blogError: "This blog has no link to send." });
      return { ok: false, error: "This blog has no link to send." };
    }

    const useSelected =
      composeForm.audience === "selected" && selectedSubscribers.length > 0;

    set({ sending: true, blogError: null });

    try {
      const campaign = await createCampaign({
        subject: composeForm.subject.trim() || `New Blog: ${latestBlog.title}`,
        body: buildBlogEmailHtml({
          content: composeForm.content,
          blog: latestBlog,
          blogUrl,
        }),
        audience_type: useSelected ? "SELECTED" : "ALL",
        subscriber_ids: useSelected ? selectedSubscribers : [],
        scheduled_for: null,
        blog_url: blogUrl,
        auto_send: true,
      });

      const campaignId = campaign?.id ?? campaign?.campaign_id ?? campaign?._id;

      if (!campaignId) {
        console.warn(
          "[blog-campaign] created but no id on response:",
          campaign,
        );
        set({
          sending: false,
          blogError: "Server didn't return a campaign id.",
        });
        return { ok: false, error: "Server didn't return a campaign id." };
      }

      const result = await sendCampaignNow(campaignId);
      console.warn("[blog-campaign-send] server responded:", result);

      set({ sending: false });
      get().fetchHistory();
      get().fetchStats();
      return { ok: true, recipients: result?.recipients };
    } catch (e) {
      console.warn(
        `[blog-send] ${e?.status} — ${e?.message}\n${e?.raw || "(empty body)"}`,
      );
      set({
        sending: false,
        blogError: e?.message || "Couldn't send blog newsletter.",
      });
      return {
        ok: false,
        error: e?.message || "Couldn't send blog newsletter.",
      };
    }
  },

  // ───────────────────────────────────────────────
  // Templates
  // ───────────────────────────────────────────────
  templates: [],
  templatesLoading: false,
  templatesLoaded: false,
  savingTemplate: false,
  templateError: null,

  fetchTemplates: async () => {
    set({ templatesLoading: true });
    try {
      const data = await getTemplates();
      set({
        templates: Array.isArray(data) ? data : [],
        templatesLoading: false,
        templatesLoaded: true,
      });
    } catch (e) {
      console.warn(
        `[templates] ${e?.status} — ${e?.message}\n${e?.raw || "(empty body)"}`,
      );
      set({
        templatesLoading: false,
        templatesLoaded: true,
        templateError: e?.message || "Couldn't load templates.",
      });
    }
  },

  addTemplate: async (payload) => {
    set({ savingTemplate: true, templateError: null });
    try {
      const newTemplate = await createTemplate(payload);
      set((state) => ({
        templates: [newTemplate, ...state.templates],
        savingTemplate: false,
      }));
      return true;
    } catch (e) {
      console.warn(
        `[create-template] ${e?.status} — ${e?.message}\n${e?.raw || "(empty body)"}`,
      );
      set({
        savingTemplate: false,
        templateError: e?.message || "Couldn't save the template.",
      });
      return false;
    }
  },

  clearTemplateError: () => set({ templateError: null }),

  history: [],
  historyLoading: false,
  fetchHistory: async () => {
    set({ historyLoading: true });
    try {
      const data = await getHistory();
      set({ history: data || [], historyLoading: false });
    } catch (e) {
      console.warn(
        `[history] ${e?.status} — ${e?.message}\n${e?.raw || "(empty body)"}`,
      );
      set({ historyLoading: false });
    }
  },

  deleteHistoryItem: (index) => {
    set((state) => ({ history: state.history.filter((_, i) => i !== index) }));
  },

  signupForm: { heading: "", intro: "", bullets: [], button_text: "Subscribe" },
  signupFormLoading: false,
  savingSignupForm: false,

  fetchSignupForm: async () => {
    set({ signupFormLoading: true });
    try {
      const data = await getSignupForm();
      set({
        signupForm: {
          heading: data?.heading || "",
          intro: data?.intro || "",
          bullets: Array.isArray(data?.bullets) ? data.bullets : [],
          button_text: data?.button_text || "Subscribe",
        },
        signupFormLoading: false,
      });
    } catch (e) {
      console.warn(
        `[signup-form] ${e?.status} — ${e?.message}\n${e?.raw || "(empty body)"}`,
      );
      set({ signupFormLoading: false });
    }
  },

  setSignupField: (field, value) =>
    set((state) => ({ signupForm: { ...state.signupForm, [field]: value } })),

  setSignupBullets: (bulletsText) =>
    set((state) => ({
      signupForm: {
        ...state.signupForm,
        bullets: bulletsText.split("\n").filter((b) => b.trim() !== ""),
      },
    })),

  saveSignupForm: async () => {
    set({ savingSignupForm: true });
    try {
      await updateSignupForm(get().signupForm);
      set({ savingSignupForm: false });
      return true;
    } catch (e) {
      console.warn(
        `[save-signup] ${e?.status} — ${e?.message}\n${e?.raw || "(empty body)"}`,
      );
      set({ savingSignupForm: false });
      return false;
    }
  },
}));

export default useNewsletterStore;
