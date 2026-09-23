"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut, Package, UserRound } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "next-auth/react";
import { canAccessAdmin, canAccessStaff } from "@/lib/rbac";

function initials(name?: string | null, email?: string | null) {
  if (name?.trim()) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  return (email?.[0] ?? "U").toUpperCase();
}

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="size-8 animate-pulse rounded-full bg-muted" aria-hidden />
    );
  }

  if (!session?.user) {
    return (
      <div className="hidden items-center gap-2 sm:flex">
        <Link href="/login">
          <Button variant="ghost">Sign in</Button>
        </Link>
        <Link href="/register">
          <Button className="rounded-xl">Get started</Button>
        </Link>
      </div>
    );
  }

  const { user } = session;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Account menu"
            className="rounded-full"
          />
        }
      >
        <Avatar className="size-8">
          <AvatarImage src={user.image ?? undefined} alt={user.name ?? "User"} />
          <AvatarFallback className="text-xs">
            {initials(user.name, user.email)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex flex-col gap-0.5">
              <span className="truncate">{user.name}</span>
              <span className="truncate text-xs font-normal text-muted-foreground">
                {user.email}
              </span>
              <span className="mt-1 text-[10px] font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                {user.role}
              </span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/profile" />}>
            <UserRound className="size-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/orders" />}>
            <Package className="size-4" />
            Orders
          </DropdownMenuItem>
          {canAccessAdmin(user.role) ? (
            <DropdownMenuItem render={<Link href="/admin/dashboard" />}>
              <LayoutDashboard className="size-4" />
              Admin Dashboard
            </DropdownMenuItem>
          ) : canAccessStaff(user.role) ? (
            <DropdownMenuItem render={<Link href="/staff/dashboard" />}>
              <LayoutDashboard className="size-4" />
              Staff Dashboard
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-destructive"
          >
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
