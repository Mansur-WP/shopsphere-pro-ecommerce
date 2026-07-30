import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="font-heading text-6xl font-bold text-emerald-600 dark:text-emerald-400">
        404
      </p>
      <h1 className="mt-4 font-heading text-2xl font-bold tracking-tight">
        Page not found
      </h1>
      <p className="mt-3 text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/">
          <Button className="rounded-xl">Back to home</Button>
        </Link>
        <Link href="/products">
          <Button variant="outline" className="rounded-xl">
            Browse products
          </Button>
        </Link>
      </div>
    </div>
  );
}
