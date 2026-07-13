"use client";

import { FiUsers, FiSend, FiTrendingUp, FiCalendar } from "react-icons/fi";

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 flex items-start justify-between">
      <div className="min-w-0">
        <p className="text-xs sm:text-sm text-gray-500 truncate">{label}</p>
        <p className="text-xl sm:text-2xl font-semibold text-gray-900 mt-1">
          {value}
        </p>
        {sub && <p className="text-xs text-gray-400 mt-1 truncate">{sub}</p>}
      </div>
      <div className="w-9 h-9 shrink-0 rounded-lg bg-gray-100 flex items-center justify-center">
        {icon}
      </div>
    </div>
  );
}

export default function StatsCards({ stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <StatCard
        icon={<FiUsers className="text-gray-600" size={16} />}
        label="Total Subscribers"
        value={(stats.totalSubscribers ?? 0).toLocaleString()}
        sub={
          stats.subscribersGrowth != null
            ? `+${stats.subscribersGrowth}%`
            : null
        }
      />
      <StatCard
        icon={<FiSend className="text-gray-600" size={16} />}
        label="Sent This Month"
        value={stats.sentThisMonth ?? 0}
        sub={stats.sentGrowth != null ? `+${stats.sentGrowth}` : null}
      />
      <StatCard
        icon={<FiTrendingUp className="text-gray-600" size={16} />}
        label="Avg Open Rate"
        value={`${stats.avgOpenRate ?? 0}%`}
        sub={stats.openRateGrowth != null ? `+${stats.openRateGrowth}%` : null}
      />
      <StatCard
        icon={<FiCalendar className="text-gray-600" size={16} />}
        label="Scheduled"
        value={stats.scheduled ?? 0}
        sub={stats.nextScheduled ? `Next: ${stats.nextScheduled}` : null}
      />
    </div>
  );
}
