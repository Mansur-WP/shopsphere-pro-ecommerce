import Link from "next/link";
import { Store, ShieldCheck } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12 selection:bg-blue-500/20 selection:text-blue-600">
      {/* Dynamic Animated Ambient Background Orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-20 size-[500px] rounded-full bg-gradient-to-br from-blue-600/20 via-indigo-500/15 to-purple-500/0 blur-3xl animate-float-slow"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-20 size-[550px] rounded-full bg-gradient-to-tr from-cyan-500/15 via-blue-500/20 to-indigo-600/10 blur-3xl animate-float-reverse"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[650px] rounded-full bg-blue-500/5 blur-3xl animate-pulse-glow"
      />

      {/* Decorative background grid pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.07] dark:opacity-[0.12]"
      />

      {/* Brand Header */}
      <Link
        href="/"
        className="group relative mb-8 flex items-center gap-3 transition-transform duration-300 hover:scale-[1.02]"
      >
        <div className="relative flex size-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 ring-4 ring-blue-500/10 transition-all duration-300 group-hover:shadow-blue-500/40 group-hover:ring-blue-500/25">
          <Store className="size-6 transition-transform duration-300 group-hover:rotate-6" />
        </div>
        <div className="flex flex-col">
          <span className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Africhina<span className="text-blue-600 dark:text-blue-400"> Connect</span>
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="size-3 text-emerald-500" /> Secure E-Commerce Portal
          </span>
        </div>
      </Link>

      <div className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out">
        {children}
      </div>
    </div>
  );
}

