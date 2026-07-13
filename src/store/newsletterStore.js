import { create } from "zustand";
import {
    mockStats,
    mockSubscribers,
    mockTemplates,
    mockHistory,
    mockSignupForm,
    mockLatestBlog,
} from "@/lib/mockData/newsletter";

// STATIC MODE: sab "fetch*" functions abhi mock data se load karte
// hain (chota artificial delay hai taake loading states real feel
// den). Jab FastAPI ready ho, "lib/api/newsletter.js" ke functions
// use kar lein — component files mein koi change nahi karna paray ga.

const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));

let historyStore = [...mockHistory];
let subscribersStore = [...mockSubscribers];
let signupFormStore = { ...mockSignupForm };
let autoSendStore = true;

const useNewsletterStore = create((set, get) => ({
    activeTab: "compose",
    setActiveTab: (tab) => set({ activeTab: tab }),

    stats: {
        totalSubscribers: 0,
        subscribersGrowth: null,
        sentThisMonth: 0,
        sentGrowth: null,
        avgOpenRate: 0,
        openRateGrowth: null,
        scheduled: 0,
        nextScheduled: null,
    },
    statsLoading: false,
    fetchStats: async () => {
        set({ statsLoading: true });
        try {
            await delay();
            set({ stats: mockStats, statsLoading: false });
        } catch (e) {
            console.error("fetchStats error:", e);
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
            await delay();
            set({ subscribers: subscribersStore, subscribersLoading: false });
        } catch (e) {
            console.error("fetchSubscribers error:", e);
            set({ subscribersLoading: false });
        }
    },

    setSubscriberSearch: (val) => set({ subscriberSearch: val }),

    toggleSubscriber: (id) => {
        const selected = get().selectedSubscribers;
        set({
            selectedSubscribers: selected.includes(id)
                ? selected.filter((s) => s !== id)
                : [...selected, id],
        });
    },

    toggleAllSubscribers: (visibleIds) => {
        const { selectedSubscribers } = get();
        const allSelected = visibleIds.every((id) => selectedSubscribers.includes(id));
        set({
            selectedSubscribers: allSelected
                ? selectedSubscribers.filter((id) => !visibleIds.includes(id))
                : Array.from(new Set([...selectedSubscribers, ...visibleIds])),
        });
    },

    exportCsv: async () => {
        try {
            const { subscribers } = get();
            const header = "Name,Email,Subscription Date,Status\n";
            const rows = subscribers
                .map((s) => `${s.name},${s.email},${s.subscriptionDate},${s.status}`)
                .join("\n");
            const blob = new Blob([header + rows], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "subscribers.csv";
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            return true;
        } catch (e) {
            console.error("exportCsv error:", e);
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

    setComposeField: (field, value) =>
        set((state) => ({ composeForm: { ...state.composeForm, [field]: value } })),

    loadTemplateIntoCompose: (template) =>
        set((state) => ({
            composeForm: {
                ...state.composeForm,
                subject: template.subject || template.title || "",
                content: template.content || "",
            },
            activeTab: "compose",
        })),

    sendNewsletterNow: async () => {
        const { composeForm, selectedSubscribers, subscribers } = get();
        set({ sending: true });
        try {
            await delay(600);
            const recipients =
                composeForm.audience === "selected" ? selectedSubscribers.length : subscribers.length;

            historyStore = [
                {
                    sentDate: new Date().toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                    }),
                    subject: composeForm.subject,
                    recipients,
                    status: composeForm.scheduleEnabled ? "Scheduled" : "Delivered",
                },
                ...historyStore,
            ];

            set({ sending: false });
            get().fetchHistory();
            return true;
        } catch (e) {
            console.error("sendNewsletterNow error:", e);
            set({ sending: false });
            return false;
        }
    },

    sendTest: async () => {
        set({ sendingTest: true });
        try {
            await delay(500);
            set({ sendingTest: false });
            return true;
        } catch (e) {
            console.error("sendTest error:", e);
            set({ sendingTest: false });
            return false;
        }
    },

    latestBlog: null,
    blogLoading: false,
    autoSendOnBlog: false,


    // ... inside useNewsletterStore
    fetchLatestBlog: async () => {
        set({ blogLoading: true });
        try {
            await delay();
            set({ latestBlog: mockLatestBlog, autoSendOnBlog: autoSendStore, blogLoading: false });
        } catch (e) {
            console.error("fetchLatestBlog error:", e);
            set({ blogLoading: false });
        }
    },

    toggleAutoSend: async () => {
        const next = !get().autoSendOnBlog;
        set({ autoSendOnBlog: next });
        autoSendStore = next;
    },

    // ... existing code
    fetchHistory: async () => {
        set({ historyLoading: true });
        try {
            await delay();
            set({ history: historyStore, historyLoading: false });
        } catch (e) {
            console.error("fetchHistory error:", e);
            set({ historyLoading: false });
        }
    },

    // Naya Delete Function
    deleteHistoryItem: (index) => {
        historyStore = historyStore.filter((_, i) => i !== index);
        set({ history: historyStore });
    },


    sendBlogToSubscribers: async () => {
        const { latestBlog, subscribers } = get();
        if (!latestBlog) return false;
        set({ sending: true });
        try {
            await delay(600);
            historyStore = [
                {
                    sentDate: new Date().toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                    }),
                    subject: `New Blog: ${latestBlog.title}`,
                    recipients: subscribers.length,
                    status: "Delivered",
                },
                ...historyStore,
            ];
            set({ sending: false });
            get().fetchHistory();
            return true;
        } catch (e) {
            console.error("sendBlogToSubscribers error:", e);
            set({ sending: false });
            return false;
        }
    },

    templates: [],
    templatesLoading: false,
    fetchTemplates: async () => {
        set({ templatesLoading: true });
        try {
            await delay();
            set({ templates: mockTemplates, templatesLoading: false });
        } catch (e) {
            console.error("fetchTemplates error:", e);
            set({ templatesLoading: false });
        }
    },

    history: [],
    historyLoading: false,
    fetchHistory: async () => {
        set({ historyLoading: true });
        try {
            await delay();
            set({ history: historyStore, historyLoading: false });
        } catch (e) {
            console.error("fetchHistory error:", e);
            set({ historyLoading: false });
        }
    },

    signupForm: { heading: "", introLine: "", bullets: [] },
    signupFormLoading: false,
    savingSignupForm: false,

    fetchSignupForm: async () => {
        set({ signupFormLoading: true });
        try {
            await delay();
            set({ signupForm: signupFormStore, signupFormLoading: false });
        } catch (e) {
            console.error("fetchSignupForm error:", e);
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
            await delay(500);
            signupFormStore = { ...get().signupForm };
            set({ savingSignupForm: false });
            return true;
        } catch (e) {
            console.error("saveSignupForm error:", e);
            set({ savingSignupForm: false });
            return false;
        }
    },
}));

export default useNewsletterStore;