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
            const [subscribers, history] = await Promise.all([getSubscribers(), getHistory()]);
            const now = new Date();

            const list = Array.isArray(history) ? history : [];

            const sentThisMonth = list.filter((h) => {
                if (!h.sent_at) return false;
                const d = new Date(h.sent_at);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
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
            console.warn(`[stats] ${e?.status} — ${e?.message}\n${e?.raw || "(empty body)"}`);
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
            console.warn(`[subscribers] ${e?.status} — ${e?.message}\n${e?.raw || "(empty body)"}`);
            set({ subscribersLoading: false });
        }
    },

    searchSubscribersList: async (query) => {
        set({ subscribersLoading: true, subscriberSearch: query });
        try {
            const data = query.trim() ? await searchSubscribers(query) : await getSubscribers();
            set({ subscribers: data || [], subscribersLoading: false });
        } catch (e) {
            console.warn(`[search] ${e?.status} — ${e?.message}\n${e?.raw || "(empty body)"}`);
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
            console.warn(`[delete-sub] ${e?.status} — ${e?.message}\n${e?.raw || "(empty body)"}`);
            set({ subscribers: previous });
            return false;
        }
    },

    // Selecting subscribers now flows straight into Compose: any non-empty
    // selection flips the audience to "selected", empty selection back to "all".
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
        const allSelected = visibleIds.every((id) => selectedSubscribers.includes(id));
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

    // address used by "Send Test"
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
                composeForm.audience === "selected" ? selectedSubscribers : []
            );
            set({ recipientsCount: data?.count ?? 0 });
        } catch (e) {
            console.warn(`[recipients] ${e?.status} — ${e?.message}\n${e?.raw || "(empty body)"}`);
        }
    },

    sendNewsletterNow: async () => {
        const { composeForm, selectedSubscribers } = get();

        // client-side guardrails so we never create empty/invalid campaigns
        if (!composeForm.subject.trim() || !composeForm.content.trim()) {
            return { ok: false, error: "Subject and content are both required." };
        }
        if (composeForm.audience === "selected" && selectedSubscribers.length === 0) {
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
                subscriber_ids: composeForm.audience === "selected" ? selectedSubscribers : null,
                scheduled_for: composeForm.scheduleEnabled ? composeForm.scheduleDate : null,
            });

            // Campaign shows in History because create succeeded. But if the id key
            // isn't `id`, the send call would hit /campaign/undefined/send and the
            // email would silently never go out.
            const campaignId = campaign?.id ?? campaign?.campaign_id ?? campaign?._id;

            if (!composeForm.scheduleEnabled) {
                if (!campaignId) {
                    console.warn("[campaign] created but no id on response:", campaign);
                    set({ sending: false });
                    return {
                        ok: false,
                        error:
                            "Campaign was created but the server didn't return its id, so it couldn't be sent.",
                    };
                }
                // Log the send result: if this is 200 but no email arrives, the
                // problem is the backend's email/SMTP dispatch, not the frontend.
                const result = await sendCampaignNow(campaignId);
                console.warn("[campaign-send] server responded:", result);
            }

            set({ sending: false });
            get().fetchHistory();
            get().fetchStats();
            return { ok: true, scheduled: composeForm.scheduleEnabled };
        } catch (e) {
            console.warn(`[campaign] ${e?.status} — ${e?.message}\n${e?.raw || "(empty body)"}`);
            set({ sending: false });
            return { ok: false, error: e?.message || "Couldn't send the newsletter." };
        }
    },

    // POST /send-test requires `email` on the body — that was the 422.
    sendTest: async (email) => {
        const { composeForm, testEmail } = get();
        const to = String(email ?? testEmail ?? "").trim();

        if (!composeForm.subject.trim() || !composeForm.content.trim()) {
            return { ok: false, error: "Subject and content are both required." };
        }
        if (!to) {
            return { ok: false, error: "Enter an email address to send the test to." };
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
            console.warn(`[send-test] ${e?.status} — ${e?.message}\n${e?.raw || "(empty body)"}`);
            set({ sendingTest: false });
            return { ok: false, error: e?.message || "Couldn't send the test email." };
        }
    },

    // ───────────────────────────────────────────────
    // Blog integration
    // ───────────────────────────────────────────────
    latestBlog: null,
    blogLoading: false,
    blogError: null,
    autoSendOnBlog: false,

    /**
     * Promise.all rejected the whole block if either request failed, so a
     * missing blog post took the entire tab down with it. allSettled lets the
     * two requests fail independently.
     */
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
            // 404 just means nothing is published yet — an empty state, not a failure.
            next.blogError =
                err?.status === 404 ? null : err?.message || "Couldn't load the latest blog post.";

            console.warn(
                `[blog-preview] ${err?.status} — ${err?.message}\n${err?.raw || "(empty body)"}`
            );
        }

        if (settingRes.status === "fulfilled") {
            next.autoSendOnBlog = Boolean(settingRes.value?.enabled);
        } else {
            const err = settingRes.reason;
            next.autoSendOnBlog = false;
            console.warn(
                `[blog-setting] ${err?.status} — ${err?.message}\n${err?.raw || "(empty body)"}`
            );
        }

        set(next);
    },

    // Uses the API layer now (parseBlogUrl) instead of undefined authHeaders/handleRes.
    // Requires a backend /parse-blog route, which isn't in the current Swagger.
    fetchBlogMetadata: async (url) => {
        set({ blogLoading: true, blogError: null });
        try {
            const data = await parseBlogUrl(url);
            set({ latestBlog: data, blogLoading: false });
            return data;
        } catch (e) {
            console.warn(`[parse-blog] ${e?.status} — ${e?.message}\n${e?.raw || "(empty body)"}`);
            set({ blogLoading: false, blogError: "Could not fetch blog details" });
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
            console.warn(`[auto-send] ${e?.status} — ${e?.message}\n${e?.raw || "(empty body)"}`);
            set({ autoSendOnBlog: !next, blogError: e.message });
            return false;
        }
    },

    sendBlogToSubscribers: async () => {
        const { latestBlog } = get();
        if (!latestBlog) {
            set({ blogError: "There's no blog post to send yet." });
            return false;
        }

        set({ sending: true, blogError: null });
        try {
            const campaign = await createCampaign({
                subject: `New Blog: ${latestBlog.title}`,
                body: `Hi {{name}},\n\nCheck out our latest article: ${latestBlog.title}\n\nRead it on our blog.`,
                audience_type: "ALL",
                subscriber_ids: null,
                scheduled_for: null,
                blog_url: latestBlog.url || latestBlog.blog_url || null,
                auto_send: true,
            });

            const campaignId = campaign?.id ?? campaign?.campaign_id ?? campaign?._id;
            if (!campaignId) {
                console.warn("[blog-campaign] created but no id on response:", campaign);
                set({ sending: false, blogError: "Server didn't return a campaign id." });
                return false;
            }

            const result = await sendCampaignNow(campaignId);
            console.warn("[blog-campaign-send] server responded:", result);

            set({ sending: false });
            get().fetchHistory();
            get().fetchStats();
            return true;
        } catch (e) {
            console.warn(`[blog-send] ${e?.status} — ${e?.message}\n${e?.raw || "(empty body)"}`);
            set({ sending: false, blogError: e.message });
            return false;
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
            console.warn(`[templates] ${e?.status} — ${e?.message}\n${e?.raw || "(empty body)"}`);
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
                `[create-template] ${e?.status} — ${e?.message}\n${e?.raw || "(empty body)"}`
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
            console.warn(`[history] ${e?.status} — ${e?.message}\n${e?.raw || "(empty body)"}`);
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
            console.warn(`[signup-form] ${e?.status} — ${e?.message}\n${e?.raw || "(empty body)"}`);
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
            console.warn(`[save-signup] ${e?.status} — ${e?.message}\n${e?.raw || "(empty body)"}`);
            set({ savingSignupForm: false });
            return false;
        }
    },
}));

export default useNewsletterStore;