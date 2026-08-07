"use client";

import StarRating from "@/components/ui/StarRating";
import { formatRating } from "@/lib/reviews";
import type { Reputation } from "@/api/generated/types.gen";

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-label-sm text-on-surface-variant mb-1">{label}</div>
      <div className="font-headline-sm font-bold text-on-surface">{children}</div>
    </div>
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
  return (
    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-left pt-6 border-t border-outline-variant border-dashed">
      <Stat label="Người theo dõi">{followerCount}</Stat>
      <Stat label="Tham gia">
        {new Date(joinedAt).toLocaleDateString("vi-VN", { month: "short", year: "numeric" })}
      </Stat>

      {reputation && (
        <>
          <Stat label="Uy tín người bán">
            {reputation.rating_count > 0 ? (
              <span className="flex items-center gap-1">
                <StarRating rating={Math.round(reputation.rating_average)} size={16} />
                {formatRating(reputation.rating_average)}
                <span className="font-body-sm font-normal text-on-surface-variant">
                  ({reputation.rating_count})
                </span>
              </span>
            ) : (
              <span className="font-body-sm font-normal text-on-surface-variant">Chưa có</span>
            )}
          </Stat>
          <Stat label="Đơn hoàn thành">{reputation.completed_orders}</Stat>

          <Stat label="Đánh giá sản phẩm">
            {reputation.review_rating_count > 0 ? (
              <span className="flex items-center gap-1">
                <StarRating rating={Math.round(reputation.review_rating_average)} size={16} />
                {formatRating(reputation.review_rating_average)}
                <span className="font-body-sm font-normal text-on-surface-variant">
                  ({reputation.review_rating_count})
                </span>
              </span>
            ) : (
              <span className="font-body-sm font-normal text-on-surface-variant">Chưa có</span>
            )}
          </Stat>
          <Stat label="Đơn đã huỷ">{reputation.cancelled_orders}</Stat>
        </>
      )}
    </div>
  );
}
