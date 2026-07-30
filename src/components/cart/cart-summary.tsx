"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import {
  amountToFreeShipping,
  calcTotals,
  FREE_SHIPPING_THRESHOLD,
} from "@/lib/commerce";

interface CartSummaryProps {
  subtotal: number;
  itemCount: number;
  checkoutHref?: string;
  checkoutLabel?: string;
  showCheckout?: boolean;
}

export function CartSummary({
  subtotal,
  itemCount,
  checkoutHref = "/checkout",
  checkoutLabel = "Proceed to checkout",
  showCheckout = true,
}: CartSummaryProps) {
  const { shipping, tax, total } = calcTotals(subtotal);
  const remaining = amountToFreeShipping(subtotal);

  return (
    <Card className="h-fit border-border/70">
      <CardContent className="space-y-4 p-6">
        <h2 className="font-heading text-lg font-semibold">Order summary</h2>
        <p className="text-xs text-muted-foreground">
          {itemCount} item{itemCount === 1 ? "" : "s"}
        </p>
        <Separator />
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{shipping === 0 ? "Free" : formatCurrency(shipping)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax (est.)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
        </div>
        <Separator />
        <div className="flex justify-between font-heading text-base font-semibold">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
        {remaining > 0 && (
          <p className="text-xs text-muted-foreground">
            Add {formatCurrency(remaining)} more for free shipping
            (orders ${FREE_SHIPPING_THRESHOLD}+).
          </p>
        )}
        {showCheckout && (
          <Link href={checkoutHref} className="block">
            <Button className="w-full rounded-xl" size="lg">
              {checkoutLabel}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
