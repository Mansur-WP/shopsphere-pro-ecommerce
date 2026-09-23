import { OrderTable } from "@/components/staff/order-table";
import { getStaffOrders } from "@/actions/staff";

export const metadata = {
  title: "Staff Orders",
};

export default async function StaffOrdersPage() {
  const data = await getStaffOrders(1, 50);
  const orders = data?.orders ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold tracking-tight">
          Orders
        </h2>
        <p className="text-muted-foreground">
          Operational orders for Africhina products. Update fulfillment status as items are processed and dispatched.
        </p>
      </div>
      <OrderTable orders={orders} />
    </div>
  );
}
