import { ProductCard } from "@/components/products/product-card";
import type { ProductCardData } from "@/types";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: ProductCardData[];
  className?: string;
  emptyMessage?: string;
}

export function ProductGrid({
  products,
  className,
  emptyMessage = "No products found.",
}: ProductGridProps) {
  if (!products.length) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 p-8 text-center">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
