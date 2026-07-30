import { DashboardShell } from "@/components/layout/dashboard-shell";

const adminNav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/users", label: "Users", icon: "users" },
  { href: "/admin/sellers", label: "Sellers", icon: "store" },
  { href: "/admin/products", label: "Products", icon: "package" },
  { href: "/admin/categories", label: "Categories", icon: "categories" },
  { href: "/admin/orders", label: "Orders", icon: "orders" },
  { href: "/admin/reviews", label: "Reviews", icon: "reviews" },
  { href: "/admin/analytics", label: "Analytics", icon: "analytics" },
];

interface AdminSidebarProps {
  children: React.ReactNode;
}

/** Admin portal shell with responsive sidebar navigation */
export function AdminSidebar({ children }: AdminSidebarProps) {
  return (
    <DashboardShell
      navItems={adminNav}
      title="Admin Dashboard"
      badge="Admin Portal"
    >
      {children}
    </DashboardShell>
  );
}
