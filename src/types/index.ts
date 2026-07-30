import type { Role } from "@prisma/client";

export type ActionResult<T = void> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string };

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: Role;
}

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAt?: number | null;
  images: string[];
  ratingAvg: number;
  ratingCount: number;
  stock: number;
  category?: { name: string; slug: string } | null;
  seller?: { storeName: string; storeSlug: string } | null;
}

export interface CartItemData {
  id: string;
  quantity: number;
  product: ProductCardData;
}

declare module "next-auth" {
  interface User {
    role?: Role;
  }

  interface Session {
    user: SessionUser;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    error?: "Deactivated";
  }
}
