import { ReviewModerationTable } from "@/components/admin/review-moderation-table";
import { getAdminReviews } from "@/actions/reviews";

export default async function AdminReviewsPage() {
  const data = await getAdminReviews();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">Reviews</h2>
        <p className="text-muted-foreground">
          Moderate customer feedback — hide or delete inappropriate reviews.
        </p>
      </div>

      <ReviewModerationTable reviews={data?.reviews ?? []} />
    </div>
  );
}
