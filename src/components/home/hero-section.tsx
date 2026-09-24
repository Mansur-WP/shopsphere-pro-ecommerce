"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative isolate min-h-[88vh] overflow-hidden">
      {/* Full-bleed atmospheric background */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80')] bg-cover bg-center"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-blue-950/75"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_20%_40%,rgba(37,99,235,0.18),transparent)]"
      />

      <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-center px-4 py-24 sm:px-6 lg:px-8">
        <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          <p className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
            China → Nigeria Sourcing & Ecommerce
          </p>
          <h1 className="font-heading mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Source products from China,{" "}
            <span className="text-blue-400">delivered to Nigeria</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Africhina Connect helps Nigerian businesses and shoppers buy directly
            from verified Chinese suppliers. We coordinate overseas sourcing,
            manage the shipping pipeline, and provide clear tracking until your
            package arrives.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link href="/products">
              <Button
                size="lg"
                className="rounded-xl bg-blue-600 px-8 text-white hover:bg-blue-500"
              >
                Browse products
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/orders">
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl border-white/20 bg-white/5 px-8 text-white backdrop-blur-sm hover:bg-white/10 hover:text-white"
              >
                Track an order
              </Button>
            </Link>
          </div>
          <div className="mt-10 inline-flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="size-3.5 text-blue-400" />
            Verified Suppliers · Managed Shipping Coordination · Live Order Tracking
          </div>
        </div>
      </div>
    </section>
  );
}
