import { Suspense } from "react";
import { UserTable } from "@/components/admin/user-table";
import { getUsers } from "@/actions/admin";
import type { Role } from "@prisma/client";

interface PageProps {
  searchParams: Promise<{ q?: string; role?: string; page?: string }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const role =
    params.role && ["CUSTOMER", "SELLER", "ADMIN"].includes(params.role)
      ? (params.role as Role)
      : undefined;

  const data = await getUsers(page, 20, params.q, role);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">Users</h2>
        <p className="text-muted-foreground">
          Search, filter, and manage platform accounts.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-2xl border border-dashed border-border/70 p-12 text-center text-muted-foreground">
            Loading users…
          </div>
        }
      >
        <UserTable
          users={data?.users ?? []}
          pagination={data?.pagination}
          currentSearch={params.q ?? ""}
          currentRole={params.role ?? ""}
        />
      </Suspense>
    </div>
  );
}
