"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/helpers";
import { profileSchema } from "@/lib/validations";
import type { ActionResult } from "@/types";

export async function updateProfile(raw: unknown): Promise<ActionResult> {
  let session;
  try {
    session = await requireAuth();
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
      city: parsed.data.city || null,
      country: parsed.data.country || null,
      postalCode: parsed.data.postalCode || null,
    },
  });

  return { success: true, message: "Profile updated" };
}
