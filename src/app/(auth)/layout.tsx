import Link from "next/link";
import { Store } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-background to-background"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-20 size-96 rounded-full bg-slate-500/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 bottom-20 size-96 rounded-full bg-blue-500/10 blur-3xl"
      />

      <Link href="/" className="relative mb-8 flex items-center gap-2">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
          <Store className="size-5" />
        </span>
        <span className="font-heading text-xl font-semibold tracking-tight">
          Africhina
          <span className="text-blue-600 dark:text-blue-400"> Connect</span>
        </span>
      </Link>

      <div className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        {children}
      </div>
    </div>
  );
}
