"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/helpers";
import { addressSchema } from "@/lib/validations";
import type { ActionResult } from "@/types";

export async function getAddresses() {
  try {
    const session = await requireAuth();
    return prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  } catch {
    return [];
  }
}

export async function saveAddress(
  raw: unknown
): Promise<ActionResult<{ id: string }>> {
  let session;
  try {
    session = await requireAuth();
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = addressSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  if (parsed.data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId: session.user.id,
      label: parsed.data.label || null,
      fullName: parsed.data.fullName,
      phone: parsed.data.phone || null,
      line1: parsed.data.line1,
      line2: parsed.data.line2 || null,
      city: parsed.data.city,
      state: parsed.data.state || null,
      country: parsed.data.country,
      postalCode: parsed.data.postalCode,
      isDefault: parsed.data.isDefault ?? false,
    },
  });

  return { success: true, data: { id: address.id }, message: "Address saved" };
}

export async function deleteAddress(id: string): Promise<ActionResult> {
  try {
    const session = await requireAuth();
    const address = await prisma.address.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!address) {
      return { success: false, error: "Address not found" };
    }
    await prisma.address.delete({ where: { id } });
    return { success: true, message: "Address deleted" };
  } catch {
    return { success: false, error: "Unauthorized" };
  }
}
