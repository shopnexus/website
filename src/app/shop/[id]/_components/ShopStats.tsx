"use client";

import StarRating from "@/components/ui/StarRating";
import { formatRating } from "@/lib/reviews";
import { monthYear } from "@/lib/day";
import type { Reputation } from "@/api/generated/types.gen";

/**
 * The seller's standing, as one line of facts beside their name.
 *
 * It was a two-by-three grid in a narrow left column, which is what a *page* of statistics
 * looks like — and this shop has four numbers, two of which most sellers do not have yet. A
 * row reads in one pass and takes one line, which is the right amount of room for "who am I
 * buying from" on a page whose job is to show what they are selling.
 *
 * `rating_average` is how the counterparties of their sales rated *them* — how they packed,
 * how they answered. `review_rating_average` is how buyers rated the *goods*. They are
 * separate columns because one order can produce both and summing them would count that
 * order twice; the shop page used to show only the first and drop the second on the floor,
 * which is the number a shopper is actually looking for.
 *
 * Only the numbers there are. A fixed set meant a new seller's shop opened with "Chưa có · 0
 * · Chưa có · 0" — four cells arguing that there is nothing here, in the place a shopper
 * looks for a reason to trust somebody. "Đơn đã huỷ" appears only when there are some: nought
 * cancelled orders is not an achievement, and printing the label puts the idea in the
 * reader's head.
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
  const facts: React.ReactNode[] = [];

  if (reputation && reputation.rating_count > 0) {
    facts.push(
      <Fact key="seller-rating">
        <StarRating rating={Math.round(reputation.rating_average)} size={14} />
        <strong className="font-bold text-on-surface">
          {formatRating(reputation.rating_average)}
        </strong>
        <span>({reputation.rating_count} lượt đánh giá người bán)</span>
      </Fact>,
    );
  }
  if (reputation && reputation.review_rating_count > 0) {
    facts.push(
      <Fact key="product-rating">
        <strong className="font-bold text-on-surface">
          {formatRating(reputation.review_rating_average)}
        </strong>
        <span>trên {reputation.review_rating_count} đánh giá sản phẩm</span>
      </Fact>,
    );
  }
  if (reputation && reputation.completed_orders > 0) {
    facts.push(
      <Fact key="completed">
        <strong className="font-bold text-on-surface">{reputation.completed_orders}</strong>
        <span>đơn hoàn thành</span>
      </Fact>,
    );
  }
  if (reputation && reputation.cancelled_orders > 0) {
    facts.push(
      <Fact key="cancelled">
        <strong className="font-bold text-on-surface">{reputation.cancelled_orders}</strong>
        <span>đơn đã huỷ</span>
      </Fact>,
    );
  }
  if (followerCount > 0) {
    facts.push(
      <Fact key="followers">
        <strong className="font-bold text-on-surface">{followerCount}</strong>
        <span>người theo dõi</span>
      </Fact>,
    );
  }
  facts.push(<Fact key="joined">Tham gia {monthYear(joinedAt)}</Fact>);

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-body-sm text-on-surface-variant">
      {facts.map((fact, index) => (
        <span key={index} className="flex items-center gap-x-2">
          {index > 0 && (
            <span aria-hidden="true" className="text-outline-variant">
              ·
            </span>
          )}
          {fact}
        </span>
      ))}
    </div>
  );
}

function Fact({ children }: { children: React.ReactNode }) {
  return <span className="flex items-center gap-1.5">{children}</span>;
}
