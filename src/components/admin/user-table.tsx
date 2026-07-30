"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Search, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { setUserActive, updateUserRole } from "@/actions/admin";
import type { Role } from "@prisma/client";

export interface AdminUserRow {
  id: string;
  name: string | null;
  email: string;
  role: Role | string;
  isActive: boolean;
  image: string | null;
  createdAt: string;
  sellerProfile: {
    id: string;
    storeName: string;
    status: string;
  } | null;
  orderCount: number;
}

interface UserTableProps {
  users: AdminUserRow[];
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
  };
  currentSearch?: string;
  currentRole?: string;
}

const ROLES: Role[] = ["CUSTOMER", "SELLER", "ADMIN"];

export function UserTable({
  users,
  pagination,
  currentSearch = "",
  currentRole = "",
}: UserTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function updateQuery(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === "ALL") params.delete(key);
      else params.set(key, value);
    }
    if ("q" in updates || "role" in updates) params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleRoleChange(userId: string, role: string | null) {
    if (!role) return;
    startTransition(async () => {
      const result = await updateUserRole(userId, role as Role);
      if (result.success) {
        toast.success(result.message ?? "Role updated");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleToggleActive(userId: string, isActive: boolean) {
    startTransition(async () => {
      const result = await setUserActive(userId, isActive);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form
          className="relative flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            updateQuery({ q: String(fd.get("q") || "") });
          }}
        >
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={currentSearch}
            placeholder="Search by name or email…"
            className="rounded-xl pl-9"
          />
        </form>
        <Select
          value={currentRole || "ALL"}
          onValueChange={(v) => updateQuery({ role: v ?? undefined })}
        >
          <SelectTrigger className="w-full rounded-xl sm:w-[160px]">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All roles</SelectItem>
            {ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!users.length ? (
        <div className="rounded-2xl border border-dashed border-border/70 p-12 text-center text-muted-foreground">
          No users match your filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border/70">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[120px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                      {user.sellerProfile && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                          Store · {user.sellerProfile.storeName}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role as string}
                      onValueChange={(v) => handleRoleChange(user.id, v)}
                      disabled={pending}
                    >
                      <SelectTrigger className="h-8 w-[130px] rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{user.orderCount}</TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Active" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(user.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-lg"
                      disabled={pending}
                      onClick={() =>
                        handleToggleActive(user.id, !user.isActive)
                      }
                    >
                      {user.isActive ? (
                        <>
                          <UserX className="mr-1 size-3.5" />
                          Disable
                        </>
                      ) : (
                        <>
                          <UserCheck className="mr-1 size-3.5" />
                          Activate
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            {pagination.total} user{pagination.total === 1 ? "" : "s"}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={pagination.page <= 1}
              onClick={() =>
                updateQuery({ page: String(pagination.page - 1) })
              }
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() =>
                updateQuery({ page: String(pagination.page + 1) })
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
