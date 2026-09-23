import type { Role } from "@prisma/client";

export const ROLES = {
  CUSTOMER: "CUSTOMER",
  STAFF: "STAFF",
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  SELLER: "SELLER",
} as const satisfies Record<Role, Role>;

export function getDashboardPath(role: Role | string | undefined): string {
  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return "/admin/dashboard";
    case "STAFF":
    case "SELLER":
      return "/staff/dashboard";
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

export function canAccessStaff(role: Role | string | undefined): boolean {
  return (
    role === "STAFF" ||
    role === "SUPER_ADMIN" ||
    role === "ADMIN" ||
    role === "SELLER"
  );
}

export function canAccessAdmin(role: Role | string | undefined): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

/** Backward compatibility alias for canAccessStaff */
export function canAccessSeller(role: Role | string | undefined): boolean {
  return canAccessStaff(role);
}

export function hasRole(
  userRole: Role | string | undefined,
  allowed: Role[]
): boolean {
  if (!userRole) return false;
  return allowed.includes(userRole as Role);
}
