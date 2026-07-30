"use client";

import { useEffect, useState } from "react";
import { WishlistCard, WishlistEmpty } from "@/components/wishlist/wishlist-card";
import { useWishlistStore } from "@/store/wishlist-store";
import { getProductsByIds } from "@/actions/products";
import type { ProductCardData } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function WishlistPage() {
  const hydrated = useWishlistStore((s) => s.hydrated);
  const productIds = useWishlistStore((s) => s.productIds);
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      if (!productIds.length) {
        if (!cancelled) {
          setProducts([]);
          setLoading(false);
        }
        return;
      }
      const data = await getProductsByIds(productIds);
      if (!cancelled) {
        setProducts(data);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [productIds, hydrated]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Wishlist
        </h1>
        <p className="mt-2 text-muted-foreground">
          {productIds.length
            ? `${productIds.length} saved item${productIds.length === 1 ? "" : "s"}`
            : "Items you save will appear here"}
        </p>
      </div>

      {!hydrated || loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: Math.max(productIds.length, 2) }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
          ))}
        </div>
      ) : !productIds.length ? (
        <WishlistEmpty />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <WishlistCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
