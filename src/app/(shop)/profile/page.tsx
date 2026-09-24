import Link from "next/link";
import { RequireAuth } from "@/components/auth/require-auth";
import { getCurrentUser } from "@/lib/helpers";
import { getDashboardPath } from "@/lib/rbac";
import { ProfileForm } from "./profile-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Profile",
  description: "Manage your Africhina Connect account",
};

export default async function ProfilePage() {
  return (
    <RequireAuth loginRedirect="/login?callbackUrl=/profile">
      <ProfileContent />
    </RequireAuth>
  );
}

async function ProfileContent() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-muted-foreground">Unable to load profile.</p>
      </div>
    );
  }

  const dashboardHref = getDashboardPath(user.role);

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <ProfileForm
        user={{
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          city: user.city,
          country: user.country,
          postalCode: user.postalCode,
          role: user.role,
        }}
      />

      {(user.role === "STAFF" ||
        user.role === "SUPER_ADMIN" ||
        user.role === "ADMIN" ||
        user.role === "SELLER") && (
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Workspace</CardTitle>
            <CardDescription>
              Jump to your role-based dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={dashboardHref}>
              <Button className="rounded-xl">Open dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
