"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { updateAdminOrderStatus } from "@/actions/admin";
import { formatCurrency } from "@/lib/format";
import type { OrderStatus } from "@prisma/client";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

export interface AdminOrderRow {
  id: string;
  orderNumber: string;
  status: OrderStatus | string;
  paymentStatus: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  shippingName: string;
  shippingEmail: string;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  itemCount: number;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    sellerId: string;
    product: { id: string; slug: string } | null;
  }[];
}

interface OrderTableProps {
  orders: AdminOrderRow[];
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
  };
  currentStatus?: string;
}

export function OrderTable({
  orders,
  pagination,
  currentStatus = "",
}: OrderTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<AdminOrderRow | null>(null);

  function updateQuery(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === "ALL") params.delete(key);
      else params.set(key, value);
    }
    if ("status" in updates) params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleStatusChange(orderId: string, status: string | null) {
    if (!status) return;
    startTransition(async () => {
      const result = await updateAdminOrderStatus(
        orderId,
        status as OrderStatus
      );
      if (result.success) {
        toast.success("Order status updated");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select
          value={currentStatus || "ALL"}
          onValueChange={(v) => updateQuery({ status: v ?? undefined })}
        >
          <SelectTrigger className="w-full rounded-xl sm:w-[180px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!orders.length ? (
        <div className="rounded-2xl border border-dashed border-border/70 p-12 text-center text-muted-foreground">
          No orders found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border/70">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {order.orderNumber}
                  </TableCell>
                  <TableCell>
                    <p>{order.user.name ?? order.shippingName}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.user.email}
                    </p>
                  </TableCell>
                  <TableCell>{order.itemCount}</TableCell>
                  <TableCell>{formatCurrency(order.total)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{order.paymentStatus}</Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={
                        STATUS_OPTIONS.some((o) => o.value === order.status)
                          ? (order.status as string)
                          : "PENDING"
                      }
                      onValueChange={(v) => handleStatusChange(order.id, v)}
                      disabled={pending}
                    >
                      <SelectTrigger className="h-8 w-[140px] rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(order.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="View details"
                      onClick={() => setSelected(order)}
                    >
                      <Eye className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">{pagination.total} orders</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={pagination.page <= 1}
              onClick={() =>
                updateQuery({ page: String(pagination.page - 1) })
              }
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() =>
                updateQuery({ page: String(pagination.page + 1) })
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading">
                  Order {selected.orderNumber}
                </DialogTitle>
                <DialogDescription>
                  Placed {format(new Date(selected.createdAt), "PPp")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium">
                    {selected.shippingName} · {selected.shippingEmail}
                  </p>
                </div>
                <ul className="space-y-2 border-y border-border/60 py-3">
                  {selected.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between gap-4"
                    >
                      <span>
                        {item.name} ×{item.quantity}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(selected.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{formatCurrency(selected.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatCurrency(selected.tax)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(selected.total)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
