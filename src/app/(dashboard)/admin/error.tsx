"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin/error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-12 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" />
      </span>
      <h2 className="font-heading text-xl font-bold">Admin page error</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        This admin view failed to render. Try again or return to the dashboard.
      </p>
      {process.env.NODE_ENV === "development" && error?.message && (
        <pre className="mt-4 max-h-40 w-full max-w-lg overflow-auto rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-left text-xs text-destructive">
          {error.message}
        </pre>
      )}
      <div className="mt-6 flex gap-3">
        <Button className="rounded-xl" onClick={reset}>
          Try again
        </Button>
        <Link href="/admin/dashboard">
          <Button variant="outline" className="rounded-xl">
            Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
