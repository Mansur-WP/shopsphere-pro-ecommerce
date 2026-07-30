import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { RequireAuth } from "@/components/auth/require-auth";
import { getOrderById } from "@/actions/orders";
import { formatCurrency } from "@/lib/format";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: OrderDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const order = await getOrderById(id).catch(() => null);
  return {
    title: order ? `Order ${order.orderNumber}` : "Order",
  };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  return (
    <RequireAuth loginRedirect={`/login?callbackUrl=/orders/${id}`}>
      <OrderDetailContent id={id} />
    </RequireAuth>
  );
}

async function OrderDetailContent({ id }: { id: string }) {
  const order = await getOrderById(id);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/orders"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        All orders
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            {order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed{" "}
            {format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a")}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge>{order.status}</Badge>
          <Badge variant="outline">{order.paymentStatus}</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <Card className="border-border/70">
          <CardContent className="space-y-4 p-6">
            <h2 className="font-heading font-semibold">Items</h2>
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={item.image || "/placeholder-product.svg"}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="flex flex-1 justify-between gap-4">
                  <div>
                    {item.product?.slug ? (
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="font-medium hover:text-emerald-600 dark:hover:text-emerald-400"
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <p className="font-medium">{item.name}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity} · {formatCurrency(item.price)} each
                    </p>
                  </div>
                  <p className="font-medium">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/70">
            <CardContent className="space-y-3 p-6 text-sm">
              <h2 className="font-heading font-semibold">Summary</h2>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {order.shippingCost === 0
                    ? "Free"
                    : formatCurrency(order.shippingCost)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-heading font-semibold">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardContent className="space-y-2 p-6 text-sm">
              <h2 className="font-heading font-semibold">Shipping to</h2>
              <p>{order.shippingName}</p>
              <p className="text-muted-foreground">{order.shippingEmail}</p>
              {order.shippingPhone && (
                <p className="text-muted-foreground">{order.shippingPhone}</p>
              )}
              <p className="text-muted-foreground">
                {order.shippingAddress}, {order.shippingCity}{" "}
                {order.shippingPostal}, {order.shippingCountry}
              </p>
              {order.notes && (
                <>
                  <Separator className="my-2" />
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Notes: </span>
                    {order.notes}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
