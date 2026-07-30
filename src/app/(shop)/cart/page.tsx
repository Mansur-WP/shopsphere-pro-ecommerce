import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = {
  title: "Shopping cart",
  description: "Review items in your ShopSphere Pro cart before checkout.",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading mb-8 text-3xl font-bold tracking-tight">
        Shopping cart
      </h1>
      <CartView />
    </div>
  );
}
