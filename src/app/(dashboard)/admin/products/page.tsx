import { Suspense } from "react";
import { ProductTable } from "@/components/admin/product-table";
import { getAdminProducts } from "@/actions/admin";

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const data = await getAdminProducts(page, 20, params.q);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">Products</h2>
        <p className="text-muted-foreground">
          Approve, reject, and remove marketplace listings.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-2xl border border-dashed border-border/70 p-12 text-center text-muted-foreground">
            Loading products…
          </div>
        }
      >
        <ProductTable
          products={data?.products ?? []}
          pagination={data?.pagination}
          currentSearch={params.q ?? ""}
        />
      </Suspense>
    </div>
  );
}
