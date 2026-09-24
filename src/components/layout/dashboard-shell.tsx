"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FolderTree,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { UserMenu } from "@/components/auth/user-menu";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  users: Users,
  store: Store,
  package: Package,
  categories: FolderTree,
  orders: ShoppingCart,
  analytics: BarChart3,
  reviews: MessageSquare,
  settings: Settings,
};

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: keyof typeof ICONS | string;
}

interface DashboardShellProps {
  children: React.ReactNode;
  navItems: DashboardNavItem[];
  title: string;
  subtitle?: string;
  badge?: string;
}

export function DashboardShell({
  children,
  navItems,
  title,
  subtitle,
  badge,
}: DashboardShellProps) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader className="border-b border-sidebar-border/60">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" render={<Link href="/" />}>
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Store className="size-4" />
                </span>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-heading font-semibold">
                    Africhina
                    <span className="text-blue-600 dark:text-blue-400">
                      {" "}
                      Connect
                    </span>
                  </span>
                  {badge && (
                    <span className="text-xs text-muted-foreground">{badge}</span>
                  )}
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));
                  const Icon = ICONS[item.icon] ?? Package;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={active}
                        tooltip={item.label}
                        render={<Link href={item.href} />}
                      >
                        <Icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border/60">
          <div className="flex items-center justify-between px-2 py-1">
            <Link
              href="/"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Back to store
            </Link>
            <ThemeToggle />
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/60 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="min-w-0 flex-1">
            <h1 className="font-heading truncate text-sm font-semibold">
              {title}
            </h1>
            {subtitle && (
              <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <UserMenu />
        </header>
        <main className={cn("flex-1 p-4 md:p-6")}>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
