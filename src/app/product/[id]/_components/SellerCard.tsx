"use client";

import Image from "next/image";
import Link from "next/link";
import StarRating from "@/components/ui/StarRating";
import { formatRating } from "@/lib/reviews";
import { monthYear } from "@/lib/day";
import type { ListingDetail } from "@/api/generated/types.gen";
import type { SellerStanding } from "../_lib/context";
import SellerActions from "./SellerActions";

/**
 * Who is selling it, directly under the buttons that buy from them.
 *
 * This replaces a band that ran the full width of the page. The band showed the same four
 * numbers, but a new seller has none of them, so on most listings it was a 1100px-wide strip
 * holding an avatar, a name and the month they joined — the emptiest thing on the page, and
 * it sat between the offer and the description. Beside the price, the same facts read as part
 * of the decision rather than as a section of their own.
 *
 * A number the reads could not fetch is left out rather than shown as zero: "0 đơn hoàn
 * thành" beside a new seller reads as a verdict, and beside a failed request it is a lie.
 */
export default function SellerCard({
  product,
  standing,
  onChat,
}: {
  product: ListingDetail;
  standing: SellerStanding;
  /**
   * What "Chat" does here. The product page hands over its own docked thread; anywhere
   * without one falls through to the inbox.
   */
  onChat?: () => void;
}) {
  const { seller } = product;
  const { account, reputation } = standing;
  const shopHref = `/shop/${seller.id}`;

  const reviewRating = reputation && reputation.review_rating_count > 0 ? reputation : null;
  const stats = [
    reputation && reputation.completed_orders > 0
      ? `${reputation.completed_orders} đơn hoàn thành`
      : null,
    account && account.follower_count > 0 ? `${account.follower_count} người theo dõi` : null,
    account ? `Tham gia ${monthYear(account.created_at)}` : null,
  ].filter((entry): entry is string => entry !== null);

  return (
    <section
      className="rounded-2xl border border-outline-variant bg-surface p-4"
      aria-label="Người bán"
    >
      <div className="flex items-center gap-3">
        <Link
          href={shopHref}
          className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-outline-variant"
        >
          {seller.avatar?.url ? (
            <Image
              src={seller.avatar.url}
              alt={seller.name}
              fill
              className="object-cover"
              sizes="44px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary-container font-title-md font-bold text-on-secondary-container">
              {seller.name.charAt(0)}
            </div>
          )}
        </Link>

        <div className="min-w-0">
          <Link
            href={shopHref}
            className="flex items-center gap-1 font-title-md font-bold text-on-surface transition-colors hover:text-primary"
          >
            <span className="truncate">{seller.name}</span>
            {account?.identity_verified && (
              <span
                className="material-symbols-outlined shrink-0 text-[17px] text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
                title="Đã xác minh danh tính"
              >
                verified
              </span>
            )}
          </Link>
          {reviewRating ? (
            <div className="mt-0.5 flex items-center gap-1.5 font-body-sm text-on-surface-variant">
              <StarRating rating={reviewRating.review_rating_average} size={13} />
              <span className="font-bold text-on-surface">
                {formatRating(reviewRating.review_rating_average)}
              </span>
              <span>({reviewRating.review_rating_count})</span>
            </div>
          ) : (
            <p className="mt-0.5 font-body-sm text-on-surface-variant">Người bán mới</p>
          )}
        </div>
      </div>

      {stats.length > 0 && (
        <p className="mt-3 font-body-sm leading-relaxed text-on-surface-variant">
          {stats.join(" · ")}
        </p>
      )}

      <div className="mt-4">
        <SellerActions
          sellerId={seller.id}
          listingId={product.id}
          following={account?.following ?? false}
          onChat={onChat}
        />
      </div>
    </section>
  );
}
