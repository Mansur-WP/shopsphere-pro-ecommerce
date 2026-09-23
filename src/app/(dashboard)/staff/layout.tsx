import { RequireAuth } from "@/components/auth/require-auth";
import { StaffSidebar } from "@/components/staff/staff-sidebar";
import { getStaffAccess } from "@/actions/staff";

export const dynamic = "force-dynamic";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await getStaffAccess();

  return (
    <RequireAuth
      roles={["STAFF", "SUPER_ADMIN", "ADMIN", "SELLER"]}
      loginRedirect="/login?callbackUrl=/staff/dashboard"
      forbiddenRedirect="/"
    >
      <StaffSidebar storeName={access?.storeName}>
        {access && access.status !== "APPROVED" && access.role === "STAFF" ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm">
            <p className="font-medium text-amber-800 dark:text-amber-200">
              Staff status: {access.status}
            </p>
            <p className="mt-1 text-muted-foreground">
              Your staff account is awaiting owner activation. You can browse
              the portal, and full operations unlock upon activation.
            </p>
          </div>
        ) : null}
        {children}
      </StaffSidebar>
    </RequireAuth>
  );
}
