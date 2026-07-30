"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/helpers";
import { serializeProductCard } from "@/lib/serializers/product";
import type { ActionResult, CartItemData } from "@/types";

const cartInclude = {
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
    orderBy: { createdAt: "asc" as const },
  },
};

function serializeCartItems(
  items: {
    id: string;
    quantity: number;
    product: Parameters<typeof serializeProductCard>[0] & { published: boolean };
  }[]
): CartItemData[] {
  return items
    .filter((item) => item.product.published)
    .map((item) => ({
      id: item.id,
      quantity: item.quantity,
      product: serializeProductCard(item.product),
    }));
}

async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: cartInclude,
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: cartInclude,
    });
  }

  return cart;
}

export async function getCart(): Promise<CartItemData[]> {
  try {
    const session = await requireAuth();
    const cart = await getOrCreateCart(session.user.id);
    return serializeCartItems(cart.items);
  } catch {
    return [];
  }
}

export async function syncCart(
  localItems: { productId: string; quantity: number }[]
): Promise<ActionResult<CartItemData[]>> {
  try {
    const session = await requireAuth();
    const cart = await getOrCreateCart(session.user.id);

    // Replace strategy: local guest cart becomes the source of truth on login
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    for (const local of localItems) {
      if (local.quantity <= 0) continue;

      const product = await prisma.product.findFirst({
        where: { id: local.productId, published: true },
      });
      if (!product || product.stock <= 0) continue;

      const quantity = Math.min(local.quantity, product.stock);
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: local.productId,
          quantity,
        },
      });
    }

    const updated = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: cartInclude,
    });

    return {
      success: true,
      data: serializeCartItems(updated?.items ?? []),
      message: "Cart synced",
    };
  } catch {
    return { success: false, error: "Unauthorized" };
  }
}

export async function mergeCartFromLocal(
  localItems: { productId: string; quantity: number }[]
): Promise<ActionResult<CartItemData[]>> {
  try {
    const session = await requireAuth();
    const cart = await getOrCreateCart(session.user.id);

    for (const local of localItems) {
      if (local.quantity <= 0) continue;

      const product = await prisma.product.findFirst({
        where: { id: local.productId, published: true },
      });
      if (!product || product.stock <= 0) continue;

      const quantity = Math.min(local.quantity, product.stock);
      const existing = cart.items.find((i) => i.productId === local.productId);

      if (existing) {
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: {
            quantity: Math.min(
              Math.max(existing.quantity, quantity),
              product.stock
            ),
          },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: local.productId,
            quantity,
          },
        });
      }
    }

    const updated = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: cartInclude,
    });

    return {
      success: true,
      data: serializeCartItems(updated?.items ?? []),
      message: "Cart merged",
    };
  } catch {
    return { success: false, error: "Unauthorized" };
  }
}

export async function addToCart(
  productId: string,
  quantity = 1
): Promise<ActionResult<CartItemData[]>> {
  let session;
  try {
    session = await requireAuth();
  } catch {
    return { success: false, error: "Please sign in to add items to your cart" };
  }
  const product = await prisma.product.findFirst({
    where: { id: productId, published: true },
  });

  if (!product) {
    return { success: false, error: "Product not found" };
  }

  if (product.stock <= 0) {
    return { success: false, error: "Product is out of stock" };
  }

  const qty = Math.max(1, Math.min(quantity, product.stock));
  const cart = await getOrCreateCart(session.user.id);
  const existing = cart.items.find((i) => i.productId === productId);

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: {
        quantity: Math.min(existing.quantity + qty, product.stock),
      },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity: qty },
    });
  }

  const updated = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: cartInclude,
  });

  return {
    success: true,
    data: serializeCartItems(updated?.items ?? []),
    message: "Added to cart",
  };
}

export async function updateCartItem(
  cartItemId: string,
  quantity: number
): Promise<ActionResult<CartItemData[]>> {
  try {
    const session = await requireAuth();
    const cart = await getOrCreateCart(session.user.id);
    const item = cart.items.find((i) => i.id === cartItemId);

    if (!item) {
      return { success: false, error: "Cart item not found" };
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: cartItemId } });
    } else {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) {
        return { success: false, error: "Product not found" };
      }

      await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity: Math.min(quantity, product.stock) },
      });
    }

    const updated = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: cartInclude,
    });

    return {
      success: true,
      data: serializeCartItems(updated?.items ?? []),
      message: "Cart updated",
    };
  } catch {
    return { success: false, error: "Unauthorized" };
  }
}

export async function removeFromCart(
  cartItemId: string
): Promise<ActionResult<CartItemData[]>> {
  try {
    const session = await requireAuth();
    const cart = await getOrCreateCart(session.user.id);
    const item = cart.items.find((i) => i.id === cartItemId);

    if (!item) {
      return { success: false, error: "Cart item not found" };
    }

    await prisma.cartItem.delete({ where: { id: cartItemId } });

    const updated = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: cartInclude,
    });

    return {
      success: true,
      data: serializeCartItems(updated?.items ?? []),
      message: "Item removed",
    };
  } catch {
    return { success: false, error: "Unauthorized" };
  }
}

export async function clearCart(): Promise<ActionResult> {
  try {
    const session = await requireAuth();
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    return { success: true, message: "Cart cleared" };
  } catch {
    return { success: false, error: "Unauthorized" };
  }
}
