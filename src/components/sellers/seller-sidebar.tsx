import { DashboardShell } from "@/components/layout/dashboard-shell";

const sellerNav = [
  { href: "/seller/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/seller/products", label: "Products", icon: "package" },
  { href: "/seller/orders", label: "Orders", icon: "orders" },
  { href: "/seller/analytics", label: "Analytics", icon: "analytics" },
  { href: "/seller/store", label: "Store settings", icon: "settings" },
];

interface SellerSidebarProps {
  children: React.ReactNode;
  storeName?: string;
}

/** Seller portal shell with responsive sidebar navigation */
export function SellerSidebar({ children, storeName }: SellerSidebarProps) {
  return (
    <DashboardShell
      navItems={sellerNav}
      title="Seller Dashboard"
      subtitle={storeName ? `Store · ${storeName}` : undefined}
      badge="Seller Portal"
    >
      {children}
    </DashboardShell>
  );
}
