"use server";

import { prisma } from "@/lib/prisma";
import { requireRole, toNumber } from "@/lib/helpers";
import type { ActionResult } from "@/types";
import type { OrderStatus, Role, SellerStatus } from "@prisma/client";

export async function getAdminStats() {
  try {
    await requireRole(["ADMIN"]);
  } catch {
    return null;
  }

  const [
    totalUsers,
    totalSellers,
    pendingSellers,
    totalProducts,
    publishedProducts,
    totalOrders,
    pendingOrders,
    revenueAgg,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.sellerProfile.count({ where: { status: "APPROVED" } }),
    prisma.sellerProfile.count({ where: { status: "PENDING" } }),
    prisma.product.count(),
    prisma.product.count({ where: { published: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { total: true },
    }),
  ]);

  return {
    totalUsers,
    totalSellers,
    pendingSellers,
    totalProducts,
    publishedProducts,
    totalOrders,
    pendingOrders,
    totalRevenue: toNumber(revenueAgg._sum.total ?? 0),
  };
}

export async function getUsers(
  page = 1,
  limit = 20,
  search?: string,
  role?: Role
) {
  try {
    await requireRole(["ADMIN"]);
  } catch {
    return null;
  }

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));
  const skip = (safePage - 1) * safeLimit;

  const where = {
    ...(role ? { role } : {}),
    ...(search?.trim()
      ? {
          OR: [
            { name: { contains: search.trim(), mode: "insensitive" as const } },
            { email: { contains: search.trim(), mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        image: true,
        createdAt: true,
        sellerProfile: { select: { id: true, storeName: true, status: true } },
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: safeLimit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      image: u.image,
      createdAt: u.createdAt.toISOString(),
      sellerProfile: u.sellerProfile,
      orderCount: u._count.orders,
    })),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1,
    },
  };
}

export async function updateUserRole(
  userId: string,
  role: Role
): Promise<ActionResult> {
  try {
    const session = await requireRole(["ADMIN"]);
    if (session.user.id === userId) {
      return { success: false, error: "You cannot change your own role" };
    }
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { success: false, error: "User not found" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  return { success: true, message: "User role updated" };
}

export async function deleteUser(userId: string): Promise<ActionResult> {
  try {
    const session = await requireRole(["ADMIN"]);
    if (session.user.id === userId) {
      return { success: false, error: "You cannot delete your own account" };
    }
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { success: false, error: "User not found" };
  }

  await prisma.user.delete({ where: { id: userId } });

  return { success: true, message: "User deleted" };
}

export async function getPendingSellers() {
  try {
    await requireRole(["ADMIN"]);
  } catch {
    return [];
  }

  const sellers = await prisma.sellerProfile.findMany({
    where: { status: "PENDING" },
    include: {
      user: { select: { id: true, name: true, email: true, createdAt: true } },
      _count: { select: { products: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return sellers.map((s) => ({
    id: s.id,
    storeName: s.storeName,
    storeSlug: s.storeSlug,
    description: s.description,
    businessEmail: s.businessEmail,
    phone: s.phone,
    address: s.address,
    status: s.status,
    createdAt: s.createdAt.toISOString(),
    user: {
      ...s.user,
      createdAt: s.user.createdAt.toISOString(),
    },
    productCount: s._count.products,
  }));
}

export async function getAllSellers(status?: SellerStatus) {
  try {
    await requireRole(["ADMIN"]);
  } catch {
    return [];
  }

  const sellers = await prisma.sellerProfile.findMany({
    where: status ? { status } : undefined,
    include: {
      user: { select: { id: true, name: true, email: true } },
      _count: { select: { products: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return sellers.map((s) => ({
    id: s.id,
    storeName: s.storeName,
    storeSlug: s.storeSlug,
    description: s.description,
    businessEmail: s.businessEmail,
    phone: s.phone,
    address: s.address,
    status: s.status,
    totalSales: toNumber(s.totalSales),
    createdAt: s.createdAt.toISOString(),
    user: s.user,
    productCount: s._count.products,
  }));
}

export async function getSellerById(sellerId: string) {
  try {
    await requireRole(["ADMIN"]);
  } catch {
    return null;
  }

  const seller = await prisma.sellerProfile.findUnique({
    where: { id: sellerId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          isActive: true,
        },
      },
      _count: { select: { products: true } },
      products: {
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          published: true,
          price: true,
        },
      },
    },
  });

  if (!seller) return null;

  return {
    id: seller.id,
    storeName: seller.storeName,
    storeSlug: seller.storeSlug,
    description: seller.description,
    businessEmail: seller.businessEmail,
    phone: seller.phone,
    address: seller.address,
    logo: seller.logo,
    banner: seller.banner,
    status: seller.status,
    totalSales: toNumber(seller.totalSales),
    createdAt: seller.createdAt.toISOString(),
    updatedAt: seller.updatedAt.toISOString(),
    user: {
      ...seller.user,
      createdAt: seller.user.createdAt.toISOString(),
    },
    productCount: seller._count.products,
    recentProducts: seller.products.map((p) => ({
      ...p,
      price: toNumber(p.price),
    })),
  };
}

async function updateSellerStatus(
  sellerId: string,
  status: SellerStatus
): Promise<ActionResult> {
  try {
    await requireRole(["ADMIN"]);
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  const seller = await prisma.sellerProfile.findUnique({
    where: { id: sellerId },
    include: { user: { select: { id: true, email: true, name: true } } },
  });
  if (!seller) {
    return { success: false, error: "Seller not found" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.sellerProfile.update({
      where: { id: sellerId },
      data: { status },
    });

    if (status === "APPROVED") {
      await tx.user.update({
        where: { id: seller.userId },
        data: { role: "SELLER" },
      });
    }
  });

  if (status === "APPROVED" || status === "REJECTED") {
    const { createNotification } = await import("@/lib/notifications");
    const { sendSellerApprovalEmail } = await import("@/lib/email");

    await createNotification({
      userId: seller.userId,
      type: status === "APPROVED" ? "SELLER_APPROVED" : "SELLER_REJECTED",
      title:
        status === "APPROVED" ? "Store approved" : "Application not approved",
      message:
        status === "APPROVED"
          ? `${seller.storeName} is live on ShopSphere Pro.`
          : `${seller.storeName} was not approved.`,
      link: status === "APPROVED" ? "/seller/dashboard" : "/seller-register",
    });

    await sendSellerApprovalEmail({
      to: seller.businessEmail || seller.user.email,
      storeName: seller.storeName,
      approved: status === "APPROVED",
    });
  }

  return { success: true, message: `Seller ${status.toLowerCase()}` };
}

export async function approveSeller(sellerId: string): Promise<ActionResult> {
  return updateSellerStatus(sellerId, "APPROVED");
}

export async function rejectSeller(sellerId: string): Promise<ActionResult> {
  return updateSellerStatus(sellerId, "REJECTED");
}

export async function suspendSeller(sellerId: string): Promise<ActionResult> {
  return updateSellerStatus(sellerId, "SUSPENDED");
}

export async function getAdminProducts(page = 1, limit = 20, search?: string) {
  try {
    await requireRole(["ADMIN"]);
  } catch {
    return null;
  }

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));
  const skip = (safePage - 1) * safeLimit;

  const where = search?.trim()
    ? {
        OR: [
          { name: { contains: search.trim(), mode: "insensitive" as const } },
          { sku: { contains: search.trim(), mode: "insensitive" as const } },
        ],
      }
    : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true } },
        seller: { select: { storeName: true, storeSlug: true, status: true } },
      },
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
      stock: p.stock,
      published: p.published,
      featured: p.featured,
      images: p.images,
      category: p.category,
      seller: p.seller,
      createdAt: p.createdAt.toISOString(),
    })),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1,
    },
  };
}

export async function toggleProductPublished(
  productId: string,
  published?: boolean
): Promise<ActionResult> {
  try {
    await requireRole(["ADMIN"]);
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return { success: false, error: "Product not found" };
  }

  await prisma.product.update({
    where: { id: productId },
    data: { published: published ?? !product.published },
  });

  return {
    success: true,
    message: `Product ${(published ?? !product.published) ? "published" : "unpublished"}`,
  };
}

export async function getAdminOrders(page = 1, limit = 20, status?: OrderStatus) {
  try {
    await requireRole(["ADMIN"]);
  } catch {
    return null;
  }

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));
  const skip = (safePage - 1) * safeLimit;

  const where = status ? { status } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: { product: { select: { id: true, slug: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: safeLimit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders: orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      paymentStatus: o.paymentStatus,
      subtotal: toNumber(o.subtotal),
      shippingCost: toNumber(o.shippingCost),
      tax: toNumber(o.tax),
      total: toNumber(o.total),
      shippingName: o.shippingName,
      shippingEmail: o.shippingEmail,
      createdAt: o.createdAt.toISOString(),
      user: o.user,
      itemCount: o.items.length,
      items: o.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: toNumber(item.price),
        quantity: item.quantity,
        sellerId: item.sellerId,
        product: item.product,
      })),
    })),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1,
    },
  };
}

export async function updateAdminOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<ActionResult> {
  try {
    await requireRole(["ADMIN"]);
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

  return { success: true, message: "Order status updated" };
}

export async function getPlatformAnalytics(days = 30) {
  try {
    await requireRole(["ADMIN"]);
  } catch {
    return null;
  }

  try {
    const since = new Date();
    since.setDate(since.getDate() - days);

  const [orders, newUsers, newSellers, topCategories, topSellers, usersInPeriod] =
    await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: since }, paymentStatus: "PAID" },
        select: { total: true, createdAt: true },
      }),
      prisma.user.count({ where: { createdAt: { gte: since } } }),
      prisma.sellerProfile.count({ where: { createdAt: { gte: since } } }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        where: { order: { paymentStatus: "PAID", createdAt: { gte: since } } },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
      prisma.orderItem.groupBy({
        by: ["sellerId"],
        where: { order: { paymentStatus: "PAID", createdAt: { gte: since } } },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true },
      }),
    ]);

  const dailyMap = new Map<string, { revenue: number; orders: number }>();
  const userGrowthMap = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    dailyMap.set(key, { revenue: 0, orders: 0 });
    userGrowthMap.set(key, 0);
  }

  for (const order of orders) {
    const key = order.createdAt.toISOString().split("T")[0];
    const entry = dailyMap.get(key);
    if (entry) {
      entry.revenue += toNumber(order.total);
      entry.orders += 1;
    }
  }

  for (const user of usersInPeriod) {
    const key = user.createdAt.toISOString().split("T")[0];
    if (userGrowthMap.has(key)) {
      userGrowthMap.set(key, (userGrowthMap.get(key) ?? 0) + 1);
    }
  }

  const chartData = Array.from(dailyMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const userGrowth = Array.from(userGrowthMap.entries())
    .map(([date, users]) => ({ date, users }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const categoryProducts = await Promise.all(
    topCategories.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: {
          name: true,
          category: { select: { name: true } },
        },
      });
      return {
        productId: item.productId,
        name: product?.name ?? "Unknown",
        category: product?.category?.name ?? "Unknown",
        quantitySold: item._sum.quantity ?? 0,
      };
    })
  );

  const sellerProfiles = await Promise.all(
    topSellers.map(async (item) => {
      const seller = await prisma.sellerProfile.findUnique({
        where: { id: item.sellerId },
        select: { storeName: true, storeSlug: true },
      });
      return {
        sellerId: item.sellerId,
        storeName: seller?.storeName ?? "Unknown",
        storeSlug: seller?.storeSlug ?? "",
        itemsSold: item._sum.quantity ?? 0,
      };
    })
  );

  return {
    totalRevenue: orders.reduce((sum, o) => sum + toNumber(o.total), 0),
    totalOrders: orders.length,
    newUsers,
    newSellers,
    chartData,
    userGrowth,
    topProducts: categoryProducts,
    topSellers: sellerProfiles,
  };
  } catch (error) {
    console.error("[getPlatformAnalytics]", error);
    return null;
  }
}

export async function setUserActive(
  userId: string,
  isActive: boolean
): Promise<ActionResult> {
  try {
    const session = await requireRole(["ADMIN"]);
    if (session.user.id === userId) {
      return { success: false, error: "You cannot deactivate your own account" };
    }
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { success: false, error: "User not found" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive },
  });

  return {
    success: true,
    message: isActive ? "User activated" : "User deactivated",
  };
}

export async function deleteAdminProduct(
  productId: string
): Promise<ActionResult> {
  try {
    await requireRole(["ADMIN"]);
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return { success: false, error: "Product not found" };
  }

  await prisma.product.delete({ where: { id: productId } });
  return { success: true, message: "Product deleted" };
}

export async function getAdminRecentActivity(limit = 8) {
  try {
    await requireRole(["ADMIN"]);
  } catch {
    return [];
  }

  const [recentOrders, recentUsers, recentSellers, recentProducts] =
    await Promise.all([
      prisma.order.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.user.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
      prisma.sellerProfile.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          storeName: true,
          status: true,
          createdAt: true,
          user: { select: { email: true } },
        },
      }),
      prisma.product.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          published: true,
          createdAt: true,
          seller: { select: { storeName: true } },
        },
      }),
    ]);

  type Activity = {
    id: string;
    type: "order" | "user" | "seller" | "product";
    title: string;
    subtitle: string;
    createdAt: string;
  };

  const activities: Activity[] = [
    ...recentOrders.map((o) => ({
      id: `order-${o.id}`,
      type: "order" as const,
      title: `Order ${o.orderNumber}`,
      subtitle: `${o.user.name ?? o.user.email} · ${o.status}`,
      createdAt: o.createdAt.toISOString(),
    })),
    ...recentUsers.map((u) => ({
      id: `user-${u.id}`,
      type: "user" as const,
      title: `New user · ${u.name ?? u.email}`,
      subtitle: u.role,
      createdAt: u.createdAt.toISOString(),
    })),
    ...recentSellers.map((s) => ({
      id: `seller-${s.id}`,
      type: "seller" as const,
      title: `Seller · ${s.storeName}`,
      subtitle: `${s.status} · ${s.user.email}`,
      createdAt: s.createdAt.toISOString(),
    })),
    ...recentProducts.map((p) => ({
      id: `product-${p.id}`,
      type: "product" as const,
      title: `Product · ${p.name}`,
      subtitle: `${p.seller.storeName} · ${p.published ? "Published" : "Draft"}`,
      createdAt: p.createdAt.toISOString(),
    })),
  ];

  return activities
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, limit);
}
