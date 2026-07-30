import { getCurrentUser } from "@/lib/helpers";
import { SellerStoreForm } from "./store-form";

export default async function SellerStorePage() {
  const user = await getCurrentUser();
  const store = user?.sellerProfile;

  if (!store) {
    return (
      <div className="text-muted-foreground">
        No seller profile found.{" "}
        <a href="/seller-register" className="text-emerald-600 hover:underline">
          Apply to sell
        </a>
      </div>
    );
  }

  return (
    <SellerStoreForm
      store={{
        storeName: store.storeName,
        description: store.description,
        businessEmail: store.businessEmail,
        phone: store.phone,
        address: store.address,
        status: store.status,
      }}
    />
  );
}
