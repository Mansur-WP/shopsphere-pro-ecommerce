"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart-store";
import { createCheckoutSession } from "@/actions/orders";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations";
import { formatCurrency } from "@/lib/format";
import { calcTotals } from "@/lib/commerce";

type CheckoutFormValues = Omit<CheckoutInput, "items">;

interface CheckoutFormProps {
  defaultValues?: Partial<CheckoutFormValues>;
}

export function CheckoutForm({ defaultValues }: CheckoutFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const subtotal = useCartStore((s) => s.subtotal());
  const { shipping, tax, total } = calcTotals(subtotal);
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(
      checkoutSchema.omit({ items: true })
    ),
    defaultValues: {
      shippingName: defaultValues?.shippingName ?? session?.user?.name ?? "",
      shippingEmail:
        defaultValues?.shippingEmail ?? session?.user?.email ?? "",
      shippingPhone: defaultValues?.shippingPhone ?? "",
      shippingAddress: defaultValues?.shippingAddress ?? "",
      shippingCity: defaultValues?.shippingCity ?? "",
      shippingCountry: defaultValues?.shippingCountry ?? "US",
      shippingPostal: defaultValues?.shippingPostal ?? "",
      notes: defaultValues?.notes ?? "",
    },
  });

  function onSubmit(values: CheckoutFormValues) {
    setFormError(null);
    startTransition(async () => {
      const result = await createCheckoutSession({
        ...values,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      if (result.success && result.data) {
        toast.success(result.message ?? "Redirecting…");
        if (result.data.url.startsWith("http")) {
          // Stripe Checkout — cart cleared on /checkout/success after pay
          window.location.href = result.data.url;
        } else {
          clearCart();
          router.push(result.data.url);
        }
        return;
      }

      if (!result.success) {
        setFormError(result.error);
        toast.error(result.error);
      }
    });
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <h1 className="font-heading text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">
          Add items before checkout.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-8 lg:grid-cols-[1fr_380px]"
      noValidate
    >
      <div className="space-y-6">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="font-heading">Shipping address</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {formError && (
              <p
                role="alert"
                className="col-span-full rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {formError}
              </p>
            )}
            <div className="col-span-full space-y-2">
              <Label htmlFor="shippingName">Full name</Label>
              <Input
                id="shippingName"
                className="rounded-xl"
                aria-invalid={!!errors.shippingName}
                {...register("shippingName")}
              />
              {errors.shippingName && (
                <p className="text-xs text-destructive">
                  {errors.shippingName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="shippingEmail">Email</Label>
              <Input
                id="shippingEmail"
                type="email"
                className="rounded-xl"
                aria-invalid={!!errors.shippingEmail}
                {...register("shippingEmail")}
              />
              {errors.shippingEmail && (
                <p className="text-xs text-destructive">
                  {errors.shippingEmail.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="shippingPhone">Phone</Label>
              <Input
                id="shippingPhone"
                type="tel"
                placeholder="+234 800 000 0000"
                className="rounded-xl"
                {...register("shippingPhone")}
              />
            </div>
            <div className="col-span-full space-y-2">
              <Label htmlFor="shippingAddress">Street address</Label>
              <Input
                id="shippingAddress"
                placeholder="e.g. 15 Adeola Odeku St, Victoria Island"
                className="rounded-xl"
                aria-invalid={!!errors.shippingAddress}
                {...register("shippingAddress")}
              />
              {errors.shippingAddress && (
                <p className="text-xs text-destructive">
                  {errors.shippingAddress.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="shippingCity">City</Label>
              <Input
                id="shippingCity"
                placeholder="e.g. Lagos, Abuja, Port Harcourt"
                className="rounded-xl"
                aria-invalid={!!errors.shippingCity}
                {...register("shippingCity")}
              />
              {errors.shippingCity && (
                <p className="text-xs text-destructive">
                  {errors.shippingCity.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="shippingPostal">Postal code</Label>
              <Input
                id="shippingPostal"
                placeholder="e.g. 101241"
                className="rounded-xl"
                aria-invalid={!!errors.shippingPostal}
                {...register("shippingPostal")}
              />
              {errors.shippingPostal && (
                <p className="text-xs text-destructive">
                  {errors.shippingPostal.message}
                </p>
              )}
            </div>
            <div className="col-span-full space-y-2">
              <Label htmlFor="shippingCountry">Country</Label>
              <Input
                id="shippingCountry"
                placeholder="Nigeria"
                className="rounded-xl"
                aria-invalid={!!errors.shippingCountry}
                {...register("shippingCountry")}
              />
              {errors.shippingCountry && (
                <p className="text-xs text-destructive">
                  {errors.shippingCountry.message}
                </p>
              )}
            </div>
            <div className="col-span-full space-y-2">
              <Label htmlFor="notes">Order notes (optional)</Label>
              <Textarea
                id="notes"
                rows={3}
                className="rounded-xl"
                placeholder="Delivery instructions, landmarks…"
                {...register("notes")}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <CreditCard className="size-5" />
              Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Demo checkout</Badge>
              <Badge variant="outline">Stripe-ready</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
                ? "You'll be redirected to Stripe Checkout to complete payment securely."
                : "No Stripe key configured — orders complete instantly in demo mode. Add STRIPE_SECRET_KEY to enable live payments."}
            </p>
            <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/30 p-4 text-sm">
              <Lock className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <p className="text-muted-foreground">
                Your payment information is encrypted. We never store full card
                details on Africhina Connect servers.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="h-fit border-border/70 lg:sticky lg:top-24">
        <CardContent className="space-y-4 p-6">
          <h2 className="font-heading text-lg font-semibold">Order summary</h2>
          <Separator />
          <ul className="max-h-56 space-y-2 overflow-y-auto text-sm">
            {items.map((item) => (
              <li key={item.productId} className="flex justify-between gap-2">
                <span className="truncate text-muted-foreground">
                  {item.name} × {item.quantity}
                </span>
                <span className="shrink-0">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
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
              <span className="text-muted-foreground">Tax</span>
              <span>{formatCurrency(tax)}</span>
            </div>
          </div>
          <Separator />
          <div className="flex justify-between font-heading text-base font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <Button
            type="submit"
            className="w-full rounded-xl"
            size="lg"
            disabled={pending}
          >
            {pending ? "Placing order…" : "Confirm order"}
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-blue-600 dark:text-blue-400" />
            Secure checkout · Cancel anytime before payment
          </p>
        </CardContent>
      </Card>
    </form>
  );
}
