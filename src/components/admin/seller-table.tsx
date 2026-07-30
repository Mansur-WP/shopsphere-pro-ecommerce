"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Check, Eye, X, Ban } from "lucide-react";
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
import {
  approveSeller,
  rejectSeller,
  suspendSeller,
} from "@/actions/admin";
import { formatCurrency } from "@/lib/format";
import type { SellerStatus } from "@prisma/client";

export interface AdminSellerRow {
  id: string;
  storeName: string;
  storeSlug: string;
  description?: string | null;
  businessEmail?: string | null;
  phone?: string | null;
  address?: string | null;
  status: SellerStatus | string;
  totalSales: number;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  productCount: number;
}

interface SellerTableProps {
  sellers: AdminSellerRow[];
  currentStatus?: string;
}

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "SUSPENDED", label: "Suspended" },
];

function statusVariant(status: string) {
  switch (status) {
    case "APPROVED":
      return "default" as const;
    case "PENDING":
      return "secondary" as const;
    case "REJECTED":
    case "SUSPENDED":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

export function SellerTable({ sellers, currentStatus = "" }: SellerTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<AdminSellerRow | null>(null);

  function updateStatusFilter(value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "ALL") params.delete("status");
    else params.set("status", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  function runAction(
    action: (id: string) => Promise<{ success: boolean; error?: string; message?: string }>,
    id: string,
    successMsg: string
  ) {
    startTransition(async () => {
      const result = await action(id);
      if (result.success) {
        toast.success(result.message ?? successMsg);
        setSelected(null);
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
          onValueChange={updateStatusFilter}
        >
          <SelectTrigger className="w-full rounded-xl sm:w-[180px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!sellers.length ? (
        <div className="rounded-2xl border border-dashed border-border/70 p-12 text-center text-muted-foreground">
          No seller applications found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border/70">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Sales</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead className="w-[200px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sellers.map((seller) => (
                <TableRow key={seller.id}>
                  <TableCell>
                    <p className="font-medium">{seller.storeName}</p>
                    <p className="text-xs text-muted-foreground">
                      /{seller.storeSlug}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p>{seller.user.name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">
                      {seller.user.email}
                    </p>
                  </TableCell>
                  <TableCell>{seller.productCount}</TableCell>
                  <TableCell>{formatCurrency(seller.totalSales)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(seller.status as string)}>
                      {seller.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(seller.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="View details"
                        onClick={() => setSelected(seller)}
                      >
                        <Eye className="size-4" />
                      </Button>
                      {seller.status === "PENDING" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            disabled={pending}
                            aria-label="Approve"
                            onClick={() =>
                              runAction(approveSeller, seller.id, "Seller approved")
                            }
                          >
                            <Check className="size-4 text-emerald-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            disabled={pending}
                            aria-label="Reject"
                            onClick={() =>
                              runAction(rejectSeller, seller.id, "Seller rejected")
                            }
                          >
                            <X className="size-4 text-destructive" />
                          </Button>
                        </>
                      )}
                      {seller.status === "APPROVED" && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={pending}
                          aria-label="Suspend"
                          onClick={() =>
                            runAction(suspendSeller, seller.id, "Seller suspended")
                          }
                        >
                          <Ban className="size-4 text-amber-600" />
                        </Button>
                      )}
                      {seller.status === "SUSPENDED" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-lg text-xs"
                          disabled={pending}
                          onClick={() =>
                            runAction(approveSeller, seller.id, "Seller reinstated")
                          }
                        >
                          Reinstate
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading">
                  {selected.storeName}
                </DialogTitle>
                <DialogDescription>
                  Seller application details
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <Row label="Slug" value={`/${selected.storeSlug}`} />
                <Row label="Owner" value={selected.user.name ?? "—"} />
                <Row label="Email" value={selected.user.email} />
                <Row label="Business email" value={selected.businessEmail ?? "—"} />
                <Row label="Phone" value={selected.phone ?? "—"} />
                <Row label="Address" value={selected.address ?? "—"} />
                <Row label="Products" value={String(selected.productCount)} />
                <Row
                  label="Total sales"
                  value={formatCurrency(selected.totalSales)}
                />
                <Row label="Status" value={selected.status} />
                {selected.description && (
                  <div>
                    <p className="text-muted-foreground">Description</p>
                    <p className="mt-1 whitespace-pre-wrap">{selected.description}</p>
                  </div>
                )}
              </div>
              {selected.status === "PENDING" && (
                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1 rounded-xl"
                    disabled={pending}
                    onClick={() =>
                      runAction(approveSeller, selected.id, "Seller approved")
                    }
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl"
                    disabled={pending}
                    onClick={() =>
                      runAction(rejectSeller, selected.id, "Seller rejected")
                    }
                  >
                    Reject
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/50 pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
