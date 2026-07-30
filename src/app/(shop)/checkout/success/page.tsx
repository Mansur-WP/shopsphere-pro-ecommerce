import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RequireAuth } from "@/components/auth/require-auth";
import { getOrderById } from "@/actions/orders";
import { formatCurrency } from "@/lib/format";
import { ClearCartOnSuccess } from "@/components/checkout/clear-cart-on-success";

export const metadata: Metadata = {
  title: "Payment successful",
};

interface PageProps {
  searchParams: Promise<{ orderId?: string; demo?: string; session_id?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <RequireAuth loginRedirect="/login?callbackUrl=/checkout/success">
      <ClearCartOnSuccess />
      <SuccessContent orderId={params.orderId} demo={params.demo === "1"} />
    </RequireAuth>
  );
}

async function SuccessContent({
  orderId,
  demo,
}: {
  orderId?: string;
  demo: boolean;
}) {
  const order = orderId ? await getOrderById(orderId) : null;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <span className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="size-8" />
      </span>
      <h1 className="font-heading text-3xl font-bold tracking-tight">
        {demo ? "Order placed" : "Payment successful"}
      </h1>
      <p className="mt-3 text-muted-foreground">
        {demo
          ? "Demo checkout completed — your order is confirmed."
          : "Thank you. Your payment was received and sellers are preparing your items."}
      </p>

      {order && (
        <Card className="mt-8 w-full border-border/70 text-left">
          <CardContent className="space-y-3 p-6 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Order</span>
              <span className="font-medium">{order.orderNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-heading font-semibold">
                {formatCurrency(order.total)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <span>{order.status}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {order && (
          <Link href={`/orders/${order.id}`}>
            <Button className="rounded-xl">
              <Package className="mr-1.5 size-4" />
              View order
            </Button>
          </Link>
        )}
        <Link href="/products">
          <Button variant="outline" className="rounded-xl">
            Continue shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
