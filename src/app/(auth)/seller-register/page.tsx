"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { sellerRegisterAction } from "@/actions/auth";

export default function SellerRegisterPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await sellerRegisterAction({
        storeName: fd.get("storeName"),
        description: fd.get("description"),
        businessEmail: fd.get("businessEmail"),
        phone: fd.get("phone") || undefined,
        address: fd.get("address") || undefined,
      });
      if (result.success) {
        toast.success(result.message ?? "Application submitted!");
        router.push("/seller/dashboard");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <Card className="w-full max-w-lg border-border/70 bg-card/80 shadow-xl backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="font-heading text-2xl">Become a seller</CardTitle>
        <CardDescription>
          Apply to sell on ShopSphere Pro. You must be signed in.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="storeName">Store name</Label>
            <Input id="storeName" name="storeName" required className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Store description</Label>
            <Textarea
              id="description"
              name="description"
              required
              rows={4}
              placeholder="Tell customers about your brand and products..."
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessEmail">Business email</Label>
            <Input
              id="businessEmail"
              name="businessEmail"
              type="email"
              required
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" name="phone" type="tel" className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Business address (optional)</Label>
            <Input id="address" name="address" className="rounded-xl" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t-0 bg-transparent">
          <Button type="submit" className="w-full rounded-xl" disabled={pending}>
            {pending ? "Submitting..." : "Submit application"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Not signed in?{" "}
            <Link href="/login?callbackUrl=/seller-register" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
              Sign in first
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
