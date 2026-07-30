import { Suspense } from "react";
import { SellerTable } from "@/components/admin/seller-table";
import { getAllSellers } from "@/actions/admin";
import type { SellerStatus } from "@prisma/client";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

const VALID: SellerStatus[] = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "SUSPENDED",
];

export default async function AdminSellersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status =
    params.status && VALID.includes(params.status as SellerStatus)
      ? (params.status as SellerStatus)
      : undefined;

  const sellers = await getAllSellers(status);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">Sellers</h2>
        <p className="text-muted-foreground">
          Review applications, approve stores, and suspend accounts.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-2xl border border-dashed border-border/70 p-12 text-center text-muted-foreground">
            Loading sellers…
          </div>
        }
      >
        <SellerTable
          sellers={sellers}
          currentStatus={params.status ?? ""}
        />
      </Suspense>
    </div>
  );
}
