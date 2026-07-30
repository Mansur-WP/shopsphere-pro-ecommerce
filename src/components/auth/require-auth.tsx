import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/rbac";

interface RequireAuthProps {
  children: React.ReactNode;
  roles?: Role[];
  /** Where to send unauthenticated users */
  loginRedirect?: string;
  /** Where to send authenticated users without the required role */
  forbiddenRedirect?: string;
}

/**
 * Server Component guard for pages that require authentication
 * and optional role checks.
 */
export async function RequireAuth({
  children,
  roles,
  loginRedirect = "/login",
  forbiddenRedirect = "/",
}: RequireAuthProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(loginRedirect);
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isActive: true, role: true },
  });

  if (!dbUser?.isActive) {
    redirect(loginRedirect);
  }

  if (roles?.length && !hasRole(dbUser.role, roles)) {
    redirect(forbiddenRedirect);
  }

  return <>{children}</>;
}
