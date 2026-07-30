import { toNumber } from "@/lib/format";
import type { ProductCardData } from "@/types";

export function serializeProductCard(product: {
  id: string;
  name: string;
  slug: string;
  price: unknown;
  compareAt?: unknown | null;
  images: string[];
  ratingAvg: number;
  ratingCount: number;
  stock: number;
  category?: { name: string; slug: string } | null;
  seller?: { storeName: string; storeSlug: string } | null;
}): ProductCardData {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: toNumber(product.price),
    compareAt: product.compareAt ? toNumber(product.compareAt) : null,
    images: product.images,
    ratingAvg: product.ratingAvg,
    ratingCount: product.ratingCount,
    stock: product.stock,
    category: product.category ?? null,
    seller: product.seller ?? null,
  };
}
