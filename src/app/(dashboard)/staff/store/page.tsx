import { getCurrentUser } from "@/lib/helpers";
import { StaffStoreForm } from "./store-form";

export default async function StaffStorePage() {
  const user = await getCurrentUser();
  const store = user?.sellerProfile;

  if (!store) {
    return (
      <div className="text-muted-foreground">
        No operational store profile found for this staff account.
      </div>
    );
  }

  return (
    <StaffStoreForm
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
