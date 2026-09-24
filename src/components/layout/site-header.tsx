"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  Store,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UserMenu } from "@/components/auth/user-menu";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/products", label: "Shop" },
  { href: "/categories", label: "Categories" },
  { href: "/orders", label: "Track Orders" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const cartCount = useCartStore((s) => s.totalItems());
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const isSignedIn = !!session?.user;

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Store className="size-4" />
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight">
            Africhina<span className="text-blue-600 dark:text-blue-400"> Connect</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                pathname.startsWith(link.href)
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form
          action="/products"
          className="relative ml-auto hidden max-w-sm flex-1 lg:block"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="h-10 rounded-xl border-border/70 bg-muted/40 pl-9"
          />
        </form>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <ThemeToggle />
          <NotificationDropdown />
          <Link href="/wishlist" aria-label="Wishlist" className="relative">
            <Button variant="ghost" size="icon" className="relative">
              <Heart className="size-4" />
              {wishlistCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 min-w-5 px-1 text-[10px]">
                  {wishlistCount}
                </Badge>
              )}
            </Button>
          </Link>
          <Link href="/cart" aria-label="Cart" className="relative">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="size-4" />
              {cartCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 min-w-5 px-1 text-[10px]">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>

          <UserMenu />

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background px-4 py-4 md:hidden">
          <form action="/products" className="mb-3">
            <Input name="q" placeholder="Search products..." className="rounded-xl" />
          </form>
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
            {!isSignedIn && (
              <>
                <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">
                  Sign in
                </Link>
                <Link href="/register" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">
                  Get started
                </Link>
              </>
            )}
            {isSignedIn && (
              <>
                <Link href="/profile" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">
                  Profile
                </Link>
                <Link href="/orders" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">
                  Orders
                </Link>
                <Link href="/dashboard" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">
                  Dashboard
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
