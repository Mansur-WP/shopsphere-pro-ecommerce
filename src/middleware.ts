import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  canAccessAdmin,
  canAccessStaff,
  getDashboardPath,
} from "@/lib/rbac";

function loginUrl(request: NextRequest, pathname: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("callbackUrl", pathname);
  return url;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  });

  const isAuth = !!token;
  const role = token?.role as string | undefined;

  // Auth pages — bounce signed-in users to their dashboard
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register")
  ) {
    if (isAuth) {
      return NextResponse.redirect(
        new URL(getDashboardPath(role), request.url)
      );
    }
    return NextResponse.next();
  }

  // Unified /dashboard entry — redirect by role
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    if (!isAuth) {
      return NextResponse.redirect(loginUrl(request, pathname));
    }
    return NextResponse.redirect(
      new URL(getDashboardPath(role), request.url)
    );
  }

  // Legacy /seller routes — forward to /staff or /register
  if (pathname.startsWith("/seller")) {
    const target = pathname.startsWith("/seller-register")
      ? "/register"
      : pathname.replace(/^\/seller/, "/staff");
    return NextResponse.redirect(new URL(target, request.url));
  }

  // Staff area
  if (pathname.startsWith("/staff")) {
    if (!isAuth) {
      return NextResponse.redirect(loginUrl(request, pathname));
    }
    if (!canAccessStaff(role)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Admin area
  if (pathname.startsWith("/admin")) {
    if (!isAuth) {
      return NextResponse.redirect(loginUrl(request, pathname));
    }
    if (!canAccessAdmin(role)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Guest-friendly cart & wishlist; auth required for checkout/orders/profile
  const authRequired = ["/checkout", "/orders", "/profile"];
  if (authRequired.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    if (!isAuth) {
      return NextResponse.redirect(loginUrl(request, pathname));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/dashboard",
    "/dashboard/:path*",
    "/staff/:path*",
    "/seller/:path*",
    "/admin/:path*",
    "/checkout",
    "/orders/:path*",
    "/profile/:path*",
  ],
};
