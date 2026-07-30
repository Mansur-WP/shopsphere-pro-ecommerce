"use server";

import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import {
  requireAuth,
  toNumber,
} from "@/lib/helpers";
import { productSchema, storeUpdateSchema } from "@/lib/validations";
import type { ActionResult } from "@/types";
import type { OrderStatus } from "@prisma/client";

async function requireApprovedSeller() {
  const session = await requireAuth();

  if (session.user.role === "ADMIN") {
    return { session, seller: null as null };
  }

  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!seller) {
    throw new Error("Seller profile not found");
  }

  if (seller.status !== "APPROVED") {
    throw new Error("Seller account is not approved");
  }

  return { session, seller };
}

async function verifyProductOwnership(productId: string) {
  const { session, seller } = await requireApprovedSeller();

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  if (session.user.role !== "ADMIN" && product.sellerId !== seller?.id) {
    throw new Error("You do not own this product");
  }

  return { session, seller, product };
}

async function generateUniqueProductSlug(name: string, excludeId?: string) {
  const baseSlug = slugify(name, { lower: true, strict: true });
  let slug = baseSlug;
  let i = 1;

  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) break;
    slug = `${baseSlug}-${i++}`;
  }

  return slug;
}

export async function getSellerDashboardStats() {
  try {
    const { seller } = await requireApprovedSeller();
    if (!seller) {
      return {
        totalProducts: 0,
        publishedProducts: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
        totalSales: 0,
      };
    }

    const [
      totalProducts,
      publishedProducts,
      orderItems,
      pendingOrderItems,
      sellerProfile,
    ] = await Promise.all([
      prisma.product.count({ where: { sellerId: seller.id } }),
      prisma.product.count({
        where: { sellerId: seller.id, published: true },
      }),
      prisma.orderItem.findMany({
        where: { sellerId: seller.id },
        include: { order: { select: { paymentStatus: true } } },
      }),
      prisma.orderItem.count({
        where: {
          sellerId: seller.id,
          order: { status: "PENDING", paymentStatus: "PAID" },
        },
      }),
      prisma.sellerProfile.findUnique({
        where: { id: seller.id },
        select: { totalSales: true },
      }),
    ]);

    const paidItems = orderItems.filter(
      (item) => item.order.paymentStatus === "PAID"
    );
    const totalRevenue = paidItems.reduce(
      (sum, item) => sum + toNumber(item.price) * item.quantity,
      0
    );

    const uniqueOrders = new Set(orderItems.map((item) => item.orderId));

    return {
      totalProducts,
      publishedProducts,
      totalOrders: uniqueOrders.size,
      pendingOrders: pendingOrderItems,
      totalRevenue,
      totalSales: toNumber(sellerProfile?.totalSales ?? 0),
    };
  } catch {
    return null;
  }
}

export async function getSellerProducts(page = 1, limit = 20) {
  try {
    const { seller } = await requireApprovedSeller();
    if (!seller) return { products: [], pagination: { page: 1, limit, total: 0, totalPages: 1 } };

    const safePage = Math.max(1, page);
    const safeLimit = Math.min(50, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;

    const where = { sellerId: seller.id };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: { select: { name: true, slug: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: safeLimit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: toNumber(p.price),
        compareAt: p.compareAt ? toNumber(p.compareAt) : null,
        stock: p.stock,
        images: p.images,
        published: p.published,
        featured: p.featured,
        ratingAvg: p.ratingAvg,
        ratingCount: p.ratingCount,
        category: p.category,
        createdAt: p.createdAt.toISOString(),
      })),
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit) || 1,
      },
    };
  } catch {
    return null;
  }
}

export async function createSellerProduct(
  raw: unknown
): Promise<ActionResult<{ id: string; slug: string }>> {
  let seller;
  try {
    ({ seller } = await requireApprovedSeller());
    if (!seller) {
      return { success: false, error: "Seller profile required" };
    }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Unauthorized",
    };
  }

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const category = await prisma.category.findUnique({
    where: { id: parsed.data.categoryId },
  });
  if (!category) {
    return { success: false, error: "Category not found" };
  }

  const slug = await generateUniqueProductSlug(parsed.data.name);
  const compareAt =
    parsed.data.compareAt === "" || parsed.data.compareAt === undefined
      ? null
      : parsed.data.compareAt;

  const product = await prisma.product.create({
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      price: parsed.data.price,
      compareAt,
      stock: parsed.data.stock,
      sku: parsed.data.sku || null,
      images: parsed.data.images,
      featured: parsed.data.featured,
      published: parsed.data.published,
      categoryId: parsed.data.categoryId,
      sellerId: seller.id,
    },
  });

  return {
    success: true,
    data: { id: product.id, slug: product.slug },
    message: "Product created",
  };
}

export async function updateSellerProduct(
  productId: string,
  raw: unknown
): Promise<ActionResult> {
  try {
    await verifyProductOwnership(productId);
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Unauthorized",
    };
  }

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { product } = await verifyProductOwnership(productId);

  const category = await prisma.category.findUnique({
    where: { id: parsed.data.categoryId },
  });
  if (!category) {
    return { success: false, error: "Category not found" };
  }

  const slug =
    parsed.data.name !== product.name
      ? await generateUniqueProductSlug(parsed.data.name, productId)
      : product.slug;

  const compareAt =
    parsed.data.compareAt === "" || parsed.data.compareAt === undefined
      ? null
      : parsed.data.compareAt;

  await prisma.product.update({
    where: { id: productId },
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      price: parsed.data.price,
      compareAt,
      stock: parsed.data.stock,
      sku: parsed.data.sku || null,
      images: parsed.data.images,
      featured: parsed.data.featured,
      published: parsed.data.published,
      categoryId: parsed.data.categoryId,
    },
  });

  return { success: true, message: "Product updated" };
}

export async function deleteSellerProduct(
  productId: string
): Promise<ActionResult> {
  try {
    await verifyProductOwnership(productId);
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Unauthorized",
    };
  }

  await prisma.product.delete({ where: { id: productId } });

  return { success: true, message: "Product deleted" };
}

export async function getSellerOrders(page = 1, limit = 20) {
  try {
    const { seller } = await requireApprovedSeller();
    if (!seller) return { orders: [], pagination: { page: 1, limit, total: 0, totalPages: 1 } };

    const safePage = Math.max(1, page);
    const safeLimit = Math.min(50, Math.max(1, limit));

    const orderItems = await prisma.orderItem.findMany({
      where: { sellerId: seller.id },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            paymentStatus: true,
            shippingName: true,
            shippingCity: true,
            shippingCountry: true,
            createdAt: true,
            total: true,
          },
        },
        product: { select: { id: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const orderMap = new Map<
      string,
      {
        id: string;
        orderNumber: string;
        status: OrderStatus;
        paymentStatus: string;
        shippingName: string;
        shippingCity: string;
        shippingCountry: string;
        createdAt: string;
        total: number;
        sellerTotal: number;
        items: {
          id: string;
          name: string;
          price: number;
          quantity: number;
          image: string | null;
          product: { id: string; slug: string };
        }[];
      }
    >();

    for (const item of orderItems) {
      const existing = orderMap.get(item.orderId);
      const lineTotal = toNumber(item.price) * item.quantity;
      const lineItem = {
        id: item.id,
        name: item.name,
        price: toNumber(item.price),
        quantity: item.quantity,
        image: item.image,
        product: item.product,
      };

      if (existing) {
        existing.items.push(lineItem);
        existing.sellerTotal += lineTotal;
      } else {
        orderMap.set(item.orderId, {
          id: item.order.id,
          orderNumber: item.order.orderNumber,
          status: item.order.status,
          paymentStatus: item.order.paymentStatus,
          shippingName: item.order.shippingName,
          shippingCity: item.order.shippingCity,
          shippingCountry: item.order.shippingCountry,
          createdAt: item.order.createdAt.toISOString(),
          total: toNumber(item.order.total),
          sellerTotal: lineTotal,
          items: [lineItem],
        });
      }
    }

    const allOrders = Array.from(orderMap.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const total = allOrders.length;
    const skip = (safePage - 1) * safeLimit;
    const orders = allOrders.slice(skip, skip + safeLimit);

    return {
      orders,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit) || 1,
      },
    };
  } catch {
    return null;
  }
}

export async function updateStore(raw: unknown): Promise<ActionResult> {
  try {
    const { seller } = await requireApprovedSeller();
    if (!seller) {
      return { success: false, error: "Seller profile required" };
    }

    const parsed = storeUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    let storeSlug = seller.storeSlug;
    if (parsed.data.storeName !== seller.storeName) {
      const baseSlug = slugify(parsed.data.storeName, {
        lower: true,
        strict: true,
      });
      storeSlug = baseSlug;
      let i = 1;
      while (true) {
        const existing = await prisma.sellerProfile.findUnique({
          where: { storeSlug },
        });
        if (!existing || existing.id === seller.id) break;
        storeSlug = `${baseSlug}-${i++}`;
      }
    }

    await prisma.sellerProfile.update({
      where: { id: seller.id },
      data: {
        storeName: parsed.data.storeName,
        storeSlug,
        description: parsed.data.description,
        businessEmail: parsed.data.businessEmail,
        phone: parsed.data.phone || null,
        address: parsed.data.address || null,
        logo: parsed.data.logo || null,
        banner: parsed.data.banner || null,
      },
    });

    return { success: true, message: "Store updated" };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Unauthorized",
    };
  }
}

export async function getSellerAnalytics(days = 30) {
  try {
    const { seller } = await requireApprovedSeller();
    if (!seller) return null;

    const since = new Date();
    since.setDate(since.getDate() - days);

    const orderItems = await prisma.orderItem.findMany({
      where: {
        sellerId: seller.id,
        createdAt: { gte: since },
        order: { paymentStatus: "PAID" },
      },
      include: {
        order: { select: { createdAt: true } },
      },
    });

    const dailyMap = new Map<string, { revenue: number; orders: number }>();

    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dailyMap.set(key, { revenue: 0, orders: 0 });
    }

    const ordersSeen = new Set<string>();

    for (const item of orderItems) {
      const key = item.order.createdAt.toISOString().split("T")[0];
      const entry = dailyMap.get(key);
      if (entry) {
        entry.revenue += toNumber(item.price) * item.quantity;
        const orderKey = `${key}-${item.orderId}`;
        if (!ordersSeen.has(orderKey)) {
          entry.orders += 1;
          ordersSeen.add(orderKey);
        }
      }
    }

    const chartData = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const totalRevenue = orderItems.reduce(
      (sum, item) => sum + toNumber(item.price) * item.quantity,
      0
    );

    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId", "name"],
      where: {
        sellerId: seller.id,
        order: { paymentStatus: "PAID" },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    return {
      totalRevenue,
      totalItemsSold: orderItems.reduce((sum, i) => sum + i.quantity, 0),
      chartData,
      topProducts: topProducts.map((p) => ({
        productId: p.productId,
        name: p.name,
        quantitySold: p._sum.quantity ?? 0,
      })),
    };
  } catch {
    return null;
  }
}

export async function getSellerProduct(productId: string) {
  try {
    const { product } = await verifyProductOwnership(productId);
    const full = await prisma.product.findUnique({
      where: { id: product.id },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
    if (!full) return null;

    return {
      id: full.id,
      name: full.name,
      slug: full.slug,
      description: full.description,
      price: toNumber(full.price),
      compareAt: full.compareAt ? toNumber(full.compareAt) : null,
      stock: full.stock,
      sku: full.sku,
      images: full.images,
      featured: full.featured,
      published: full.published,
      categoryId: full.categoryId,
      category: full.category,
    };
  } catch {
    return null;
  }
}

export async function getSellerRecentOrders(limit = 5) {
  const data = await getSellerOrders(1, limit);
  return data?.orders ?? [];
}

const SELLER_ALLOWED_STATUSES: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export async function updateSellerOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<ActionResult> {
  try {
    const { seller, session } = await requireApprovedSeller();

    if (!SELLER_ALLOWED_STATUSES.includes(status)) {
      return { success: false, error: "Invalid status for seller updates" };
    }

    if (session.user.role === "ADMIN") {
      await prisma.order.update({ where: { id: orderId }, data: { status } });
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { user: { select: { email: true } } },
      });
      if (order) {
        const { createNotification } = await import("@/lib/notifications");
        const { sendOrderStatusEmail } = await import("@/lib/email");
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
      }
      return { success: true, message: "Order status updated" };
    }

    if (!seller) {
      return { success: false, error: "Seller profile required" };
    }

    const ownership = await prisma.orderItem.findFirst({
      where: { orderId, sellerId: seller.id },
    });

    if (!ownership) {
      return { success: false, error: "You cannot manage this order" };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: { select: { email: true } } },
    });

    if (order) {
      const { createNotification } = await import("@/lib/notifications");
      const { sendOrderStatusEmail } = await import("@/lib/email");
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
    }

    return { success: true, message: "Order status updated" };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Unauthorized",
    };
  }
}

export async function getSellerAccess() {
  try {
    const session = await requireAuth();
    if (session.user.role === "ADMIN") {
      return { role: "ADMIN" as const, status: "APPROVED" as const, storeName: "Admin" };
    }
    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
      select: { status: true, storeName: true },
    });
    if (!seller) return null;
    return {
      role: "SELLER" as const,
      status: seller.status,
      storeName: seller.storeName,
    };
  } catch {
    return null;
  }
}
