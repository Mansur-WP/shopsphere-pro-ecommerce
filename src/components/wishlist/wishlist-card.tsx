"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { ProductCardData } from "@/types";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";

interface WishlistCardProps {
  product: ProductCardData;
}

export function WishlistCard({ product }: WishlistCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const removeWishlist = useWishlistStore((s) => s.remove);
  const image = product.images[0] ?? "/placeholder-product.svg";

  function moveToCart() {
    if (product.stock <= 0) {
      toast.error("Out of stock");
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image,
      stock: product.stock,
    });
    removeWishlist(product.id);
    toast.success("Moved to cart");
  }

  function remove() {
    removeWishlist(product.id);
    toast.success("Removed from wishlist");
  }

  return (
    <Card className="group overflow-hidden border-border/70 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-muted"
      >
        <Image
          src={image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </Link>
      <CardContent className="space-y-3 pt-0">
        <div>
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-heading line-clamp-2 text-sm font-semibold hover:text-emerald-600 dark:hover:text-emerald-400">
              {product.name}
            </h3>
          </Link>
          <p className="mt-1 font-heading font-semibold">
            {formatCurrency(product.price)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 rounded-xl"
            disabled={product.stock <= 0}
            onClick={moveToCart}
          >
            <ShoppingBag className="size-4" />
            {product.stock <= 0 ? "Sold out" : "Move to cart"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl text-destructive"
            onClick={remove}
            aria-label="Remove from wishlist"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function WishlistEmpty() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/70 bg-muted/20 p-12 text-center animate-in fade-in duration-300">
      <Heart className="size-12 text-muted-foreground" />
      <div>
        <h2 className="font-heading text-lg font-semibold">Your wishlist is empty</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Save products you love and move them to cart anytime.
        </p>
      </div>
      <Link href="/products">
        <Button className="rounded-xl">Browse products</Button>
      </Link>
    </div>
  );
}
