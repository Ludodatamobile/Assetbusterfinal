// admin/app/(dashboard)/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Building2, Handshake, ShieldAlert, Users } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  getAnalyticsOverview,
  getDealStats,
  getListingStats,
  getRecentActivity,
  getUserStats,
} from "@/services/admin/admin.service";
import type { ActivityItem, StatsRecord } from "@/types/admin";
import { formatNumber, formatShortDate, titleCase } from "@/lib/utils";
import { statValue } from "@/lib/response";

export default function AdminOverviewPage() {
  const [userStats, setUserStats] = useState<StatsRecord>({});
  const [listingStats, setListingStats] = useState<StatsRecord>({});
  const [dealStats, setDealStats] = useState<StatsRecord>({});
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");

      const [users, listings, deals, overview, recent] = await Promise.allSettled([
        getUserStats(),
        getListingStats(),
        getDealStats(),
        getAnalyticsOverview(),
        getRecentActivity(),
      ]);

      if (!active) return;

      if (users.status === "fulfilled") setUserStats(users.value);
      if (listings.status === "fulfilled") setListingStats(listings.value);
      if (deals.status === "fulfilled") setDealStats(deals.value);
      if (overview.status === "fulfilled" && overview.value.recentActivity) setActivity(overview.value.recentActivity);
      if (recent.status === "fulfilled") setActivity(recent.value);

      const failed = [users, listings, deals, overview, recent].some((result) => result.status === "rejected");
      if (failed) setError("Some admin metrics could not be loaded. Check the API response shape or backend availability.");
      setLoading(false);
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Marketplace command"
        title="Admin Overview"
        description="A focused view of users, listings, deal flow, moderation queues, and recent platform activity."
      />

      {error && <div className="alert alert-warning">{error}</div>}

      <section className="stat-grid">
        <StatCard
          icon={Users}
          label="Total users"
          value={loading ? "..." : formatNumber(statValue(userStats, ["total", "totalUsers", "users"]))}
          detail={`${formatNumber(statValue(userStats, ["active", "activeUsers"]))} active accounts`}
          trend="Live"
          trendDirection="up"
        />
        <StatCard
          icon={Building2}
          label="Listings"
          value={loading ? "..." : formatNumber(statValue(listingStats, ["total", "totalListings", "listings"]))}
          detail={`${formatNumber(statValue(listingStats, ["pending", "pendingReview", "PENDING_REVIEW"]))} awaiting review`}
          trend="Review queue"
          trendDirection="neutral"
        />
        <StatCard
          icon={Handshake}
          label="Deals"
          value={loading ? "..." : formatNumber(statValue(dealStats, ["total", "totalDeals", "deals"]))}
          detail={`${formatNumber(statValue(dealStats, ["closed", "CLOSED"]))} closed deals`}
          trend="Pipeline"
          trendDirection="up"
        />
        <StatCard
          icon={ShieldAlert}
          label="Trust actions"
          value={loading ? "..." : formatNumber(statValue(userStats, ["suspended", "SUSPENDED"]))}
          detail="Suspended or restricted users"
          trend="Risk"
          trendDirection="down"
        />
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="page-eyebrow">Operational queues</p>
              <h2>Admin attention</h2>
            </div>
          </div>
          <div className="queue-list">
            <div className="queue-item">
              <span>Pending users</span>
              <strong>{formatNumber(statValue(userStats, ["pending", "PENDING"]))}</strong>
            </div>
            <div className="queue-item">
              <span>Listings in review</span>
              <strong>{formatNumber(statValue(listingStats, ["pendingReview", "pending", "PENDING_REVIEW"]))}</strong>
            </div>
            <div className="queue-item">
              <span>Rejected listings</span>
              <strong>{formatNumber(statValue(listingStats, ["rejected", "REJECTED"]))}</strong>
            </div>
            <div className="queue-item">
              <span>Deals in due diligence</span>
              <strong>{formatNumber(statValue(dealStats, ["dueDiligence", "DUE_DILIGENCE"]))}</strong>
            </div>
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="page-eyebrow">Recent activity</p>
              <h2>Marketplace events</h2>
            </div>
            <StatusBadge value="ACTIVE" />
          </div>

          <div className="activity-list">
            {activity.length ? (
              activity.slice(0, 7).map((item) => (
                <div key={item.id} className="activity-item">
                  <span className="activity-dot" />
                  <div>
                    <strong>{item.title ?? titleCase(item.type)}</strong>
                    <p>{item.description ?? item.actor ?? "Activity recorded"}</p>
                  </div>
                  <time>{formatShortDate(item.createdAt)}</time>
                </div>
              ))
            ) : (
              <div className="empty-panel">
                <strong>No recent activity yet</strong>
                <span>When the analytics endpoint returns events, they will appear here.</span>
              </div>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}