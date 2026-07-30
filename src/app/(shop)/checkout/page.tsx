import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getCurrentUser } from "@/lib/helpers";
import { getAddresses } from "@/actions/address";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your ShopSphere Pro order securely.",
};

export default async function CheckoutPage() {
  const [user, addresses] = await Promise.all([
    getCurrentUser(),
    getAddresses(),
  ]);

  const defaultAddress =
    addresses.find((a: { isDefault: boolean }) => a.isDefault) ?? addresses[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading mb-8 text-3xl font-bold tracking-tight">
        Checkout
      </h1>
      <CheckoutForm
        defaultValues={{
          shippingName: defaultAddress?.fullName ?? user?.name ?? undefined,
          shippingEmail: user?.email ?? undefined,
          shippingPhone: defaultAddress?.phone ?? user?.phone ?? undefined,
          shippingAddress: defaultAddress?.line1 ?? user?.address ?? undefined,
          shippingCity: defaultAddress?.city ?? user?.city ?? undefined,
          shippingCountry:
            defaultAddress?.country ?? user?.country ?? "US",
          shippingPostal:
            defaultAddress?.postalCode ?? user?.postalCode ?? undefined,
        }}
      />
    </div>
  );
}
