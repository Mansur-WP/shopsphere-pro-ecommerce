"use server";

import { prisma } from "@/lib/prisma";
import {
  generateOrderNumber,
  requireAuth,
  requireRole,
  toNumber,
} from "@/lib/helpers";
import { formatAmountForStripe, getStripe } from "@/lib/stripe";
import { checkoutSchema } from "@/lib/validations";
import type { ActionResult } from "@/types";
import type { OrderStatus } from "@prisma/client";
import { clearCart } from "@/actions/cart";
import { completePaidOrder } from "@/lib/orders";
import { sendOrderStatusEmail } from "@/lib/email";
import { createNotification } from "@/lib/notifications";

import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FLAT,
  TAX_RATE,
} from "@/lib/commerce";

function serializeOrder(
  order: {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    subtotal: unknown;
    shippingCost: unknown;
    tax: unknown;
    total: unknown;
    shippingName: string;
    shippingEmail: string;
    shippingPhone: string | null;
    shippingAddress: string;
    shippingCity: string;
    shippingCountry: string;
    shippingPostal: string;
    notes: string | null;
    stripeSessionId: string | null;
    createdAt: Date;
    updatedAt: Date;
    items: {
      id: string;
      name: string;
      price: unknown;
      quantity: number;
      image: string | null;
      sellerId: string;
      product: { id: string; slug: string };
    }[];
  }
) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    subtotal: toNumber(order.subtotal),
    shippingCost: toNumber(order.shippingCost),
    tax: toNumber(order.tax),
    total: toNumber(order.total),
    shippingName: order.shippingName,
    shippingEmail: order.shippingEmail,
    shippingPhone: order.shippingPhone,
    shippingAddress: order.shippingAddress,
    shippingCity: order.shippingCity,
    shippingCountry: order.shippingCountry,
    shippingPostal: order.shippingPostal,
    notes: order.notes,
    stripeSessionId: order.stripeSessionId,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      name: item.name,
      price: toNumber(item.price),
      quantity: item.quantity,
      image: item.image,
      sellerId: item.sellerId,
      product: item.product,
    })),
  };
}

async function fulfillOrder(orderId: string) {
  await completePaidOrder(orderId);
}

export async function createCheckoutSession(
  raw: unknown
): Promise<ActionResult<{ url: string; orderId: string }>> {
  let session;
  try {
    session = await requireAuth();
  } catch {
    return { success: false, error: "Please sign in to checkout" };
  }

  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  type CheckoutLine = {
    productId: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      price: unknown;
      images: string[];
      stock: number;
      published: boolean;
      sellerId: string;
    };
  };

  let lineItems: CheckoutLine[] = [];

  if (parsed.data.items?.length) {
    for (const local of parsed.data.items) {
      const product = await prisma.product.findUnique({
        where: { id: local.productId },
      });
      if (!product?.published) {
        return {
          success: false,
          error: `A product in your cart is no longer available`,
        };
      }
      if (product.stock < local.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${product.name}"`,
        };
      }
      lineItems.push({
        productId: product.id,
        quantity: local.quantity,
        product,
      });
    }

    const cart = await prisma.cart.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id },
      update: {},
    });
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    await prisma.cartItem.createMany({
      data: lineItems.map((item) => ({
        cartId: cart.id,
        productId: item.productId,
        quantity: item.quantity,
      })),
    });
  } else {
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: { items: { include: { product: true } } },
    });

    if (!cart?.items.length) {
      return { success: false, error: "Your cart is empty" };
    }

    for (const item of cart.items) {
      if (!item.product.published) {
        return {
          success: false,
          error: `"${item.product.name}" is no longer available`,
        };
      }
      if (item.product.stock < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${item.product.name}"`,
        };
      }
    }

    lineItems = cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      product: item.product,
    }));
  }

  if (!lineItems.length) {
    return { success: false, error: "Your cart is empty" };
  }

  const subtotal = lineItems.reduce(
    (sum, item) => sum + toNumber(item.product.price) * item.quantity,
    0
  );
  const shippingCost =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = subtotal + shippingCost + tax;

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: session.user.id,
      status: "PENDING",
      paymentStatus: "PENDING",
      subtotal,
      shippingCost,
      tax,
      total,
      shippingName: parsed.data.shippingName,
      shippingEmail: parsed.data.shippingEmail,
      shippingPhone: parsed.data.shippingPhone || null,
      shippingAddress: parsed.data.shippingAddress,
      shippingCity: parsed.data.shippingCity,
      shippingCountry: parsed.data.shippingCountry,
      shippingPostal: parsed.data.shippingPostal,
      notes: parsed.data.notes || null,
      items: {
        create: lineItems.map((item) => ({
          productId: item.productId,
          sellerId: item.product.sellerId,
          name: item.product.name,
          price: item.product.price as number,
          quantity: item.quantity,
          image: item.product.images[0] ?? null,
        })),
      },
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (process.env.STRIPE_SECRET_KEY) {
    const stripeClient = getStripe();
    const stripeLineItems = lineItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.product.name,
          images: item.product.images.slice(0, 1),
        },
        unit_amount: formatAmountForStripe(toNumber(item.product.price)),
      },
      quantity: item.quantity,
    }));

    if (tax > 0) {
      stripeLineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Estimated tax",
            images: [],
          },
          unit_amount: formatAmountForStripe(tax),
        },
        quantity: 1,
      });
    }

    const stripeSession = await stripeClient.checkout.sessions.create({
      mode: "payment",
      customer_email: parsed.data.shippingEmail,
      line_items: stripeLineItems,
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: formatAmountForStripe(shippingCost),
              currency: "usd",
            },
            display_name:
              shippingCost === 0 ? "Free shipping" : "Standard shipping",
          },
        },
      ],
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId: session.user.id,
      },
      success_url: `${appUrl}/checkout/success?orderId=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout/cancel?orderId=${order.id}`,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: stripeSession.id },
    });

    if (!stripeSession.url) {
      return { success: false, error: "Failed to create checkout session" };
    }

    return {
      success: true,
      data: { url: stripeSession.url, orderId: order.id },
    };
  }

  await fulfillOrder(order.id);
  await clearCart();

  return {
    success: true,
    data: {
      url: `${appUrl}/checkout/success?orderId=${order.id}&demo=1`,
      orderId: order.id,
    },
    message: "Order placed successfully (demo mode)",
  };
}

export async function getUserOrders() {
  let session;
  try {
    session = await requireAuth();
  } catch {
    return [];
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: { product: { select: { id: true, slug: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return orders.map(serializeOrder);
}

export async function getOrderById(orderId: string) {
  let session;
  try {
    session = await requireAuth();
  } catch {
    return null;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: { product: { select: { id: true, slug: true } } },
      },
    },
  });

  if (!order) return null;

  const isOwner = order.userId === session.user.id;
  const isAdmin =
    session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    if (session.user.role === "STAFF" || session.user.role === "SELLER") {
      const seller = await prisma.sellerProfile.findUnique({
        where: { userId: session.user.id },
      });
      const hasSellerItems = order.items.some(
        (item) => item.sellerId === seller?.id
      );
      if (!hasSellerItems) return null;
    } else {
      return null;
    }
  }

  return serializeOrder(order);
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<ActionResult> {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN"]);
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: { select: { email: true } } },
  });
  if (!order) {
    return { success: false, error: "Order not found" };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  await createNotification({
    userId: order.userId,
    type: "ORDER_STATUS",
    title: "Order update",
    message: `Order ${order.orderNumber} is now ${status}.`,
    link: `/orders/${order.id}`,
  });

  await sendOrderStatusEmail({
    to: order.shippingEmail || order.user.email,
    orderNumber: order.orderNumber,
    status,
    orderId: order.id,
  });

  return { success: true, message: "Order status updated" };
}
