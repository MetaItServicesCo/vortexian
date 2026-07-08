// Static/mock data — replace with real API calls later via lib/api/newsletter.js
// Structure intentionally matches what the FastAPI backend will eventually return.

export const mockStats = {
    totalSubscribers: 1248,
    subscribersGrowth: 12.4,
    sentThisMonth: 4,
    sentGrowth: 2,
    avgOpenRate: 48.2,
    openRateGrowth: 3.1,
    scheduled: 2,
    nextScheduled: "Fri 9:00",
};

export const mockSubscribers = [
    { id: "1", name: "Ayesha Khan", email: "ayesha.khan@corp.pk", subscriptionDate: "Jan 14, 2025", status: "Active" },
    { id: "2", name: "Bilal Ahmed", email: "bilal@hrhub.io", subscriptionDate: "Feb 3, 2025", status: "Active" },
    { id: "3", name: "Sana Riaz", email: "sana.r@peoplefirst.com", subscriptionDate: "Mar 22, 2025", status: "Active" },
    { id: "4", name: "Usman Tariq", email: "usman.t@talentco.pk", subscriptionDate: "Apr 11, 2025", status: "Active" },
    { id: "5", name: "Fatima Noor", email: "fatima.noor@hrinsights.com", subscriptionDate: "May 1, 2025", status: "Active" },
    { id: "6", name: "Hamza Sheikh", email: "hamza@recruitpro.io", subscriptionDate: "May 19, 2025", status: "Active" },
    { id: "7", name: "Zara Iqbal", email: "zara.iqbal@peoplex.com", subscriptionDate: "Jun 8, 2025", status: "Active" },
    { id: "8", name: "Ali Raza", email: "ali.raza@hrconnect.pk", subscriptionDate: "Jun 25, 2025", status: "Active" },
];

export const mockTemplates = [
    {
        id: "1",
        name: "New Blog Alert",
        description: "Auto-fill blog title, cover & link.",
        category: "Editorial",
        subject: "New Blog: {{title}}",
        content: "Hi {{name}},\n\nWe just published a new article: {{title}}\n\nRead the full article on our blog.\n\n— The People Team",
    },
    {
        id: "2",
        name: "HR Industry Update",
        description: "Weekly trends & regulation news.",
        category: "Insightful",
        subject: "This Week in HR: Key Updates",
        content: "Hi {{name}},\n\nHere's what's new in HR this week — trends, regulation changes, and insights worth knowing.\n\n— The People Team",
    },
    {
        id: "3",
        name: "Company Announcement",
        description: "Internal updates & milestones.",
        category: "Official",
        subject: "Company Announcement",
        content: "Hi {{name}},\n\nWe have an important update to share with you today.\n\n— The People Team",
    },
    {
        id: "4",
        name: "New Service Launch",
        description: "Highlight a new product or offer.",
        category: "Promotional",
        subject: "Introducing: Our New Service",
        content: "Hi {{name}},\n\nWe're excited to announce a brand-new service designed to make your work easier.\n\n— The People Team",
    },
];

export const mockHistory = [
    { sentDate: "Jun 28, 2026", subject: "June HR Digest: New Labour Law Updates", recipients: 1248, status: "Delivered" },
    { sentDate: "Jun 28, 2026", subject: "June HR Digest: New Labour Law Updates", recipients: 1248, status: "Delivered" },

    { sentDate: "Jun 14, 2026", subject: "New Blog: 7 Retention Strategies That Work", recipients: 1210, status: "Delivered" },
    { sentDate: "May 30, 2026", subject: "Company Announcement: Q2 Results", recipients: 1180, status: "Delivered" },
    { sentDate: "May 16, 2026", subject: "New Service Launch — Payroll Automation", recipients: 1155, status: "Delivered" },
];

export const mockSignupForm = {
    heading: "Stay Updated with HR Insights",
    introLine: "Subscribe to receive:",
    bullets: [
        "HR News & Updates",
        "Recruitment Tips",
        "Compliance Updates",
        "Industry Trends",
        "New Service Announcements",
    ],
};

export const mockLatestBlog = {
    title: "7 Retention Strategies That Actually Work in 2026",
    coverImage: null,
    publishedAgo: "2 hours ago",
    readTime: 6,
};