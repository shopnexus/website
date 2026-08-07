"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import Chip from "@/components/ui/Chip";
import Skeleton from "@/components/ui/Skeleton";
import { useListingReviews, type ReviewSort } from "@/hooks/api/useReviews";
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

const RATINGS = [5, 4, 3, 2, 1] as const;

/**
 * Everything a listing's reviews are: the rating, the filters, the list, and the way in
 * for somebody who bought it.
 *
 * The star filter carries no counts beside it — the API filters by rating but reports no
 * per-star totals, and a number here would be one nobody sent.
 */
export default function ProductReviews({ product }: { product: ListingDetail }) {
  const { user } = useAuthStore();
  const [sort, setSort] = useState<ReviewSort>("newest");
  const [rating, setRating] = useState<number | null>(null);
  const [composing, setComposing] = useState(false);

  const { reviews, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useListingReviews(
    product.id,
    { sort, rating: rating ?? undefined },
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
    <section id="reviews" className="mt-12 scroll-mt-24">
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

      <ReviewSummaryPanel
        rating={product.rating}
        reviewCount={product.review_count}
        sold={product.sold}
        favoriteCount={product.favorite_count}
      />

      {product.review_count > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Chip selected={rating === null} onClick={() => setRating(null)}>
            Tất cả
          </Chip>
          {RATINGS.map((star) => (
            <Chip
              key={star}
              selected={rating === star}
              icon="star"
              onClick={() => setRating(rating === star ? null : star)}
            >
              {star}
            </Chip>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <label htmlFor="review-sort" className="font-label-sm text-on-surface-variant">
              Sắp xếp:
            </label>
            <select
              id="review-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value as ReviewSort)}
              className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest py-1.5 pl-3 pr-8 font-body-sm text-on-surface outline-none focus:border-primary"
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
                : "Chưa ai đánh giá sản phẩm này."}
            </p>
            {rating !== null ? (
              <button
                type="button"
                onClick={() => setRating(null)}
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
