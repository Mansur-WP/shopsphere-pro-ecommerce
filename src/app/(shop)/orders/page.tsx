import type { Metadata } from "next";
import Link from "next/link";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderCard } from "@/components/orders/order-card";
import { RequireAuth } from "@/components/auth/require-auth";
import { getUserOrders } from "@/actions/orders";

export const metadata: Metadata = {
  title: "Orders",
  description: "View your ShopSphere Pro order history and status.",
};

export default async function OrdersPage() {
  return (
    <RequireAuth loginRedirect="/login?callbackUrl=/orders">
      <OrdersContent />
    </RequireAuth>
  );
}

async function OrdersContent() {
  const orders = await getUserOrders();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            Your orders
          </h1>
          <p className="mt-2 text-muted-foreground">
            Track status and review past purchases.
          </p>
        </div>
        <Link href="/products">
          <Button variant="outline" className="rounded-xl">
            Continue shopping
          </Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/70 bg-muted/20 p-12 text-center">
          <Package className="size-10 text-muted-foreground" />
          <p className="text-muted-foreground">No orders yet.</p>
          <Link href="/products">
            <Button className="rounded-xl">Start shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
