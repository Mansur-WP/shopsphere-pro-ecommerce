"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { syncCart } from "@/actions/cart";
import { syncWishlist } from "@/actions/wishlist";
import { useCartStore, type LocalCartItem } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { toNumber } from "@/lib/format";

function toLocalItems(
  data: {
    quantity: number;
    product: {
      id: string;
      name: string;
      slug: string;
      price: number;
      images: string[];
      stock: number;
    };
  }[]
): LocalCartItem[] {
  return data.map((item) => ({
    productId: item.product.id,
    name: item.product.name,
    slug: item.product.slug,
    price: toNumber(item.product.price),
    image: item.product.images[0] ?? "/placeholder-product.svg",
    quantity: item.quantity,
    stock: item.product.stock,
  }));
}

/**
 * Syncs guest localStorage cart/wishlist into the DB when a user signs in,
 * then hydrates Zustand from the server result.
 */
export function CartSyncProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const syncedFor = useRef<string | null>(null);
  const cartHydrated = useCartStore((s) => s.hydrated);
  const wishlistHydrated = useWishlistStore((s) => s.hydrated);
  const setCartItems = useCartStore((s) => s.setItems);
  const setWishlistIds = useWishlistStore((s) => s.setIds);

  useEffect(() => {
    if (status !== "authenticated") {
      syncedFor.current = null;
      return;
    }
    if (!cartHydrated || !wishlistHydrated) return;
    if (syncedFor.current === "done") return;

    const localCart = useCartStore.getState().items;
    const localWishlist = useWishlistStore.getState().productIds;
    syncedFor.current = "done";

    (async () => {
      const [cartResult, wishResult] = await Promise.all([
        syncCart(
          localCart.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          }))
        ),
        syncWishlist(localWishlist),
      ]);

      if (cartResult.success && cartResult.data) {
        setCartItems(toLocalItems(cartResult.data));
      }
      if (wishResult.success && wishResult.data) {
        setWishlistIds(wishResult.data.ids);
      }
    })();
  }, [status, cartHydrated, wishlistHydrated, setCartItems, setWishlistIds]);

  return <>{children}</>;
}
