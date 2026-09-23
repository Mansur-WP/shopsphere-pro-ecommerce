import { DashboardShell } from "@/components/layout/dashboard-shell";

const staffNav = [
  { href: "/staff/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/staff/products", label: "Products", icon: "package" },
  { href: "/staff/orders", label: "Orders", icon: "orders" },
  { href: "/staff/analytics", label: "Analytics", icon: "analytics" },
  { href: "/staff/store", label: "Store settings", icon: "settings" },
];

interface StaffSidebarProps {
  children: React.ReactNode;
  storeName?: string;
}

/** Staff portal shell with responsive sidebar navigation */
export function StaffSidebar({ children, storeName }: StaffSidebarProps) {
  return (
    <DashboardShell
      navItems={staffNav}
      title="Staff Dashboard"
      subtitle={storeName ? `Branch / Store · ${storeName}` : undefined}
      badge="Staff Portal"
    >
      {children}
    </DashboardShell>
  );
}
