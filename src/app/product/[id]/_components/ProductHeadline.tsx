"use client";

import StarRating from "@/components/ui/StarRating";
import { formatRating } from "@/lib/reviews";
import type { ListingDetail } from "@/api/generated/types.gen";
import type { PurchaseActions } from "../_hooks/usePurchaseActions";

/**
 * What the thing is called, and the three numbers that say whether anyone else wanted it.
 *
 * Its own block because the page is three columns on a wide screen and one on a phone, and
 * the name has to be the first thing after the photo at both. Keeping it inside the buy card
 * would have put the price above the title on a phone; keeping it in the middle column as
 * part of a larger block would have dragged the specifications up there with it.
 */
export default function ProductHeadline({
  product,
  actions,
}: {
  product: ListingDetail;
  actions: PurchaseActions;
}) {
  return (
    <header>
      <div className="flex items-start justify-between gap-3">
        <h1 className="font-title-lg font-bold leading-snug text-on-surface xl:text-[22px] xl:leading-8">
          {product.name}
        </h1>
        <button
          type="button"
          onClick={actions.toggleFavorite}
          disabled={actions.favoriteBusy}
          aria-pressed={product.favorited}
          aria-label={product.favorited ? "Bỏ lưu sản phẩm" : "Lưu sản phẩm"}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-outline-variant transition-colors hover:bg-surface-container-high disabled:opacity-50"
        >
          <span
            className={[
              "material-symbols-outlined text-[20px] transition-colors",
              product.favorited ? "text-primary" : "text-on-surface-variant",
            ].join(" ")}
            style={{ fontVariationSettings: product.favorited ? "'FILL' 1" : "'FILL' 0" }}
          >
            favorite
          </span>
        </button>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-body-sm text-on-surface-variant">
        {product.review_count > 0 ? (
          <a
            href="#reviews"
            className="flex items-center gap-1.5 transition-colors hover:text-primary"
          >
            <StarRating rating={product.rating} size={15} />
            <span className="font-bold text-on-surface">{formatRating(product.rating)}</span>
            <span className="underline decoration-dotted underline-offset-4">
              {product.review_count} đánh giá
            </span>
          </a>
        ) : (
          <a href="#reviews" className="transition-colors hover:text-primary">
            Chưa có đánh giá
          </a>
        )}
        {product.sold > 0 && (
          <>
            <span aria-hidden="true">·</span>
            <span>Đã bán {product.sold}</span>
          </>
        )}
        {product.favorite_count > 0 && (
          <>
            <span aria-hidden="true">·</span>
            <span>{product.favorite_count} lượt lưu</span>
          </>
        )}
      </div>
    </header>
  );
}
