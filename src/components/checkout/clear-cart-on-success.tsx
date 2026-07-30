"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart-store";

/** Clears client-side cart after successful Stripe or demo checkout. */
export function ClearCartOnSuccess() {
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return null;
}
