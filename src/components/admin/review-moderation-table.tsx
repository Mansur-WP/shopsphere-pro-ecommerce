"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Eye, EyeOff, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteReview, hideReview } from "@/actions/reviews";

export interface AdminReviewRow {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  hidden: boolean;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  product: { id: string; name: string; slug: string };
}

interface ReviewModerationTableProps {
  reviews: AdminReviewRow[];
}

export function ReviewModerationTable({ reviews }: ReviewModerationTableProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggleHidden(id: string, hidden: boolean) {
    startTransition(async () => {
      const result = await hideReview(id, hidden);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Permanently delete this review?")) return;
    startTransition(async () => {
      const result = await deleteReview(id);
      if (result.success) {
        toast.success("Review deleted");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  if (!reviews.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 p-12 text-center text-muted-foreground">
        No reviews yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border/70">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Review</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-[100px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((review) => (
            <TableRow key={review.id}>
              <TableCell>
                <Link
                  href={`/products/${review.product.slug}`}
                  className="font-medium hover:text-emerald-600"
                >
                  {review.product.name}
                </Link>
              </TableCell>
              <TableCell>
                <p>{review.user.name ?? "—"}</p>
                <p className="text-xs text-muted-foreground">
                  {review.user.email}
                </p>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  {review.rating}
                </span>
              </TableCell>
              <TableCell className="max-w-[240px]">
                {review.title && (
                  <p className="truncate text-sm font-medium">{review.title}</p>
                )}
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {review.comment ?? "—"}
                </p>
              </TableCell>
              <TableCell>
                <Badge variant={review.hidden ? "secondary" : "default"}>
                  {review.hidden ? "Hidden" : "Visible"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(review.createdAt), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={pending}
                    aria-label={review.hidden ? "Restore" : "Hide"}
                    onClick={() => toggleHidden(review.id, !review.hidden)}
                  >
                    {review.hidden ? (
                      <Eye className="size-4" />
                    ) : (
                      <EyeOff className="size-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={pending}
                    aria-label="Delete"
                    onClick={() => handleDelete(review.id)}
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
