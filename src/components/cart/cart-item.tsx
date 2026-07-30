"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { LocalCartItem } from "@/store/cart-store";

interface CartItemProps {
  item: LocalCartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <Card className="animate-in fade-in slide-in-from-bottom-2 overflow-hidden border-border/70 duration-300">
      <CardContent className="flex gap-4 p-4">
        <Link
          href={`/products/${item.slug}`}
          className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted"
        >
          <Image
            src={item.image || "/placeholder-product.svg"}
            alt={item.name}
            fill
            className="object-cover"
            sizes="96px"
          />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <Link
              href={`/products/${item.slug}`}
              className="font-heading font-medium transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              {item.name}
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatCurrency(item.price)} each
            </p>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1 rounded-lg border border-border/70 p-0.5">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  if (item.quantity <= 1) {
                    onRemove(item.productId);
                    toast.success("Removed from cart");
                  } else {
                    onUpdateQuantity(item.productId, item.quantity - 1);
                  }
                }}
                aria-label="Decrease quantity"
              >
                <Minus className="size-3.5" />
              </Button>
              <span className="min-w-8 text-center text-sm font-medium">
                {item.quantity}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={item.quantity >= item.stock}
                onClick={() =>
                  onUpdateQuantity(item.productId, item.quantity + 1)
                }
                aria-label="Increase quantity"
              >
                <Plus className="size-3.5" />
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-heading font-semibold">
                {formatCurrency(item.price * item.quantity)}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  onRemove(item.productId);
                  toast.success("Removed from cart");
                }}
                aria-label="Remove item"
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
