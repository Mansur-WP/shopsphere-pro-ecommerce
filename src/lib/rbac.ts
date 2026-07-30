import type { Role } from "@prisma/client";

export const ROLES = {
  CUSTOMER: "CUSTOMER",
  SELLER: "SELLER",
  ADMIN: "ADMIN",
} as const satisfies Record<Role, Role>;

export function getDashboardPath(role: Role | string | undefined): string {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "SELLER":
      return "/seller/dashboard";
    default:
      return "/profile";
  }
}

export function getPostLoginRedirect(
  role: Role | string | undefined,
  callbackUrl?: string | null
): string {
  if (callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")) {
    return callbackUrl;
  }
  return getDashboardPath(role);
}

export function canAccessSeller(role: Role | string | undefined): boolean {
  return role === "SELLER" || role === "ADMIN";
}

export function canAccessAdmin(role: Role | string | undefined): boolean {
  return role === "ADMIN";
}

export function hasRole(
  userRole: Role | string | undefined,
  allowed: Role[]
): boolean {
  if (!userRole) return false;
  return allowed.includes(userRole as Role);
}
