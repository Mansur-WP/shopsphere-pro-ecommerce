"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Check, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deleteAdminProduct,
  toggleProductPublished,
} from "@/actions/admin";
import { formatCurrency } from "@/lib/format";

export interface AdminProductRow {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  published: boolean;
  featured: boolean;
  images: string[];
  category: { name: string; slug: string } | null;
  seller: { storeName: string; storeSlug: string; status: string };
  createdAt: string;
}

interface ProductTableProps {
  products: AdminProductRow[];
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
  };
  currentSearch?: string;
}

export function ProductTable({
  products,
  pagination,
  currentSearch = "",
}: ProductTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function updateQuery(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value) params.delete(key);
      else params.set(key, value);
    }
    if ("q" in updates) params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleToggle(id: string, published: boolean) {
    startTransition(async () => {
      const result = await toggleProductPublished(id, published);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete “${name}”? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteAdminProduct(id);
      if (result.success) {
        toast.success("Product deleted");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-4">
      <form
        className="relative max-w-md"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          updateQuery({ q: String(fd.get("q") || "") });
        }}
      >
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={currentSearch}
          placeholder="Search products…"
          className="rounded-xl pl-9"
        />
      </form>

      {!products.length ? (
        <div className="rounded-2xl border border-dashed border-border/70 p-12 text-center text-muted-foreground">
          No products found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border/70">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[140px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={product.images[0] || "/placeholder-product.svg"}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="44px"
                        />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/products/${product.slug}`}
                          className="truncate font-medium hover:text-emerald-600"
                        >
                          {product.name}
                        </Link>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{product.seller.storeName}</p>
                    <Badge variant="outline" className="mt-0.5 text-[10px]">
                      {product.seller.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {product.category?.name ?? "—"}
                  </TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <Badge variant={product.published ? "default" : "secondary"}>
                      {product.published ? "Approved" : "Unpublished"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {product.published ? (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={pending}
                          aria-label="Reject / unpublish"
                          onClick={() => handleToggle(product.id, false)}
                        >
                          <X className="size-4 text-amber-600" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={pending}
                          aria-label="Approve / publish"
                          onClick={() => handleToggle(product.id, true)}
                        >
                          <Check className="size-4 text-emerald-600" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={pending}
                        aria-label="Delete"
                        onClick={() => handleDelete(product.id, product.name)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">{pagination.total} products</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={pagination.page <= 1}
              onClick={() =>
                updateQuery({ page: String(pagination.page - 1) })
              }
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() =>
                updateQuery({ page: String(pagination.page + 1) })
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
