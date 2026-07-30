import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductTable } from "@/components/sellers/product-table";
import { getSellerProducts } from "@/actions/seller";

export const metadata = {
  title: "Seller Products",
};

export default async function SellerProductsPage() {
  const data = await getSellerProducts(1, 50);
  const products = data?.products ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold tracking-tight">
            Products
          </h2>
          <p className="text-muted-foreground">
            Manage inventory, pricing, and visibility.
          </p>
        </div>
        <Link href="/seller/products/new">
          <Button className="rounded-xl">
            <Plus className="size-4" />
            Add product
          </Button>
        </Link>
      </div>

      <ProductTable products={products} />
    </div>
  );
}
