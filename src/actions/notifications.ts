"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/helpers";
import type { ActionResult } from "@/types";

export async function getNotifications(limit = 20) {
  let session;
  try {
    session = await requireAuth();
  } catch {
    return { notifications: [], unreadCount: 0 };
  }

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: Math.min(50, Math.max(1, limit)),
    }),
    prisma.notification.count({
      where: { userId: session.user.id, read: false },
    }),
  ]);

  return {
    notifications: notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      link: n.link,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    })),
    unreadCount,
  };
}

export async function markNotificationRead(
  id: string
): Promise<ActionResult> {
  let session;
  try {
    session = await requireAuth();
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  const notification = await prisma.notification.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!notification) {
    return { success: false, error: "Notification not found" };
  }

  await prisma.notification.update({
    where: { id },
    data: { read: true },
  });

  return { success: true };
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  let session;
  try {
    session = await requireAuth();
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });

  return { success: true, message: "All notifications marked as read" };
}
