import Link from "next/link";
import { Store, Mail, Globe, Share2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  Shop: [
    { href: "/products", label: "All Products" },
    { href: "/categories", label: "Categories" },
    { href: "/wishlist", label: "Wishlist" },
  ],
  Company: [
    { href: "/seller-register", label: "Become a Seller" },
    { href: "/login", label: "Sign In" },
    { href: "/register", label: "Create Account" },
  ],
  Support: [
    { href: "/orders", label: "Track Orders" },
    { href: "/profile", label: "Account" },
    { href: "#", label: "Help Center" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Store className="size-4" />
              </span>
              <span className="font-heading text-lg font-semibold tracking-tight">
                ShopSphere
                <span className="text-emerald-600 dark:text-emerald-400"> Pro</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Premium multi-vendor marketplace. Discover curated products from
              trusted sellers with seamless checkout and fast delivery.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="mailto:hello@shopsphere.pro"
                className="flex size-9 items-center justify-center rounded-lg border border-border/70 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Email"
              >
                <Mail className="size-4" />
              </a>
              <a
                href="#"
                className="flex size-9 items-center justify-center rounded-lg border border-border/70 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Website"
              >
                <Globe className="size-4" />
              </a>
              <a
                href="#"
                className="flex size-9 items-center justify-center rounded-lg border border-border/70 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Share"
              >
                <Share2 className="size-4" />
              </a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-heading text-sm font-semibold">{title}</h3>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ShopSphere Pro. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <Link href="#" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="#" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="#" className="hover:text-foreground">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
