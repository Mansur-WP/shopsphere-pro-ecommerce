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
        className="absolute inset-0 bg-gradient-to-br from-slate-950/92 via-slate-900/85 to-emerald-950/75"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_20%_40%,rgba(16,185,129,0.22),transparent)]"
      />

      <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-center px-4 py-24 sm:px-6 lg:px-8">
        <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          <p className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300/90">
            Africhina Connect
          </p>
          <h1 className="font-heading mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Connecting Africa & China through{" "}
            <span className="text-emerald-300">direct commerce</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-slate-300 sm:text-lg">
            Direct access to verified quality goods, seamless cross-border supply,
            and reliable delivery across Africa and China.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link href="/products">
              <Button
                size="lg"
                className="rounded-xl bg-emerald-500 px-8 text-slate-950 hover:bg-emerald-400"
              >
                Shop collection
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/categories">
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl border-white/25 bg-white/5 px-8 text-white backdrop-blur-sm hover:bg-white/10 hover:text-white"
              >
                Explore categories
              </Button>
            </Link>
          </div>
          <div className="mt-10 inline-flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="size-3.5 text-emerald-400" />
            Verified Quality · Direct Sourcing · Global Logistics
          </div>
        </div>
      </div>
    </section>
  );
}
