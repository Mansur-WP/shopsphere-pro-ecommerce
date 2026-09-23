"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { formatCurrency, discountPercent } from "@/lib/format";
import type { ProductCardData } from "@/types";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: ProductCardData;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => s.has(product.id));

  const image = product.images[0] ?? "/placeholder-product.svg";
  const discount = discountPercent(product.price, product.compareAt);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
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
    toast.success("Added to cart");
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  }

  return (
    <Card
      className={cn(
        "group overflow-hidden border-border/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/5",
        className
      )}
    >
      <div className="relative">
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
          {discount != null && (
            <Badge className="absolute left-3 top-3 z-10 bg-emerald-600 text-white hover:bg-emerald-600">
              -{discount}%
            </Badge>
          )}
          {product.stock <= 0 && (
            <Badge variant="secondary" className="absolute left-3 bottom-3 z-10">
              Sold out
            </Badge>
          )}
        </Link>
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          className={cn(
            "absolute right-3 top-3 z-10 opacity-100 shadow-sm sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100",
            isWishlisted && "text-rose-500 opacity-100"
          )}
          onClick={handleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={cn("size-4", isWishlisted && "fill-current")} />
        </Button>
      </div>

      <CardContent className="space-y-1.5 pt-0">
        {product.category && (
          <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            {product.category.name}
          </p>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-heading line-clamp-2 text-sm font-semibold leading-snug transition-colors hover:text-emerald-600 dark:hover:text-emerald-400">
            {product.name}
          </h3>
        </Link>
        <p className="truncate text-xs text-emerald-600/80 dark:text-emerald-400/80">
          Africhina Direct
        </p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Star className="size-3.5 fill-amber-400 text-amber-400" />
          <span>{product.ratingAvg.toFixed(1)}</span>
          <span>({product.ratingCount})</span>
        </div>
        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="font-heading text-base font-semibold">
            {formatCurrency(product.price)}
          </span>
          {product.compareAt != null && product.compareAt > product.price && (
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(product.compareAt)}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          className="w-full rounded-xl"
          size="sm"
          disabled={product.stock <= 0}
          onClick={handleAddToCart}
        >
          <ShoppingBag className="size-4" />
          Add to cart
        </Button>
      </CardFooter>
    </Card>
  );
}
