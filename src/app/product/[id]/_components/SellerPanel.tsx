import Image from "next/image";
import Link from "next/link";
import StarRating from "@/components/ui/StarRating";
import { formatRating } from "@/lib/reviews";
import { monthYear } from "@/lib/day";
import type { ListingDetail } from "@/api/generated/types.gen";
import type { SellerStanding } from "../_lib/context";
import SellerActions from "./SellerActions";

/**
 * Who is selling it, with the record that makes them worth buying from.
 *
 * The card used to be an avatar, a name and two buttons — on a C2C marketplace, the half of the
 * page a buyer is least able to check and the half that said the least. Everything added is a
 * public read this page simply never made: the seller's product-review average and how many
 * reviews it averages, how many sales they have completed, how many people follow them, whether
 * they verified their identity, and how long they have been here.
 *
 * A band across the page rather than a column beside the photos. It was a narrow card under the
 * gallery first, which put a three-up strip of statistics in a 400px slot and read as "0 · 0 ·
 * tháng 8/2026" — a row of zeros where a reader looks for reassurance. Given the width it needs,
 * the same numbers read as a shopfront, and it sits where a shopper looks for it: after they know
 * what the thing is and what it costs, before they read the description.
 *
 * A number the reads could not fetch is left out rather than shown as zero: "0 đơn hoàn thành"
 * beside a new seller reads as a verdict, and beside a failed request it is a lie.
 */
export default function SellerPanel({
  product,
  standing,
}: {
  product: ListingDetail;
  standing: SellerStanding;
}) {
  const { seller } = product;
  const { account, reputation } = standing;
  const shopHref = `/shop/${seller.id}`;

  const reviewRating = reputation && reputation.review_rating_count > 0 ? reputation : null;

  return (
    <section
      className="flex flex-col gap-5 rounded-2xl border border-outline-variant bg-surface p-5 sm:p-6 lg:flex-row lg:items-center lg:gap-8"
      aria-label="Người bán"
    >
      <div className="flex min-w-0 items-center gap-4 lg:w-[300px]">
        <Link
          href={shopHref}
          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-outline-variant"
        >
          {seller.avatar?.url ? (
            <Image src={seller.avatar.url} alt={seller.name} fill className="object-cover" sizes="64px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary-container font-title-lg font-bold text-on-secondary-container">
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
                className="material-symbols-outlined shrink-0 text-[18px] text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
                title="Đã xác minh danh tính"
              >
                verified
              </span>
            )}
          </Link>
          {reviewRating ? (
            <div className="mt-1 flex items-center gap-1.5 font-body-sm text-on-surface-variant">
              <StarRating rating={reviewRating.review_rating_average} size={14} />
              <span className="font-bold text-on-surface">
                {formatRating(reviewRating.review_rating_average)}
              </span>
              <span>({reviewRating.review_rating_count})</span>
            </div>
          ) : (
            <p className="mt-1 font-body-sm text-on-surface-variant">Người bán mới</p>
          )}
        </div>
      </div>

      {/* Only the numbers there are. A seller with no completed sales is a new seller, and a row
          of zeros is the least reassuring thing this band could say about them. */}
      <dl className="flex flex-wrap gap-x-10 gap-y-4 border-t border-outline-variant pt-4 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
        {reputation && reputation.completed_orders > 0 && (
          <Stat label="Đơn đã hoàn thành" value={String(reputation.completed_orders)} />
        )}
        {account && account.follower_count > 0 && (
          <Stat label="Người theo dõi" value={String(account.follower_count)} />
        )}
        {account?.identity_verified && <Stat label="Danh tính" value="Đã xác minh" />}
        {account && <Stat label="Tham gia" value={monthYear(account.created_at)} />}
        {account?.description && (
          <div className="min-w-[220px] flex-1 basis-full xl:basis-auto">
            <dt className="font-label-sm text-on-surface-variant">Giới thiệu</dt>
            <dd className="mt-0.5 line-clamp-2 font-body-sm leading-relaxed text-on-surface">
              {account.description}
            </dd>
          </div>
        )}
      </dl>

      <div className="shrink-0 lg:ml-auto lg:w-[248px]">
        <SellerActions
          sellerId={seller.id}
          listingId={product.id}
          following={account?.following ?? false}
        />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-label-sm text-on-surface-variant">{label}</dt>
      <dd className="mt-0.5 font-title-sm font-bold tabular-nums text-on-surface">{value}</dd>
    </div>
  );
}
