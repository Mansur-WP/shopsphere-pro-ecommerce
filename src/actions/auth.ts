"use server";

import bcrypt from "bcryptjs";
import slugify from "slugify";
import { AuthError } from "next-auth";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { signIn, signOut, auth } from "@/lib/auth";
import {
  loginSchema,
  registerSchema,
  sellerRegisterSchema,
} from "@/lib/validations";
import type { ActionResult } from "@/types";
import { requireAuth } from "@/lib/helpers";
import { getPostLoginRedirect } from "@/lib/rbac";

export async function loginAction(
  raw: unknown
): Promise<ActionResult<{ role: Role; redirectTo: string }>> {
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const email = parsed.data.email.toLowerCase().trim();

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "Invalid email or password" };
    }
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  });

  const role = user?.role ?? "CUSTOMER";
  const callbackUrl =
    typeof raw === "object" &&
    raw !== null &&
    "callbackUrl" in raw &&
    typeof (raw as { callbackUrl?: unknown }).callbackUrl === "string"
      ? (raw as { callbackUrl: string }).callbackUrl
      : null;

  return {
    success: true,
    message: "Welcome back!",
    data: {
      role,
      redirectTo: getPostLoginRedirect(role, callbackUrl),
    },
  };
}

export async function registerAction(
  raw: unknown
): Promise<ActionResult<{ role: Role; redirectTo: string }>> {
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      success: false,
      error: "An account with this email already exists",
    };
  }

  const password = await bcrypt.hash(parsed.data.password, 12);

  await prisma.user.create({
    data: {
      name: parsed.data.name.trim(),
      email,
      password,
      role: "CUSTOMER",
      cart: { create: {} },
      wishlist: { create: {} },
    },
  });

  const { sendWelcomeEmail } = await import("@/lib/email");
  await sendWelcomeEmail(email, parsed.data.name.trim());

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (!(error instanceof AuthError)) {
      // Account exists — user can sign in manually
      console.error("Auto sign-in after register failed:", error);
    }
  }

  return {
    success: true,
    message: "Account created successfully",
    data: {
      role: "CUSTOMER",
      redirectTo: "/profile",
    },
  };
}

export async function sellerRegisterAction(
  raw: unknown
): Promise<ActionResult> {
  const session = await requireAuth();
  const parsed = sellerRegisterSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const existing = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (existing) {
    return { success: false, error: "You already have a seller profile" };
  }

  const baseSlug = slugify(parsed.data.storeName, {
    lower: true,
    strict: true,
  });
  let storeSlug = baseSlug;
  let i = 1;
  while (await prisma.sellerProfile.findUnique({ where: { storeSlug } })) {
    storeSlug = `${baseSlug}-${i++}`;
  }

  await prisma.$transaction([
    prisma.sellerProfile.create({
      data: {
        userId: session.user.id,
        storeName: parsed.data.storeName,
        storeSlug,
        description: parsed.data.description,
        businessEmail: parsed.data.businessEmail,
        phone: parsed.data.phone,
        address: parsed.data.address,
        status: "PENDING",
      },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { role: "SELLER" },
    }),
  ]);

  const { notifyAdmins } = await import("@/lib/notifications");
  await notifyAdmins({
    type: "SELLER_APPLICATION",
    title: "New seller application",
    message: `${parsed.data.storeName} applied to sell on Africhina Connect.`,
    link: "/admin/staff",
  });

  return {
    success: true,
    message:
      "Seller application submitted. Sign out and back in after admin approval to refresh your session.",
  };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

export async function getAuthSession() {
  return auth();
}
