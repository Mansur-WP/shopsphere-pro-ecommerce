import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesChart } from "@/components/staff/sales-chart";
import { getStaffAnalytics } from "@/actions/staff";
import { formatCurrency } from "@/lib/format";

export const metadata = {
  title: "Staff Analytics",
};

export default async function StaffAnalyticsPage() {
  const data = await getStaffAnalytics(30);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold tracking-tight">
          Analytics
        </h2>
        <p className="text-muted-foreground">
          Sales over time, revenue, and product performance (last 30 days).
        </p>
      </div>

      {!data ? (
        <div className="rounded-2xl border border-dashed border-border/70 p-12 text-center text-muted-foreground">
          No analytics data yet. Sales will appear here after paid orders.
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-border/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Revenue (30d)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-heading text-2xl font-bold">
                  {formatCurrency(data.totalRevenue)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Items sold
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-heading text-2xl font-bold">
                  {data.totalItemsSold}
                </p>
              </CardContent>
            </Card>
          </div>

          <SalesChart
            data={data.chartData}
            topProducts={data.topProducts}
          />
        </>
      )}
    </div>
  );
}
