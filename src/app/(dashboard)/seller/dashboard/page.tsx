import Link from "next/link";
import {
  AlertTriangle,
  DollarSign,
  Package,
  ShoppingCart,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardCards } from "@/components/sellers/dashboard-cards";
import { SalesChart } from "@/components/sellers/sales-chart";
import {
  getSellerAnalytics,
  getSellerDashboardStats,
  getSellerRecentOrders,
} from "@/actions/seller";
import { formatCurrency } from "@/lib/format";

export const metadata = {
  title: "Seller Dashboard",
};

export default async function SellerDashboardPage() {
  const [stats, analytics, recentOrders] = await Promise.all([
    getSellerDashboardStats(),
    getSellerAnalytics(30),
    getSellerRecentOrders(5),
  ]);

  const cards = stats
    ? [
        {
          label: "Total products",
          value: stats.totalProducts,
          description: `${stats.publishedProducts} published`,
          icon: Package,
          href: "/seller/products",
        },
        {
          label: "Total orders",
          value: stats.totalOrders,
          description: "All-time orders with your items",
          icon: ShoppingCart,
          href: "/seller/orders",
        },
        {
          label: "Revenue",
          value: formatCurrency(stats.totalRevenue),
          description: "Paid order revenue",
          icon: DollarSign,
          href: "/seller/analytics",
        },
        {
          label: "Pending",
          value: stats.pendingOrders,
          description: "Needs attention",
          icon: AlertTriangle,
          href: "/seller/orders",
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold tracking-tight">
            Overview
          </h2>
          <p className="text-muted-foreground">
            Your store performance at a glance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/seller/products/new">
            <Button className="rounded-xl">Add product</Button>
          </Link>
          <Link href="/seller/orders">
            <Button variant="outline" className="rounded-xl">
              View orders
            </Button>
          </Link>
        </div>
      </div>

      <DashboardCards cards={cards} />

      {analytics && (
        <SalesChart
          data={analytics.chartData}
          topProducts={analytics.topProducts}
        />
      )}

      <Card className="border-border/70">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-heading text-base">Recent orders</CardTitle>
          <Link
            href="/seller/orders"
            className="text-sm text-emerald-600 hover:underline dark:text-emerald-400"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {!recentOrders.length ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No recent orders.
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {recentOrders.map((order) => (
                <li
                  key={order.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {order.shippingName} ·{" "}
                      {format(new Date(order.createdAt), "MMM d")}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-medium">
                      {formatCurrency(order.sellerTotal)}
                    </p>
                    <Badge variant="secondary" className="mt-1">
                      {order.status}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
