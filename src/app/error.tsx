"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <span className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="size-8" />
      </span>
      <h1 className="font-heading text-3xl font-bold tracking-tight">
        Something went wrong
      </h1>
      <p className="mt-3 text-muted-foreground">
        An unexpected error occurred. You can try again or head back to the
        storefront.
      </p>
      {process.env.NODE_ENV === "development" && error?.message && (
        <pre className="mt-4 max-h-40 w-full overflow-auto rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-left text-xs text-destructive">
          {error.message}
          {error.digest ? `\nDigest: ${error.digest}` : ""}
        </pre>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button className="rounded-xl" onClick={reset}>
          Try again
        </Button>
        <Link href="/">
          <Button variant="outline" className="rounded-xl">
            Go home
          </Button>
        </Link>
      </div>
    </div>
  );
}
