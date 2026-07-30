import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

interface OrderCardProps {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    total: number;
    createdAt: string;
    items: { id: string }[];
  };
  className?: string;
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  PAID: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  PROCESSING: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  SHIPPED: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  DELIVERED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  CANCELLED: "bg-destructive/10 text-destructive",
  REFUNDED: "bg-muted text-muted-foreground",
};

export function OrderCard({ order, className }: OrderCardProps) {
  return (
    <Link
      href={`/orders/${order.id}`}
      className={cn(
        "flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-md",
        "animate-in fade-in slide-in-from-bottom-2",
        className
      )}
    >
      <div className="min-w-0">
        <p className="font-heading font-semibold">{order.orderNumber}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {format(new Date(order.createdAt), "MMM d, yyyy")} ·{" "}
          {order.items.length} item{order.items.length === 1 ? "" : "s"}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-heading font-semibold">
          {formatCurrency(order.total)}
        </p>
        <Badge
          variant="secondary"
          className={cn("mt-1", statusStyles[order.status])}
        >
          {order.status}
        </Badge>
      </div>
    </Link>
  );
}
