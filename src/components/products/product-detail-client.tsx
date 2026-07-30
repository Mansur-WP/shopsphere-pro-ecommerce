"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  Store,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ReviewList } from "@/components/reviews/review-list";
import { ReviewForm } from "@/components/reviews/review-form";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { formatCurrency, discountPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ProductDetailClientProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    compareAt?: number | null;
    images: string[];
    stock: number;
    sku?: string | null;
    ratingAvg: number;
    ratingCount: number;
    category?: { name: string; slug: string } | null;
    seller?: {
      storeName: string;
      storeSlug: string;
      logo?: string | null;
    } | null;
    reviews: {
      id: string;
      rating: number;
      title?: string | null;
      comment?: string | null;
      createdAt: string;
      user: { name?: string | null; image?: string | null };
    }[];
    reviewEligibility?: {
      canReview: boolean;
      reason: string | null;
    };
  };
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => s.has(product.id));
  const discount = discountPercent(product.price, product.compareAt);
  const images =
    product.images.length > 0
      ? product.images
      : ["/placeholder-product.svg"];
  const image = images[activeImage] ?? images[0];

  function handleAddToCart() {
    if (product.stock <= 0) {
      toast.error("Out of stock");
      return;
    }
    addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image,
        stock: product.stock,
      },
      qty
    );
    toast.success(`Added ${qty} to cart`);
  }

  function handleWishlist() {
    toggleWishlist(product.id);
    toast.success(isWishlisted ? "Removed from wishlist" : "Saved to wishlist");
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
      {/* Gallery */}
      <div className="space-y-3">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover transition-opacity duration-300"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          {discount != null && (
            <Badge className="absolute left-4 top-4 bg-emerald-600 text-white">
              -{discount}%
            </Badge>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={`${img}-${i}`}
                type="button"
                onClick={() => setActiveImage(i)}
                className={cn(
                  "relative size-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors",
                  activeImage === i
                    ? "border-emerald-500"
                    : "border-transparent hover:border-border"
                )}
                aria-label={`View image ${i + 1}`}
              >
                <Image
                  src={img}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        {product.category && (
          <Link href={`/categories/${product.category.slug}`}>
            <Badge variant="secondary" className="mb-3">
              {product.category.name}
            </Badge>
          </Link>
        )}
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          {product.name}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            <span className="font-medium">{product.ratingAvg.toFixed(1)}</span>
            <span className="text-muted-foreground">
              ({product.ratingCount} reviews)
            </span>
          </span>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-medium",
              product.stock > 10
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : product.stock > 0
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  : "bg-destructive/10 text-destructive"
            )}
          >
            {product.stock > 0
              ? `${product.stock} in stock`
              : "Out of stock"}
          </span>
        </div>

        <div className="mt-5 flex items-baseline gap-3">
          <span className="font-heading text-3xl font-bold">
            {formatCurrency(product.price)}
          </span>
          {product.compareAt != null && product.compareAt > product.price && (
            <span className="text-lg text-muted-foreground line-through">
              {formatCurrency(product.compareAt)}
            </span>
          )}
        </div>

        {product.seller && (
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-border/70 bg-muted/30 p-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              {product.seller.logo ? (
                <Image
                  src={product.seller.logo}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 rounded-lg object-cover"
                />
              ) : (
                <Store className="size-5" />
              )}
            </span>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Sold by</p>
              <p className="truncate font-medium">{product.seller.storeName}</p>
            </div>
          </div>
        )}

        <p className="mt-6 leading-relaxed text-muted-foreground">
          {product.description}
        </p>

        {product.sku && (
          <p className="mt-3 text-xs text-muted-foreground">SKU: {product.sku}</p>
        )}

        <Separator className="my-6" />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-1 self-start rounded-xl border border-border/70 p-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
            >
              <Minus className="size-4" />
            </Button>
            <span className="min-w-10 text-center font-medium">{qty}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() =>
                setQty((q) => Math.min(Math.max(product.stock, 1), q + 1))
              }
              aria-label="Increase quantity"
            >
              <Plus className="size-4" />
            </Button>
          </div>
          <Button
            size="lg"
            className="flex-1 rounded-xl"
            disabled={product.stock <= 0}
            onClick={handleAddToCart}
          >
            <ShoppingBag className="size-4" />
            {product.stock <= 0 ? "Out of stock" : "Add to cart"}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className={cn("rounded-xl", isWishlisted && "text-rose-500")}
            onClick={handleWishlist}
            aria-label="Toggle wishlist"
          >
            <Heart className={cn("size-4", isWishlisted && "fill-current")} />
          </Button>
        </div>

        <Separator className="my-10" />

        <div className="space-y-8">
          <div>
            <h2 className="font-heading mb-4 text-xl font-semibold">
              Reviews
              {product.ratingCount > 0 && (
                <span className="ml-2 text-base font-normal text-muted-foreground">
                  {product.ratingAvg.toFixed(1)} · {product.ratingCount} review
                  {product.ratingCount === 1 ? "" : "s"}
                </span>
              )}
            </h2>
            <ReviewList reviews={product.reviews} />
          </div>
          <ReviewForm
            productId={product.id}
            canReview={product.reviewEligibility?.canReview ?? false}
            reason={product.reviewEligibility?.reason}
          />
        </div>
      </div>
    </div>
  );
}
