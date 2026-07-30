"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/helpers";
import { reviewSchema } from "@/lib/validations";
import type { ActionResult } from "@/types";

export async function getProductReviews(
  productId: string,
  page = 1,
  limit = 10
) {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));
  const skip = (safePage - 1) * safeLimit;

  const where = { productId, hidden: false };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: safeLimit,
    }),
    prisma.review.count({ where }),
  ]);

  return {
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
      user: r.user,
    })),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1,
    },
  };
}

export async function getReviewEligibility(productId: string) {
  let session;
  try {
    session = await requireAuth();
  } catch {
    return {
      canReview: false,
      reason: "Sign in to leave a review" as string | null,
      hasReviewed: false,
    };
  }

  const existing = await prisma.review.findUnique({
    where: {
      userId_productId: {
        userId: session.user.id,
        productId,
      },
    },
  });
  if (existing) {
    return {
      canReview: false,
      reason: "You already reviewed this product",
      hasReviewed: true,
    };
  }

  const hasPurchased = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId: session.user.id,
        paymentStatus: "PAID",
      },
    },
  });

  if (!hasPurchased) {
    return {
      canReview: false,
      reason: "Purchase this product to leave a verified review",
      hasReviewed: false,
    };
  }

  return { canReview: true, reason: null, hasReviewed: false };
}

async function refreshProductRatings(productId: string) {
  const agg = await prisma.review.aggregate({
    where: { productId, hidden: false },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      ratingAvg: agg._avg.rating ?? 0,
      ratingCount: agg._count.rating,
    },
  });
}

export async function createReview(raw: unknown): Promise<ActionResult> {
  let session;
  try {
    session = await requireAuth();
  } catch {
    return { success: false, error: "Please sign in to leave a review" };
  }

  const parsed = reviewSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const product = await prisma.product.findFirst({
    where: { id: parsed.data.productId, published: true },
  });
  if (!product) {
    return { success: false, error: "Product not found" };
  }

  const existing = await prisma.review.findUnique({
    where: {
      userId_productId: {
        userId: session.user.id,
        productId: parsed.data.productId,
      },
    },
  });
  if (existing) {
    return { success: false, error: "You have already reviewed this product" };
  }

  const hasPurchased = await prisma.orderItem.findFirst({
    where: {
      productId: parsed.data.productId,
      order: {
        userId: session.user.id,
        paymentStatus: "PAID",
      },
    },
  });
  if (!hasPurchased) {
    return {
      success: false,
      error: "You can only review products you have purchased",
    };
  }

  await prisma.review.create({
    data: {
      userId: session.user.id,
      productId: parsed.data.productId,
      rating: parsed.data.rating,
      title: parsed.data.title,
      comment: parsed.data.comment,
    },
  });

  await refreshProductRatings(parsed.data.productId);

  return { success: true, message: "Review submitted" };
}

export async function getAdminReviews(page = 1, limit = 20) {
  try {
    await requireRole(["ADMIN"]);
  } catch {
    return null;
  }

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));
  const skip = (safePage - 1) * safeLimit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: safeLimit,
    }),
    prisma.review.count(),
  ]);

  return {
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      hidden: r.hidden,
      createdAt: r.createdAt.toISOString(),
      user: r.user,
      product: r.product,
    })),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1,
    },
  };
}

export async function hideReview(
  reviewId: string,
  hidden = true
): Promise<ActionResult> {
  try {
    await requireRole(["ADMIN"]);
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) {
    return { success: false, error: "Review not found" };
  }

  await prisma.review.update({
    where: { id: reviewId },
    data: { hidden },
  });
  await refreshProductRatings(review.productId);

  return {
    success: true,
    message: hidden ? "Review hidden" : "Review restored",
  };
}

export async function deleteReview(reviewId: string): Promise<ActionResult> {
  try {
    await requireRole(["ADMIN"]);
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) {
    return { success: false, error: "Review not found" };
  }

  await prisma.review.delete({ where: { id: reviewId } });
  await refreshProductRatings(review.productId);

  return { success: true, message: "Review deleted" };
}
