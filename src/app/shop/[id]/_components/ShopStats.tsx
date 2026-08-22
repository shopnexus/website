"use client";

import StarRating from "@/components/ui/StarRating";
import { formatRating } from "@/lib/reviews";
import { monthYear } from "@/lib/day";
import type { Reputation } from "@/api/generated/types.gen";

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-label-sm text-on-surface-variant">{label}</div>
      <div className="mt-0.5 font-title-md font-bold text-on-surface">{children}</div>
    </div>
  );
}

function Rating({ average, count }: { average: number; count: number }) {
  return (
    <span className="flex items-center gap-1">
      <StarRating rating={Math.round(average)} size={15} />
      {formatRating(average)}
      <span className="font-body-sm font-normal text-on-surface-variant">({count})</span>
    </span>
  );
}

/**
 * The seller's standing, as the two averages it actually is.
 *
 * `rating_average` is how the counterparties of their sales rated *them* — how they
 * packed, how they answered. `review_rating_average` is how buyers rated the *goods*.
 * They are separate columns because one order can produce both and summing them would
 * count that order twice; the shop page used to show only the first and drop the second
 * on the floor, which is the number a shopper is actually looking for.
 *
 * Only the numbers there are. This was a fixed grid of six, so a new seller's shop opened
 * with "Chưa có · 0 · Chưa có · 0" — four cells arguing that there is nothing here, in the
 * place a shopper looks for a reason to trust somebody. A short list of what is true says
 * less and means more, and "Đơn đã huỷ" appears only when there are some: zero cancelled
 * orders is not an achievement, and printing the label puts the idea in the reader's head.
 */
export default function ShopStats({
  followerCount,
  joinedAt,
  reputation,
}: {
  followerCount: number;
  joinedAt: string;
  reputation: Reputation | undefined;
}) {
  const stats: Array<{ key: string; label: string; value: React.ReactNode }> = [];

  if (reputation && reputation.rating_count > 0) {
    stats.push({
      key: "seller-rating",
      label: "Uy tín người bán",
      value: <Rating average={reputation.rating_average} count={reputation.rating_count} />,
    });
  }
  if (reputation && reputation.review_rating_count > 0) {
    stats.push({
      key: "product-rating",
      label: "Đánh giá sản phẩm",
      value: (
        <Rating
          average={reputation.review_rating_average}
          count={reputation.review_rating_count}
        />
      ),
    });
  }
  if (reputation && reputation.completed_orders > 0) {
    stats.push({
      key: "completed",
      label: "Đơn hoàn thành",
      value: reputation.completed_orders,
    });
  }
  if (reputation && reputation.cancelled_orders > 0) {
    stats.push({ key: "cancelled", label: "Đơn đã huỷ", value: reputation.cancelled_orders });
  }
  if (followerCount > 0) {
    stats.push({ key: "followers", label: "Người theo dõi", value: followerCount });
  }
  stats.push({ key: "joined", label: "Tham gia", value: monthYear(joinedAt) });

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-3 border-t border-dashed border-outline-variant pt-4 text-left">
      {stats.map((stat) => (
        <Stat key={stat.key} label={stat.label}>
          {stat.value}
        </Stat>
      ))}
    </div>
  );
}
