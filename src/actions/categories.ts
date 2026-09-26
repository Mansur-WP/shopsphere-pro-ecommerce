"use server";

import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/helpers";
import { categorySchema } from "@/lib/validations";
import type { ActionResult } from "@/types";

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  parentId?: string | null;
  parent?: { id: string; name: string; slug: string } | null;
  productCount: number;
  childCount?: number;
}

async function generateUniqueCategorySlug(name: string, excludeId?: string) {
  const baseSlug = slugify(name, { lower: true, strict: true });
  let slug = baseSlug;
  let i = 1;

  while (true) {
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) break;
    slug = `${baseSlug}-${i++}`;
  }

  return slug;
}

export async function getCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: true, children: true } },
      parent: { select: { id: true, name: true, slug: true } },
    },
  });

  return categories.map(
    (cat): CategoryData => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image: cat.image,
      parentId: cat.parentId,
      parent: cat.parent,
      productCount: cat._count.products,
      childCount: cat._count.children,
    })
  );
}

export async function getCategoryBySlug(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      parent: { select: { id: true, name: true, slug: true } },
      children: {
        select: { id: true, name: true, slug: true, image: true },
        orderBy: { name: "asc" },
      },
      _count: { select: { products: true } },
    },
  });

  if (!category) return null;

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image,
    parentId: category.parentId,
    parent: category.parent,
    children: category.children,
    productCount: category._count.products,
  };
}

export async function createCategory(raw: unknown): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN", "STAFF"]);
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const existingName = await prisma.category.findUnique({
    where: { name: parsed.data.name },
  });
  if (existingName) {
    return { success: false, error: "A category with this name already exists" };
  }

  if (parsed.data.parentId) {
    const parent = await prisma.category.findUnique({
      where: { id: parsed.data.parentId },
    });
    if (!parent) {
      return { success: false, error: "Parent category not found" };
    }
  }

  const slug = await generateUniqueCategorySlug(parsed.data.name);

  const category = await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      image: parsed.data.image,
      parentId: parsed.data.parentId || null,
    },
  });

  return {
    success: true,
    data: { id: category.id, slug: category.slug },
    message: "Category created",
  };
}

export async function updateCategory(
  id: string,
  raw: unknown
): Promise<ActionResult> {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN", "STAFF"]);
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    return { success: false, error: "Category not found" };
  }

  const nameConflict = await prisma.category.findFirst({
    where: { name: parsed.data.name, NOT: { id } },
  });
  if (nameConflict) {
    return { success: false, error: "A category with this name already exists" };
  }

  if (parsed.data.parentId) {
    if (parsed.data.parentId === id) {
      return { success: false, error: "Category cannot be its own parent" };
    }
    const parent = await prisma.category.findUnique({
      where: { id: parsed.data.parentId },
    });
    if (!parent) {
      return { success: false, error: "Parent category not found" };
    }
  }

  const slug =
    parsed.data.name !== existing.name
      ? await generateUniqueCategorySlug(parsed.data.name, id)
      : existing.slug;

  await prisma.category.update({
    where: { id },
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      image: parsed.data.image,
      parentId: parsed.data.parentId || null,
    },
  });

  return { success: true, message: "Category updated" };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN", "STAFF"]);
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true, children: true } } },
  });

  if (!category) {
    return { success: false, error: "Category not found" };
  }

  if (category._count.products > 0) {
    return {
      success: false,
      error: "Cannot delete a category that has products. Reassign products first.",
    };
  }

  if (category._count.children > 0) {
    return {
      success: false,
      error: "Cannot delete a category that has subcategories.",
    };
  }

  await prisma.category.delete({ where: { id } });

  return { success: true, message: "Category deleted" };
}
