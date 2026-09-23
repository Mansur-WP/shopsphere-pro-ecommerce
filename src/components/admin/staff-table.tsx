"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { UserCheck, UserX } from "lucide-react";
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
import { formatCurrency } from "@/lib/format";
import type { Role } from "@prisma/client";

export interface AdminStaffRow {
  id: string;
  name: string | null;
  email: string;
  role: Role | string;
  isActive: boolean;
  createdAt: string;
  profile: {
    id: string;
    storeName: string;
    storeSlug: string;
    status: string;
    totalSales: number;
    productCount: number;
  } | null;
}

interface StaffTableProps {
  staff: AdminStaffRow[];
  currentSearch?: string;
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
  };
}

const AVAILABLE_ROLES: Role[] = ["STAFF", "SUPER_ADMIN", "CUSTOMER", "ADMIN"];

export function StaffTable({
  staff,
  currentSearch = "",
  pagination,
}: StaffTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function updateQuery(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value) params.delete(key);
      else params.set(key, value);
    }
    if ("q" in updates) params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleRoleChange(userId: string, newRole: string | null) {
    if (!newRole) return;
    startTransition(async () => {
      const result = await updateUserRole(userId, newRole as Role);
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
          <Input
            name="q"
            defaultValue={currentSearch}
            placeholder="Search staff by name or email…"
            className="rounded-xl"
          />
        </form>
      </div>

      {!staff.length ? (
        <div className="rounded-2xl border border-dashed border-border/70 p-12 text-center text-muted-foreground">
          No staff members found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border/70">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Branch / Store</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Sales</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[140px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{member.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {member.profile ? (
                      <div>
                        <p className="font-medium">{member.profile.storeName}</p>
                        <p className="text-xs text-muted-foreground">
                          /{member.profile.storeSlug}
                        </p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">General Operations</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={member.role as string}
                      onValueChange={(v) => handleRoleChange(member.id, v)}
                      disabled={pending}
                    >
                      <SelectTrigger className="h-8 w-[130px] rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{member.profile?.productCount ?? 0}</TableCell>
                  <TableCell>
                    {formatCurrency(member.profile?.totalSales ?? 0)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.isActive ? "default" : "secondary"}>
                      {member.isActive ? "Active" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(member.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-lg"
                        disabled={pending}
                        onClick={() =>
                          handleToggleActive(member.id, !member.isActive)
                        }
                      >
                        {member.isActive ? (
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
                    </div>
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
            {pagination.total} staff member{pagination.total === 1 ? "" : "s"}
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
