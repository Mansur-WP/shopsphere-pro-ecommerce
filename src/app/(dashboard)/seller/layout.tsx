import { RequireAuth } from "@/components/auth/require-auth";
import { SellerSidebar } from "@/components/sellers/seller-sidebar";
import { getSellerAccess } from "@/actions/seller";

export const dynamic = "force-dynamic";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await getSellerAccess();

  return (
    <RequireAuth
      roles={["SELLER", "ADMIN"]}
      loginRedirect="/login?callbackUrl=/seller/dashboard"
      forbiddenRedirect="/"
    >
      <SellerSidebar storeName={access?.storeName}>
        {access && access.status !== "APPROVED" && access.role === "SELLER" ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm">
            <p className="font-medium text-amber-800 dark:text-amber-200">
              Store status: {access.status}
            </p>
            <p className="mt-1 text-muted-foreground">
              Your seller application is awaiting admin approval. You can browse
              the dashboard, but product and order management unlocks after
              approval.
            </p>
          </div>
        ) : null}
        {children}
      </SellerSidebar>
    </RequireAuth>
  );
}
