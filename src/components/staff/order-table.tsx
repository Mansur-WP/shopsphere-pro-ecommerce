"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
import { updateStaffOrderStatus } from "@/actions/staff";
import { formatCurrency } from "@/lib/format";
import type { OrderStatus } from "@prisma/client";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Confirmed" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

export interface StaffOrderRow {
  id: string;
  orderNumber: string;
  status: OrderStatus | string;
  paymentStatus: string;
  shippingName: string;
  shippingCity: string;
  createdAt: string;
  sellerTotal: number;
  items: { id: string; name: string; quantity: number }[];
}

interface OrderTableProps {
  orders: StaffOrderRow[];
}

export function OrderTable({ orders }: OrderTableProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleStatusChange(orderId: string, status: string | null) {
    if (!status) return;
    startTransition(async () => {
      const result = await updateStaffOrderStatus(
        orderId,
        status as OrderStatus
      );
      if (result.success) {
        toast.success("Order status updated successfully");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  if (!orders.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 p-12 text-center text-muted-foreground">
        No orders found. When customers place orders, they will appear here.
      </div>
    );
  }

  return (
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.orderNumber}</TableCell>
              <TableCell>
                <div>
                  <p>{order.shippingName}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.shippingCity}
                  </p>
                </div>
              </TableCell>
              <TableCell className="max-w-[180px] truncate text-sm text-muted-foreground">
                {order.items
                  .map((i) => `${i.name} ×${i.quantity}`)
                  .join(", ")}
              </TableCell>
              <TableCell>{formatCurrency(order.sellerTotal)}</TableCell>
              <TableCell>
                <Badge variant="outline">{order.paymentStatus}</Badge>
              </TableCell>
              <TableCell>
                <Select
                  value={
                    STATUS_OPTIONS.some((o) => o.value === order.status)
                      ? (order.status as string)
                      : "PROCESSING"
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
