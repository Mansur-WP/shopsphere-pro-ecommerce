import Link from "next/link";
import { ArrowRight, Store } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SellerCtaSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-slate-900 px-8 py-14 dark:bg-slate-950 sm:px-12">
        <div
          aria-hidden
          className="absolute -right-20 top-0 size-72 rounded-full bg-emerald-500/20 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -left-16 bottom-0 size-56 rounded-full bg-slate-500/20 blur-3xl"
        />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_auto]">
          <div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
              <Store className="size-6" />
            </div>
            <h2 className="font-heading mt-5 text-2xl font-bold text-white sm:text-3xl">
              Sell on ShopSphere Pro
            </h2>
            <p className="mt-3 max-w-xl text-slate-300">
              Launch your storefront, manage inventory, and reach customers who
              value quality — with analytics and tools built for growth.
            </p>
          </div>
          <Link href="/seller-register">
            <Button
              size="lg"
              className="rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400"
            >
              Apply as a seller
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
