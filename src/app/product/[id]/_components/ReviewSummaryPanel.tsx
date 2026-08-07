import StarRating from "@/components/ui/StarRating";
import { formatRating } from "@/lib/reviews";

/**
 * The rating, at the scale of a claim rather than a badge.
 *
 * No star histogram: the API reports an average and a count, and per-star totals are not
 * something it answers — a bar chart here would be four numbers nobody sent.
 */
export default function ReviewSummaryPanel({
  rating,
  reviewCount,
  sold,
  favoriteCount,
}: {
  rating: number;
  reviewCount: number;
  sold: number;
  favoriteCount: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-10 gap-y-6 rounded-2xl border border-outline-variant bg-primary-container/10 p-6">
      <div className="flex items-center gap-4">
        <div className="font-display-lg text-[44px] leading-none text-primary">
          {reviewCount > 0 ? formatRating(rating) : "—"}
        </div>
        <div className="flex flex-col gap-1">
          <StarRating rating={rating} size={20} />
          <span className="font-label-sm text-on-surface-variant">
            {reviewCount > 0 ? `${reviewCount} đánh giá` : "Chưa có đánh giá"}
          </span>
        </div>
      </div>

      <dl className="flex gap-10">
        <div>
          <dt className="font-label-sm text-on-surface-variant">Đã bán</dt>
          <dd className="font-headline-sm font-bold text-on-surface">{sold}</dd>
        </div>
        <div>
          <dt className="font-label-sm text-on-surface-variant">Lượt lưu</dt>
          <dd className="font-headline-sm font-bold text-on-surface">{favoriteCount}</dd>
        </div>
      </dl>
    </div>
  );
}
