import { RequireAuth } from "@/components/auth/require-auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth
      roles={["SUPER_ADMIN", "ADMIN"]}
      loginRedirect="/login?callbackUrl=/admin/dashboard"
      forbiddenRedirect="/"
    >
      <AdminSidebar>{children}</AdminSidebar>
    </RequireAuth>
  );
}
