"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteStaffProduct } from "@/actions/staff";
import { formatCurrency } from "@/lib/format";

export interface StaffProductRow {
  id: string;
  name: string;
  price: number;
  stock: number;
  published: boolean;
  images: string[];
  category?: { name: string } | null;
  sku?: string | null;
}

interface ProductTableProps {
  products: StaffProductRow[];
}

export function ProductTable({ products }: ProductTableProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete “${name}”? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteStaffProduct(id);
      if (result.success) {
        toast.success("Product deleted successfully");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  if (!products.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 p-12 text-center">
        <p className="text-muted-foreground">No products yet.</p>
        <Link href="/staff/products/new" className="mt-4 inline-block">
          <Button className="rounded-xl">Create product listing</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border/70">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]" />
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
                    <p className="truncate font-medium">{product.name}</p>
                    {product.sku && (
                      <p className="text-xs text-muted-foreground">
                        SKU: {product.sku}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {product.category?.name ?? "—"}
              </TableCell>
              <TableCell>{formatCurrency(product.price)}</TableCell>
              <TableCell>
                <span
                  className={
                    product.stock <= 5
                      ? "font-medium text-amber-600 dark:text-amber-400"
                      : undefined
                  }
                >
                  {product.stock}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant={product.published ? "default" : "secondary"}>
                  {product.published ? "Published" : "Draft"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Link href={`/staff/products/${product.id}/edit`}>
                    <Button variant="ghost" size="icon-sm" aria-label="Edit">
                      <Pencil className="size-4" />
                    </Button>
                  </Link>
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
  );
}
