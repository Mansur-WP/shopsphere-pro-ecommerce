import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/format";
import { formatCurrency } from "@/lib/format";
import { createNotification, notifyAdmins } from "@/lib/notifications";
import {
  sendOrderConfirmationEmail,
  sendPaymentSuccessEmail,
} from "@/lib/email";

/**
 * Marks an order paid, decrements stock, updates seller sales,
 * clears the buyer's cart, and fans out notifications + emails.
 * Idempotent when paymentStatus is already PAID.
 */
export async function completePaidOrder(
  orderId: string,
  options?: { stripePaymentId?: string | null }
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      user: { select: { id: true, email: true, name: true } },
    },
  });

  if (!order) return { success: false as const, reason: "not_found" };
  if (order.paymentStatus === "PAID") {
    return { success: true as const, alreadyPaid: true };
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: "PROCESSING",
        paymentStatus: "PAID",
        ...(options?.stripePaymentId
          ? { stripePaymentId: options.stripePaymentId }
          : {}),
      },
    });

    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });

      await tx.sellerProfile.update({
        where: { id: item.sellerId },
        data: {
          totalSales: {
            increment: toNumber(item.price) * item.quantity,
          },
        },
      });
    }

    await tx.cartItem.deleteMany({
      where: { cart: { userId: order.userId } },
    });
  });

  const sellerIds = [...new Set(order.items.map((i) => i.sellerId))];
  const sellers = await prisma.sellerProfile.findMany({
    where: { id: { in: sellerIds } },
    select: { id: true, userId: true, storeName: true },
  });

  await Promise.all([
    createNotification({
      userId: order.userId,
      type: "ORDER_STATUS",
      title: "Payment received",
      message: `Order ${order.orderNumber} is confirmed and being prepared.`,
      link: `/orders/${order.id}`,
    }),
    ...sellers.map((seller) =>
      createNotification({
        userId: seller.userId,
        type: "ORDER_NEW",
        title: "New order",
        message: `Order ${order.orderNumber} includes items from ${seller.storeName}.`,
        link: `/staff/orders`,
      })
    ),
    notifyAdmins({
      type: "ORDER_NEW",
      title: "New paid order",
      message: `${order.orderNumber} · ${formatCurrency(toNumber(order.total))}`,
      link: `/admin/orders`,
    }),
  ]);

  const total = formatCurrency(toNumber(order.total));
  await Promise.all([
    sendOrderConfirmationEmail({
      to: order.shippingEmail || order.user.email,
      orderNumber: order.orderNumber,
      total,
      orderId: order.id,
    }),
    sendPaymentSuccessEmail({
      to: order.shippingEmail || order.user.email,
      orderNumber: order.orderNumber,
      total,
      orderId: order.id,
    }),
  ]);

  return { success: true as const, alreadyPaid: false };
}
