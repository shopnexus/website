"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import Chip from "@/components/ui/Chip";
import Skeleton from "@/components/ui/Skeleton";
import {
  useListingReviewSummary,
  useListingReviews,
  type ReviewSort,
} from "@/hooks/api/useReviews";
import { useAuthStore } from "@/stores/use-auth-store";
import type { ListingDetail } from "@/api/generated/types.gen";
import { useReviewableOrders } from "../_hooks/useReviewableOrders";
import ReviewCard from "./ReviewCard";
import ReviewComposerModal from "./ReviewComposerModal";
import ReviewSummaryPanel from "./ReviewSummaryPanel";

const SORTS: Array<{ value: ReviewSort; label: string }> = [
  { value: "newest", label: "Mới nhất" },
  { value: "helpful", label: "Hữu ích nhất" },
];

/**
 * Everything a listing's reviews are: the rating and its distribution, the filters, the list,
 * and the way in for somebody who bought it.
 *
 * Every filter here now carries the number of reviews it will return, because the summary read
 * answers per-star counts and how many came with a photo. A chip whose size nobody can see is
 * a chip readers press to find out it was empty.
 */
export default function ProductReviews({ product }: { product: ListingDetail }) {
  const { user } = useAuthStore();
  const [sort, setSort] = useState<ReviewSort>("newest");
  const [rating, setRating] = useState<number | null>(null);
  const [mediaOnly, setMediaOnly] = useState(false);
  const [composing, setComposing] = useState(false);

  const { data: summary } = useListingReviewSummary(product.id);
  const { reviews, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useListingReviews(
    product.id,
    { sort, rating: rating ?? undefined, media: mediaOnly || undefined },
  );

  const { orders } = useReviewableOrders(product.id);
  const canReview = orders.length > 0;

  const openComposer = () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để đánh giá.");
      return;
    }
    setComposing(true);
  };

  return (
    <section id="reviews" className="scroll-mt-32">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-headline-md font-bold text-on-surface">Đánh giá sản phẩm</h2>
        {canReview && (
          <button
            type="button"
            onClick={openComposer}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 font-label-md text-on-primary shadow-sm transition-opacity hover:opacity-90"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              rate_review
            </span>
            Viết đánh giá
          </button>
        )}
      </div>

      {(summary?.review_count ?? product.review_count) > 0 && (
        <ReviewSummaryPanel
          summary={summary}
          sold={product.sold}
          favoriteCount={product.favorite_count}
          activeRating={rating}
          onPickRating={setRating}
        />
      )}

      {(summary?.review_count ?? product.review_count) > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Chip
            selected={rating === null && !mediaOnly}
            onClick={() => {
              setRating(null);
              setMediaOnly(false);
            }}
          >
            Tất cả{summary ? ` (${summary.review_count})` : ""}
          </Chip>
          {summary?.breakdown.map((bucket) => (
            <Chip
              key={bucket.rating}
              selected={rating === bucket.rating}
              icon="star"
              onClick={() => setRating(rating === bucket.rating ? null : bucket.rating)}
            >
              {bucket.rating} ({bucket.count})
            </Chip>
          ))}
          {summary && summary.with_media_count > 0 && (
            <Chip
              selected={mediaOnly}
              icon="photo_camera"
              onClick={() => setMediaOnly((current) => !current)}
            >
              Có hình ảnh ({summary.with_media_count})
            </Chip>
          )}

          <div className="ml-auto flex items-center gap-2">
            <label htmlFor="review-sort" className="font-label-sm text-on-surface-variant">
              Sắp xếp:
            </label>
            <select
              id="review-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value as ReviewSort)}
              className="rounded-lg border border-outline-variant bg-surface-container-lowest py-1.5 pl-3 pr-8 font-body-sm text-on-surface outline-none focus:border-primary"
            >
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-outline-variant bg-surface p-5">
              <div className="flex items-center gap-3">
                <Skeleton shape="circle" className="h-10 w-10 shrink-0" />
                <div className="flex-1">
                  <Skeleton className="mb-2 h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="mt-4 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-2/3" />
            </div>
          ))
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-low px-6 py-12 text-center">
            <span className="material-symbols-outlined mb-2 text-4xl text-outline" aria-hidden="true">
              reviews
            </span>
            <p className="font-body-lg text-on-surface-variant">
              {rating !== null
                ? `Chưa có đánh giá ${rating} sao cho sản phẩm này.`
                : mediaOnly
                  ? "Chưa có đánh giá nào kèm hình ảnh."
                  : "Chưa ai đánh giá sản phẩm này."}
            </p>
            {rating !== null || mediaOnly ? (
              <button
                type="button"
                onClick={() => {
                  setRating(null);
                  setMediaOnly(false);
                }}
                className="mt-4 font-label-md font-bold text-primary hover:underline"
              >
                Xem tất cả đánh giá
              </button>
            ) : (
              <p className="mt-2 font-body-sm text-on-surface-variant">
                {canReview
                  ? "Bạn đã mua sản phẩm này — hãy là người đầu tiên kể lại trải nghiệm."
                  : "Đánh giá chỉ đến từ người đã mua, nên mỗi dòng ở đây đều là hàng thật đã về tay."}
              </p>
            )}
          </div>
        ) : (
          reviews.map((review) => <ReviewCard key={review.id} review={review} />)
        )}
      </div>

      {hasNextPage && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="rounded-full border-2 border-primary px-10 py-2.5 font-label-md font-bold text-primary transition-colors hover:bg-primary hover:text-on-primary disabled:opacity-50"
          >
            {isFetchingNextPage ? "Đang tải..." : "Xem thêm đánh giá"}
          </button>
        </div>
      )}

      {composing && (
        <ReviewComposerModal
          open={composing}
          onClose={() => setComposing(false)}
          listingId={product.id}
          orders={orders}
        />
      )}
    </section>
  );
}
