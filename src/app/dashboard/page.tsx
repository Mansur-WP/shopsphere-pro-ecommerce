import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDashboardPath } from "@/lib/rbac";

/**
 * Role-aware dashboard entry point.
 * Middleware also handles this; page is a safe fallback.
 */
export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }
  redirect(getDashboardPath(session.user.role));
}
