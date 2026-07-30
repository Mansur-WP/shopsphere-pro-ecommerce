import type { Metadata } from "next";
import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Payment cancelled",
};

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <span className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400">
        <XCircle className="size-8" />
      </span>
      <h1 className="font-heading text-3xl font-bold tracking-tight">
        Payment cancelled
      </h1>
      <p className="mt-3 text-muted-foreground">
        No charge was made. Your cart is still available — you can try again
        whenever you&apos;re ready.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/checkout">
          <Button className="rounded-xl">Return to checkout</Button>
        </Link>
        <Link href="/cart">
          <Button variant="outline" className="rounded-xl">
            View cart
          </Button>
        </Link>
      </div>
    </div>
  );
}
