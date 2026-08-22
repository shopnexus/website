"use client";

import { useEffect, useState, type RefObject } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { formatMoney } from "@/lib/money";
import { listingDownNote, listingIsLive } from "@/lib/listing-state";
import type { ListingDetail, Variant } from "@/api/generated/types.gen";
import type { PurchaseActions } from "../_hooks/usePurchaseActions";

/**
 * The buy controls again, once the real ones have scrolled away.
 *
 * The bar used to be there from the first paint, which made it the *only* place to buy —
 * the price and the buttons were otherwise at the bottom of a very long column — and on a
 * phone it covered content the whole way down the page. Now the panel beside the photos is
 * where a purchase starts, and this appears only while that panel is off screen: it is a
 * reminder, not a second interface, so it holds no state of its own and calls the same
 * actions the panel does.
 *
 * `anchor` is watched rather than the scroll position: a bar that flips on a pixel threshold
 * has to guess where the panel ended, and it guesses wrong at every viewport width.
 */
export default function ProductBottomBar({
  product,
  selectedVariant,
  actions,
  anchor,
}: {
  product: ListingDetail;
  /** The variant the picker has chosen — what every action acts on. */
  selectedVariant: Variant;
  actions: PurchaseActions;
  anchor: RefObject<HTMLElement | null>;
}) {
  const visible = useScrolledPast(anchor);
  const live = listingIsLive(product);

  return (
    <div
      aria-hidden={!visible}
      className={[
        "fixed inset-x-0 bottom-0 z-40 border-t border-outline-variant bg-surface p-3",
        "shadow-[0_-4px_16px_-4px_rgba(0,0,0,0.12)]",
        // MD3 emphasized-decelerate on the way in. `visibility` rides the same transition so
        // the bar stops taking keyboard focus while it is off screen, and still slides out
        // rather than disappearing mid-animation.
        "transition-[transform,visibility] duration-400 ease-[cubic-bezier(0.05,0.7,0.1,1)] motion-reduce:transition-none",
        visible ? "visible translate-y-0" : "invisible pointer-events-none translate-y-full",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-4 px-1 md:px-5">
        {actions.isOwn ? (
          <>
            <span className="flex items-center gap-2 font-label-md text-on-surface-variant">
              <span className="material-symbols-outlined" aria-hidden="true">
                storefront
              </span>
              <span className="hidden sm:inline">Đây là tin đăng của bạn</span>
            </span>
            <Link href={`/account/products/${product.id}`}>
              <Button variant="primary" className="h-11 rounded-xl px-8">
                Chỉnh sửa tin
              </Button>
            </Link>
          </>
        ) : !live ? (
          // Only its seller and staff reach this page once the listing is down, and neither has
          // anything to buy: the server refuses a cart line, a session and an offer alike.
          <span className="mx-auto flex items-center gap-2 font-label-md text-on-surface-variant">
            <span className="material-symbols-outlined" aria-hidden="true">
              visibility_off
            </span>
            {listingDownNote(product).title} · không thể mua
          </span>
        ) : (
          <>
            <div className="hidden min-w-0 items-baseline gap-3 sm:flex">
              <span className="truncate font-label-md text-on-surface-variant">
                {product.name}
              </span>
              <span className="shrink-0 font-title-lg font-bold tabular-nums text-primary">
                {formatMoney(selectedVariant.price, product.currency)}
              </span>
            </div>

            <div className="flex w-full items-center gap-2 sm:w-auto">
              <button
                type="button"
                onClick={actions.toggleFavorite}
                disabled={actions.favoriteBusy}
                aria-pressed={product.favorited}
                aria-label={product.favorited ? "Bỏ lưu sản phẩm" : "Lưu sản phẩm"}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-outline-variant text-on-surface-variant transition-colors hover:text-primary disabled:opacity-50"
              >
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={{ fontVariationSettings: product.favorited ? "'FILL' 1" : "'FILL' 0" }}
                >
                  favorite
                </span>
              </button>
              <Button
                variant="secondary"
                className="h-11 flex-1 rounded-xl sm:flex-none sm:px-6"
                onClick={() => actions.addToCart(1)}
                disabled={actions.isOutOfStock}
              >
                Thêm vào giỏ
              </Button>
              <Button
                variant="primary"
                className="h-11 flex-1 rounded-xl font-bold sm:flex-none sm:px-8"
                onClick={actions.buyNow}
                disabled={actions.isBuying || actions.isOutOfStock}
              >
                {actions.isOutOfStock
                  ? "Hết hàng"
                  : actions.isBuying
                    ? "Đang xử lý..."
                    : "Mua ngay"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Whether the anchor has left the viewport upwards.
 *
 * Upwards specifically: an anchor below the fold on first paint is also "not intersecting",
 * and a bar that appeared before the reader had ever seen the real controls would be back to
 * being the only interface.
 */
function useScrolledPast(anchor: RefObject<HTMLElement | null>): boolean {
  const [past, setPast] = useState(false);

  useEffect(() => {
    const element = anchor.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setPast(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [anchor]);

  return past;
}
