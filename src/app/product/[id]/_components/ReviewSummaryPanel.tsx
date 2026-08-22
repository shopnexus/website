"use client";

import StarRating from "@/components/ui/StarRating";
import { formatRating } from "@/lib/reviews";
import type { ReviewSummary } from "@/api/generated/types.gen";

/**
 * The rating, with the distribution behind it.
 *
 * This panel used to carry a comment saying a histogram was impossible: the API answered an
 * average and a count, and "per-star totals are not something it answers". They are now —
 * `GET /listings/{id}/reviews/summary` returns five buckets and the number of reviews that
 * came with a photo — so the shape of a 4.6 is on screen instead of being implied. Four
 * five-star reviews and one one-star review average the same as five fours and are not the
 * same product.
 *
 * Each bar is the filter for that rating, because a reader who looks at the one-star row is
 * already asking to read those.
 */
export default function ReviewSummaryPanel({
  summary,
  sold,
  favoriteCount,
  activeRating,
  onPickRating,
}: {
  summary: ReviewSummary | undefined;
  sold: number;
  favoriteCount: number;
  activeRating: number | null;
  onPickRating: (rating: number | null) => void;
}) {
  const total = summary?.review_count ?? 0;

  // Only rendered when there is something to summarise: with no reviews the list below has
  // its own empty state, and two of them stacked said the same absence twice.
  return (
    <div className="grid gap-6 rounded-3xl border border-outline-variant bg-surface p-5 sm:p-6 md:grid-cols-[minmax(0,220px)_1fr] md:gap-10">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="font-display-lg text-[44px] leading-none tabular-nums text-primary">
            {formatRating(summary?.rating ?? 0)}
          </div>
          <div className="flex flex-col gap-1">
            <StarRating rating={summary?.rating ?? 0} size={20} />
            <span className="font-label-sm text-on-surface-variant">{total} đánh giá</span>
          </div>
        </div>

        <dl className="flex gap-8 border-t border-outline-variant pt-4">
          <div>
            <dt className="font-label-sm text-on-surface-variant">Đã bán</dt>
            <dd className="font-title-md font-bold tabular-nums text-on-surface">{sold}</dd>
          </div>
          <div>
            <dt className="font-label-sm text-on-surface-variant">Lượt lưu</dt>
            <dd className="font-title-md font-bold tabular-nums text-on-surface">{favoriteCount}</dd>
          </div>
        </dl>
      </div>

      {summary && (
        <div className="flex flex-col justify-center gap-1.5">
          {summary.breakdown.map((bucket) => {
            const share = total > 0 ? bucket.count / total : 0;
            const isActive = activeRating === bucket.rating;
            return (
              <button
                key={bucket.rating}
                type="button"
                onClick={() => onPickRating(isActive ? null : bucket.rating)}
                aria-pressed={isActive}
                disabled={bucket.count === 0}
                className={[
                  "group flex items-center gap-3 rounded-lg px-2 py-1 text-left transition-colors",
                  bucket.count === 0
                    ? "cursor-default opacity-55"
                    : "hover:bg-surface-container-low",
                  isActive ? "bg-primary-container/40" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className="flex w-10 shrink-0 items-center gap-0.5 font-body-sm tabular-nums text-on-surface-variant">
                  {bucket.rating}
                  <span
                    className="material-symbols-outlined text-[14px] text-primary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                    aria-hidden="true"
                  >
                    star
                  </span>
                </span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container-high">
                  <span
                    className="block h-full rounded-full bg-primary transition-[width] duration-500 ease-out motion-reduce:transition-none"
                    style={{ width: `${share * 100}%` }}
                  />
                </span>
                <span className="w-12 shrink-0 text-right font-body-sm tabular-nums text-on-surface-variant">
                  {bucket.count}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
