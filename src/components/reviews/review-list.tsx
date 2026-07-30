import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export interface ReviewItem {
  id: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  createdAt: string;
  user: { name?: string | null; image?: string | null };
}

interface ReviewListProps {
  reviews: ReviewItem[];
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5",
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (!reviews.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No reviews yet. Be the first to share your experience.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => {
        const initials = (review.user.name ?? "U")
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();

        return (
          <article
            key={review.id}
            className="rounded-xl border border-border/70 bg-card/50 p-4"
          >
            <div className="flex items-start gap-3">
              <Avatar className="size-9">
                <AvatarImage src={review.user.image ?? undefined} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{review.user.name ?? "Anonymous"}</span>
                  <RatingStars rating={review.rating} />
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(review.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                {review.title && (
                  <h4 className="mt-2 font-heading text-sm font-semibold">
                    {review.title}
                  </h4>
                )}
                {review.comment && (
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {review.comment}
                  </p>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
