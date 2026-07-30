"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/helpers";
import { serializeProductCard } from "@/lib/serializers/product";
import type { ActionResult, ProductCardData } from "@/types";

const wishlistInclude = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          compareAt: true,
          images: true,
          ratingAvg: true,
          ratingCount: true,
          stock: true,
          published: true,
          category: { select: { name: true, slug: true } },
          seller: { select: { storeName: true, storeSlug: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" as const },
  },
};

async function getOrCreateWishlist(userId: string) {
  let wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    include: wishlistInclude,
  });

  if (!wishlist) {
    wishlist = await prisma.wishlist.create({
      data: { userId },
      include: wishlistInclude,
    });
  }

  return wishlist;
}

function serializeWishlistItems(
  items: {
    id: string;
    productId: string;
    product: Parameters<typeof serializeProductCard>[0] & { published: boolean };
  }[]
): ProductCardData[] {
  return items
    .filter((item) => item.product.published)
    .map((item) => serializeProductCard(item.product));
}

export async function getWishlist(): Promise<ProductCardData[]> {
  try {
    const session = await requireAuth();
    const wishlist = await getOrCreateWishlist(session.user.id);
    return serializeWishlistItems(wishlist.items);
  } catch {
    return [];
  }
}

export async function syncWishlist(
  productIds: string[]
): Promise<ActionResult<{ ids: string[]; items: ProductCardData[] }>> {
  try {
    const session = await requireAuth();
    const wishlist = await getOrCreateWishlist(session.user.id);

    await prisma.wishlistItem.deleteMany({ where: { wishlistId: wishlist.id } });

    const uniqueIds = [...new Set(productIds)];
    for (const productId of uniqueIds) {
      const product = await prisma.product.findFirst({
        where: { id: productId, published: true },
      });
      if (!product) continue;
      await prisma.wishlistItem.create({
        data: { wishlistId: wishlist.id, productId },
      });
    }

    const updated = await prisma.wishlist.findUnique({
      where: { userId: session.user.id },
      include: wishlistInclude,
    });

    const items = serializeWishlistItems(updated?.items ?? []);
    return {
      success: true,
      data: { ids: items.map((i) => i.id), items },
      message: "Wishlist synced",
    };
  } catch {
    return { success: false, error: "Unauthorized" };
  }
}

export async function toggleWishlist(
  productId: string
): Promise<ActionResult<{ added: boolean; items: ProductCardData[] }>> {
  try {
    const session = await requireAuth();
    const product = await prisma.product.findFirst({
      where: { id: productId, published: true },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    const wishlist = await getOrCreateWishlist(session.user.id);
    const existing = wishlist.items.find((i) => i.productId === productId);
    let added: boolean;

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      added = false;
    } else {
      await prisma.wishlistItem.create({
        data: { wishlistId: wishlist.id, productId },
      });
      added = true;
    }

    const updated = await prisma.wishlist.findUnique({
      where: { userId: session.user.id },
      include: wishlistInclude,
    });

    return {
      success: true,
      data: {
        added,
        items: serializeWishlistItems(updated?.items ?? []),
      },
      message: added ? "Added to wishlist" : "Removed from wishlist",
    };
  } catch {
    // Guest / unauthenticated — client store handles it
    return { success: false, error: "GUEST" };
  }
}

export async function removeFromWishlist(
  productId: string
): Promise<ActionResult<ProductCardData[]>> {
  try {
    const session = await requireAuth();
    const wishlist = await getOrCreateWishlist(session.user.id);
    const existing = wishlist.items.find((i) => i.productId === productId);

    if (!existing) {
      return { success: false, error: "Item not in wishlist" };
    }

    await prisma.wishlistItem.delete({ where: { id: existing.id } });

    const updated = await prisma.wishlist.findUnique({
      where: { userId: session.user.id },
      include: wishlistInclude,
    });

    return {
      success: true,
      data: serializeWishlistItems(updated?.items ?? []),
      message: "Removed from wishlist",
    };
  } catch {
    return { success: false, error: "Unauthorized" };
  }
}

export async function moveWishlistItemToCart(
  productId: string
): Promise<ActionResult> {
  try {
    const session = await requireAuth();
    const product = await prisma.product.findFirst({
      where: { id: productId, published: true },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }
    if (product.stock <= 0) {
      return { success: false, error: "Product is out of stock" };
    }

    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: { items: true },
    });
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.user.id },
        include: { items: true },
      });
    }

    const existing = cart.items.find((i) => i.productId === productId);
    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: {
          quantity: Math.min(existing.quantity + 1, product.stock),
        },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity: 1 },
      });
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: session.user.id },
      include: { items: true },
    });
    const wishItem = wishlist?.items.find((i) => i.productId === productId);
    if (wishItem) {
      await prisma.wishlistItem.delete({ where: { id: wishItem.id } });
    }

    return { success: true, message: "Moved to cart" };
  } catch {
    return { success: false, error: "Please sign in to move items to cart" };
  }
}
