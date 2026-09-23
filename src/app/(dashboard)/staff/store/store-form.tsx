"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updateStaffStore } from "@/actions/staff";

interface StaffStoreFormProps {
  store: {
    storeName: string;
    description: string | null;
    businessEmail: string | null;
    phone: string | null;
    address: string | null;
    status: string;
  };
}

export function StaffStoreForm({ store }: StaffStoreFormProps) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateStaffStore({
        storeName: fd.get("storeName"),
        description: fd.get("description"),
        businessEmail: fd.get("businessEmail"),
        phone: fd.get("phone") || undefined,
        address: fd.get("address") || undefined,
      });
      if (result.success) toast.success(result.message ?? "Settings updated");
      else toast.error(result.error);
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="font-heading text-2xl font-bold">Branch / Store settings</h2>
        <Badge variant="secondary">{store.status}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Operational Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Branch / Store name</Label>
              <Input id="storeName" name="storeName" defaultValue={store.storeName} required className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={store.description ?? ""} required rows={4} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessEmail">Contact email</Label>
              <Input id="businessEmail" name="businessEmail" type="email" defaultValue={store.businessEmail ?? ""} required className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Contact phone</Label>
              <Input id="phone" name="phone" defaultValue={store.phone ?? ""} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" defaultValue={store.address ?? ""} className="rounded-xl" />
            </div>
            <Button type="submit" className="rounded-xl" disabled={pending}>
              {pending ? "Saving..." : "Save settings"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
