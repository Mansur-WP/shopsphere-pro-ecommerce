import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";
import { hasRole } from "@/lib/rbac";

export {
  generateOrderNumber,
  formatCurrency,
  toNumber,
  discountPercent,
} from "@/lib/format";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isActive: true, role: true },
  });

  if (!user?.isActive) {
    throw new Error("Unauthorized");
  }

  // Prefer live role from DB over potentially stale JWT claim
  session.user.role = user.role;
  return session;
}

export async function requireRole(roles: Role[]) {
  const session = await requireAuth();
  if (!hasRole(session.user.role, roles)) {
    throw new Error("Forbidden");
  }
  return session;
}

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      sellerProfile: true,
    },
  });
}

export async function getSessionUser() {
  const session = await auth();
  return session?.user ?? null;
}
