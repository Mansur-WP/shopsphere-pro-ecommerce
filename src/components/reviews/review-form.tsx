"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createReview } from "@/actions/reviews";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  productId: string;
  canReview?: boolean;
  reason?: string | null;
}

export function ReviewForm({
  productId,
  canReview = true,
  reason,
}: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [pending, startTransition] = useTransition();

  if (!canReview) {
    return (
      <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
        {reason ?? "Reviews are limited to verified purchasers."}
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (rating < 1) {
      toast.error("Please select a rating");
      return;
    }

    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createReview({
        productId,
        rating,
        title: fd.get("title") as string,
        comment: fd.get("comment") as string,
      });
      if (result.success) {
        toast.success(result.message ?? "Review submitted");
        e.currentTarget.reset();
        setRating(0);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-border/70 bg-card/50 p-6"
    >
      <h3 className="font-heading text-base font-semibold">Write a review</h3>
      <p className="text-xs text-muted-foreground">Verified purchase</p>

      <div className="space-y-2">
        <Label>Rating</Label>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const value = i + 1;
            return (
              <button
                key={value}
                type="button"
                className="rounded p-0.5 transition-transform hover:scale-110"
                onMouseEnter={() => setHover(value)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(value)}
                aria-label={`Rate ${value} stars`}
              >
                <Star
                  className={cn(
                    "size-6",
                    (hover || rating) >= value
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/30"
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title (optional)</Label>
        <Input
          id="title"
          name="title"
          placeholder="Summarize your experience"
          className="rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Review</Label>
        <Textarea
          id="comment"
          name="comment"
          placeholder="What did you like or dislike?"
          rows={4}
          className="rounded-xl"
        />
      </div>

      <Button type="submit" className="rounded-xl" disabled={pending}>
        {pending ? "Submitting..." : "Submit review"}
      </Button>
    </form>
  );
}
