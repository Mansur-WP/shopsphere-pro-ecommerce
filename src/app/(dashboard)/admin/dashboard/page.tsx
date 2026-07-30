import {
  AdminStatsCard,
} from "@/components/admin/admin-stats-card";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";
import { RecentActivity } from "@/components/admin/recent-activity";
import {
  getAdminRecentActivity,
  getAdminStats,
  getPlatformAnalytics,
} from "@/actions/admin";
import { formatCurrency } from "@/lib/format";

export default async function AdminDashboardPage() {
  let stats = null;
  let activity: Awaited<ReturnType<typeof getAdminRecentActivity>> = [];
  let analytics = null;

  try {
    [stats, activity, analytics] = await Promise.all([
      getAdminStats(),
      getAdminRecentActivity(8),
      getPlatformAnalytics(14),
    ]);
  } catch (error) {
    console.error("[admin/dashboard] failed to load data:", error);
  }

  const cards = stats
    ? [
        {
          label: "Total users",
          value: stats.totalUsers,
          description: "All accounts",
          icon: "users" as const,
          href: "/admin/users",
        },
        {
          label: "Sellers",
          value: stats.totalSellers,
          description: `${stats.pendingSellers} pending`,
          icon: "store" as const,
          href: "/admin/sellers",
        },
        {
          label: "Products",
          value: stats.totalProducts,
          description: `${stats.publishedProducts} published`,
          icon: "package" as const,
          href: "/admin/products",
        },
        {
          label: "Orders",
          value: stats.totalOrders,
          description: `${stats.pendingOrders} pending`,
          icon: "orders" as const,
          href: "/admin/orders",
        },
        {
          label: "Revenue",
          value: formatCurrency(stats.totalRevenue),
          description: "Paid orders",
          icon: "revenue" as const,
          href: "/admin/analytics",
        },
        {
          label: "Pending sellers",
          value: stats.pendingSellers,
          description: "Awaiting review",
          icon: "clock" as const,
          href: "/admin/sellers?status=PENDING",
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-2xl font-bold">Platform overview</h2>
        <p className="text-muted-foreground">
          Monitor marketplace health and recent activity.
        </p>
      </div>

      <AdminStatsCard cards={cards} />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          {analytics ? (
            <AnalyticsCharts
              chartData={analytics.chartData}
              userGrowth={analytics.userGrowth}
              topSellers={analytics.topSellers}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-border/70 p-12 text-center text-muted-foreground">
              Unable to load charts.
            </div>
          )}
        </div>
        <div className="lg:col-span-2">
          <RecentActivity activities={activity} />
        </div>
      </div>
    </div>
  );
}
