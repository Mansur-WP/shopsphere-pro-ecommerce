import { OrderTable } from "@/components/sellers/order-table";
import { getSellerOrders } from "@/actions/seller";

export const metadata = {
  title: "Seller Orders",
};

export default async function SellerOrdersPage() {
  const data = await getSellerOrders(1, 50);
  const orders = data?.orders ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold tracking-tight">
          Orders
        </h2>
        <p className="text-muted-foreground">
          Incoming orders containing your products. Update fulfillment status as
          you ship.
        </p>
      </div>
      <OrderTable orders={orders} />
    </div>
  );
}
