import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProductNotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <h1 className="font-heading text-2xl font-bold">Product not found</h1>
      <p className="mt-2 text-muted-foreground">
        This product may have been removed or the link is incorrect.
      </p>
      <Link href="/products" className="mt-8">
        <Button className="rounded-xl">Back to shop</Button>
      </Link>
    </div>
  );
}
