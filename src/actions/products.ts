"use server";

import { prisma } from "@/lib/prisma";
import { serializeProductCard } from "@/lib/serializers/product";
import type { ProductCardData } from "@/types";
import type { Prisma } from "@prisma/client";

const productCardSelect = {
  id: true,
  name: true,
  slug: true,
  price: true,
  compareAt: true,
  images: true,
  ratingAvg: true,
  ratingCount: true,
  stock: true,
  category: { select: { name: true, slug: true } },
  seller: { select: { storeName: true, storeSlug: true } },
} satisfies Prisma.ProductSelect;

function serializeProductDetail(
  product: Prisma.ProductGetPayload<{
    include: {
      category: { select: { id: true; name: true; slug: true } };
      seller: {
        select: {
          id: true;
          storeName: true;
          storeSlug: true;
          logo: true;
          status: true;
        };
      };
    };
  }>
) {
  return {
    ...serializeProductCard(product),
    description: product.description,
    sku: product.sku,
    featured: product.featured,
    categoryId: product.categoryId,
    sellerId: product.sellerId,
    category: product.category,
    seller: product.seller,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export async function getProducts(params?: {
  search?: string;
  q?: string;
  category?: string;
  featured?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, params?.page ?? 1);
  const limit = Math.min(50, Math.max(1, params?.limit ?? 12));
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = { published: true };

  const searchTerm = params?.search ?? params?.q;
  if (searchTerm?.trim()) {
    const term = searchTerm.trim();
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { description: { contains: term, mode: "insensitive" } },
      { sku: { contains: term, mode: "insensitive" } },
    ];
  }

  if (params?.category) {
    where.category = { slug: params.category };
  }

  if (params?.featured) {
    where.featured = true;
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput[] = (() => {
    switch (params?.sort) {
      case "price-asc":
        return [{ price: "asc" }];
      case "price-desc":
        return [{ price: "desc" }];
      case "rating":
        return [{ ratingAvg: "desc" }, { ratingCount: "desc" }];
      case "newest":
        return [{ createdAt: "desc" }];
      default:
        return [{ featured: "desc" }, { createdAt: "desc" }];
    }
  })();

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: productCardSelect,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const pages = Math.ceil(total / limit) || 1;

  return {
    products: products.map(serializeProductCard),
    total,
    pages,
    pagination: {
      page,
      limit,
      total,
      totalPages: pages,
    },
  };
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, published: true },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      seller: {
        select: {
          id: true,
          storeName: true,
          storeSlug: true,
          logo: true,
          status: true,
        },
      },
    },
  });

  if (!product) return null;
  return serializeProductDetail(product);
}

export async function getFeaturedProducts(limit = 8) {
  const products = await prisma.product.findMany({
    where: { published: true, featured: true },
    select: productCardSelect,
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 20),
  });

  return products.map(serializeProductCard);
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string,
  limit = 4
) {
  const products = await prisma.product.findMany({
    where: {
      published: true,
      categoryId,
      id: { not: productId },
    },
    select: productCardSelect,
    orderBy: { ratingAvg: "desc" },
    take: Math.min(limit, 12),
  });

  return products.map(serializeProductCard);
}

export async function getProductsByIds(ids: string[]): Promise<ProductCardData[]> {
  if (!ids.length) return [];
  try {
    const products = await prisma.product.findMany({
      where: { id: { in: ids }, published: true },
      select: productCardSelect,
    });
    return products.map(serializeProductCard);
  } catch {
    return [];
  }
}
