import { Suspense } from "react";
import { OrderTable } from "@/components/admin/order-table";
import { getAdminOrders } from "@/actions/admin";
import type { OrderStatus } from "@prisma/client";

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

const VALID: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const status =
    params.status && VALID.includes(params.status as OrderStatus)
      ? (params.status as OrderStatus)
      : undefined;

  const data = await getAdminOrders(page, 20, status);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">Orders</h2>
        <p className="text-muted-foreground">
          View platform orders and update fulfillment status.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-2xl border border-dashed border-border/70 p-12 text-center text-muted-foreground">
            Loading orders…
          </div>
        }
      >
        <OrderTable
          orders={data?.orders ?? []}
          pagination={data?.pagination}
          currentStatus={params.status ?? ""}
        />
      </Suspense>
    </div>
  );
}
