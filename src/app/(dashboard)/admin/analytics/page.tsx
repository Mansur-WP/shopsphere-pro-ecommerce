import { AdminStatsCard } from "@/components/admin/admin-stats-card";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";
import { getPlatformAnalytics } from "@/actions/admin";
import { formatCurrency } from "@/lib/format";

export default async function AdminAnalyticsPage() {
  const data = await getPlatformAnalytics(30).catch((error) => {
    console.error("[admin/analytics]", error);
    return null;
  });

  const cards = data
    ? [
        {
          label: "Revenue (30d)",
          value: formatCurrency(data.totalRevenue),
          icon: "revenue" as const,
        },
        {
          label: "Orders (30d)",
          value: data.totalOrders,
          icon: "orders" as const,
        },
        {
          label: "New users",
          value: data.newUsers,
          icon: "users" as const,
        },
        {
          label: "New sellers",
          value: data.newSellers,
          icon: "store" as const,
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-2xl font-bold">Analytics</h2>
        <p className="text-muted-foreground">
          Revenue, growth, and top seller performance.
        </p>
      </div>

      {!data ? (
        <div className="rounded-2xl border border-dashed border-border/70 p-12 text-center text-muted-foreground">
          Unable to load analytics.
        </div>
      ) : (
        <>
          <AdminStatsCard cards={cards} className="2xl:grid-cols-4" />
          <AnalyticsCharts
            chartData={data.chartData}
            userGrowth={data.userGrowth}
            topSellers={data.topSellers}
          />
        </>
      )}
    </div>
  );
}
