"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updateProfile } from "@/actions/profile";

interface ProfileFormProps {
  user: {
    name: string | null;
    email: string;
    phone: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
    postalCode: string | null;
    role: string;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateProfile({
        name: fd.get("name"),
        phone: fd.get("phone") || undefined,
        address: fd.get("address") || undefined,
        city: fd.get("city") || undefined,
        country: fd.get("country") || undefined,
        postalCode: fd.get("postalCode") || undefined,
      });
      if (result.success) {
        toast.success(result.message ?? "Profile updated");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <>
      <div className="mb-8 flex items-center gap-3">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Profile</h1>
        <Badge variant="secondary">{user.role}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Account details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} disabled className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" defaultValue={user.name ?? ""} required className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={user.phone ?? ""} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" defaultValue={user.address ?? ""} className="rounded-xl" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" defaultValue={user.city ?? ""} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal code</Label>
                <Input id="postalCode" name="postalCode" defaultValue={user.postalCode ?? ""} className="rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" defaultValue={user.country ?? ""} className="rounded-xl" />
            </div>
            <Button type="submit" className="rounded-xl" disabled={pending}>
              {pending ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
