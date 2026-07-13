"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useNewsletterStore from "@/store/newsletterStore";
import StatsCards from "./StatsCards";
import NewsletterTabs from "./NewsletterTabs";
import ComposeTab from "./tabs/ComposeTab";
import BlogIntegrationCard from "./BlogIntegrationCard";
import SubscribersTab from "./tabs/SubscribersTab";
import TemplatesTab from "./tabs/TemplatesTab";
import HistoryTab from "./tabs/HistoryTab";
import SignupFormTab from "./tabs/SignupFormTab";

export default function NewsletterDashboard() {
  const activeTab = useNewsletterStore((s) => s.activeTab);
  const setActiveTab = useNewsletterStore((s) => s.setActiveTab);
  const stats = useNewsletterStore((s) => s.stats);

  const fetchStats = useNewsletterStore((s) => s.fetchStats);
  const fetchSubscribers = useNewsletterStore((s) => s.fetchSubscribers);
  const fetchTemplates = useNewsletterStore((s) => s.fetchTemplates);
  const fetchHistory = useNewsletterStore((s) => s.fetchHistory);
  const fetchSignupForm = useNewsletterStore((s) => s.fetchSignupForm);

  useEffect(() => {
    fetchStats();
    fetchSubscribers();
  }, [fetchStats, fetchSubscribers]);

  useEffect(() => {
    if (activeTab === "templates") fetchTemplates();
    if (activeTab === "history") fetchHistory();
    if (activeTab === "signup") fetchSignupForm();
  }, [activeTab, fetchTemplates, fetchHistory, fetchSignupForm]);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
      <StatsCards stats={stats} />
      <NewsletterTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "compose" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <ComposeTab />
              </div>
              <div className="lg:col-span-1">
                <BlogIntegrationCard />
              </div>
            </div>
          )}

          {activeTab === "subscribers" && <SubscribersTab />}
          {activeTab === "templates" && <TemplatesTab />}
          {activeTab === "history" && <HistoryTab />}
          {activeTab === "signup" && <SignupFormTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
