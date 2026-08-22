"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/stores/use-auth-store";
import { useAddFavorite, useRemoveFavorite, recordInteraction } from "@/hooks/api/useCatalog";
import { formatMoney } from "@/lib/money";
import { timeAgoShort } from "@/lib/day";
import { shortProvince } from "@/lib/place";
import { toast } from "react-hot-toast";

/**
 * What a card needs, rather than a whole Listing.
 *
 * Structural on purpose: the generated `Listing` satisfies it, and so does anything else
 * that can name a product and a price — a search hit, an order line joined to its
 * listing, a fixture. Requiring the full type would make every caller carry fields the
 * card never reads.
 */
export interface ProductCardItem {
  id: string;
  /**
   * The public slug, which is what the card links to: it carries the listing's id on the
   * end, so it resolves, and it puts the product's name in the URL. Optional because a
   * caller holding only an id — an order line, a fixture — can still render a card, and
   * the link then falls back to the id the route also accepts.
   */
  slug?: string;
  name: string;
  price: number;
  /**
   * The currency the price is in. Optional and defaulted, because a caller with only an id
   * and a number can still draw a card — but when the row has one it is read, so a listing
   * priced in anything else is not rendered as đồng.
   */
  currency?: string;
  price_mode?: "fixed" | "negotiable";
  created_at: string;
  cover?: { url?: string | null } | null;
  /**
   * Where the goods are. Null on a listing that was never published, and `distance_km` is
   * null unless the browse sent a position — the server always sends the key, so this
   * mirrors the contract rather than accepting `undefined` the API never produces.
   */
  location?: { province_name: string; distance_km?: number | null } | null;
  favorited?: boolean;
  favorite_count?: number;
  /**
   * Average review rating, 0 when nobody has reviewed it, and the count beside it —
   * because a 5.0 from one review and a 5.0 from two hundred are not the same claim, and
   * a card that showed only the average would say they were.
   */
  rating?: number;
  review_count?: number;
  /** Completed sales. An open checkout does not count and a cancelled one never did. */
  sold?: number;
}

interface ProductCardProps {
  product: ProductCardItem;
  className?: string;
  /**
   * Which surface this card is drawn on, if it is one of the three the contract can tell
   * apart. Omitted where a click means neither — a shop's own listing page, the "similar
   * products" rail — those are not a search result, the recommended feed or a category
   * browse, and sending a wrong source would tell personalisation an account clicked from
   * search when it did not.
   */
  source?: "search" | "recommended" | "category";
  /**
   * Offers "Không quan tâm" / "Ẩn tin này". Only truthful on the recommended feed: that is
   * the one list a hidden card actually leaves, since the server excludes a listing from
   * `sort=recommended` alone. A search result or a category browse would show the same menu
   * and then not remove the card — a promise the UI cannot keep — so callers on those
   * surfaces leave this off rather than pass it conditionally on `source`.
   */
  dismissible?: boolean;
  /**
   * Whether to name the place. Off on a shop's own page, where every card carries the same
   * seller's pickup address: the same province printed a hundred and sixty times is not
   * information, it is a column of noise where the posting date could be read instead.
   */
  showPlace?: boolean;
  /** True while this card is inside its undo window — still on screen, fading out. */
  isDismissing?: boolean;
  onDismiss?: (type: "not-interested" | "hidden") => void;
}

/**
 * One listing, at the size a page of them is scanned at.
 *
 * The order is the change worth naming. It used to open with the seller — a 20px avatar and
 * a name across the top — then the title, then whatever social proof existed, then the price,
 * then a ruled-off footer holding `21/8/2026` and a province. Which is close to the reverse of
 * how somebody reads a page of small ads: the photo, then what it is, then what it costs, then
 * whether it is near and recent enough to bother with.
 *
 * So the seller is gone from the card entirely. On a C2C marketplace a stranger's name is the
 * weakest signal on it — it is not a brand, and nobody recognises it — and it was the most
 * expensive thing on it: a full row of height and an avatar request per card, twenty-four times
 * per screen. The rating is the seller signal that survives, because it is earned. The name is
 * one tap away on the listing itself, which is where a buyer actually weighs it.
 *
 * Everything below the title is pushed to the bottom of the card, so price sits above price and
 * place above place across a row however long the titles run.
 */
export default function ProductCard({
  product,
  className = "",
  source,
  dismissible = false,
  showPlace = true,
  isDismissing = false,
  onDismiss,
}: ProductCardProps) {
  // No placeholder service. A picsum fallback fetched a random stranger's photo from a
  // third party and rendered it where the product goes — a listing with no photo then
  // looked like a listing with the wrong one, which is worse than looking empty.
  const imageUrl = product.cover?.url;
  const { user } = useAuthStore();
  const { mutate: addFavorite, isPending: isAdding } = useAddFavorite();
  const { mutate: removeFavorite, isPending: isRemoving } = useRemoveFavorite();
  const isPending = isAdding || isRemoving;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnOutsideClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  const handleCardClick = () => {
    if (source) recordInteraction(product.id, `click-from-${source}`);
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen((open) => !open);
  };

  const handleDismiss = (e: React.MouseEvent, type: "not-interested" | "hidden") => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    onDismiss?.(type);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation();

    if (!user) {
      toast.error("Vui lòng đăng nhập để lưu sản phẩm");
      return;
    }

    if (isPending) return;

    if (product.favorited) {
      removeFavorite(product.id, {
        onError: () => toast.error("Có lỗi xảy ra khi bỏ lưu sản phẩm"),
      });
    } else {
      addFavorite(product.id, {
        onError: () => toast.error("Có lỗi xảy ra khi lưu sản phẩm"),
      });
    }
  };

  // Distance when the browse sent a position, the province otherwise — the same rule the
  // listing's own facts use, because "cách 2,4 km" answers the question a province only
  // narrows.
  const place = showPlace && product.location
    ? product.location.distance_km != null
      ? `Cách ${product.location.distance_km.toFixed(1)} km`
      : shortProvince(product.location.province_name)
    : null;

  const reviews = product.review_count ?? 0;
  const sold = product.sold ?? 0;

  return (
    <div
      // h-full both here and on the link: the grid stretches this wrapper to the tallest card
      // in the row, and without it the card inside ended wherever its own text did — which is
      // what made a grid of cards look ragged even though every cell was the same size.
      className={`relative h-full transition-all duration-300 ease-out ${
        isDismissing ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      <Link
        href={`/product/${product.slug ?? product.id}`}
        onClick={handleCardClick}
        aria-hidden={isDismissing}
        tabIndex={isDismissing ? -1 : undefined}
        className={`group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface transition-shadow duration-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] ${className}`}
      >
        <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-surface-container">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 20vw"
            />
          ) : (
            <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-[32px] text-on-surface-variant">
              inventory_2
            </span>
          )}
          {product.price_mode === "negotiable" && (
            <span className="absolute left-2 top-2 rounded bg-tertiary-container/90 px-1.5 py-0.5 font-label-xs text-on-tertiary-container shadow-sm backdrop-blur-sm">
              Thương lượng
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-2.5">
          {/* Two lines, and the height of two lines whether it uses them or not: the block
              below is pinned to the bottom, and a reserved title keeps short and long names
              from shifting the price up and down the row. */}
          <h3 className="line-clamp-2 min-h-[44px] font-body-sm font-medium leading-snug text-on-surface">
            {product.name}
          </h3>

          <div className="mt-auto pt-1.5">
            <p className="font-price-lg text-primary">
              {formatMoney(product.price, product.currency ?? "VND")}
            </p>

            {/* Only when there is any: "0.0 (0)" beside a price reads as a verdict on the
                goods rather than as a listing nobody has bought yet. */}
            {(reviews > 0 || sold > 0) && (
              <p className="mt-1 flex items-center gap-1 truncate font-label-xs text-on-surface-variant">
                {reviews > 0 && (
                  <>
                    <span
                      className="material-symbols-outlined text-[13px] text-primary"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                      aria-hidden="true"
                    >
                      star
                    </span>
                    <span className="font-bold text-on-surface">
                      {(product.rating ?? 0).toFixed(1)}
                    </span>
                    <span>({reviews})</span>
                  </>
                )}
                {reviews > 0 && sold > 0 && <span aria-hidden="true">·</span>}
                {sold > 0 && <span className="truncate">Đã bán {sold}</span>}
              </p>
            )}

            {/* Where and how fresh, on one line. It was a ruled-off footer holding an absolute
                date — `21/8/2026` tells a browsing reader nothing, while "3 ngày trước" is
                half of what makes a small ad worth answering. */}
            <p className="mt-1 flex items-center gap-1 font-label-xs text-on-surface-variant">
              {place && (
                <>
                  <span
                    className="material-symbols-outlined shrink-0 text-[13px]"
                    aria-hidden="true"
                  >
                    location_on
                  </span>
                  <span className="truncate">{place}</span>
                  <span aria-hidden="true">·</span>
                </>
              )}
              <span className="shrink-0">{timeAgoShort(product.created_at)}</span>
            </p>
          </div>
        </div>
      </Link>

      {/* The action cluster sits outside the <Link>, not in the image box: both the card and
          the image clip with overflow-hidden, which cut the dropdown off at the photo's edge.
          Out here it also stops nesting buttons inside an anchor. */}
      <div ref={menuRef} className="absolute right-2 top-2 z-10 flex items-center gap-1.5">
        {dismissible && (
          <button
            onClick={handleMenuToggle}
            className="grid h-8 w-8 place-items-center rounded-full bg-surface/85 shadow-sm backdrop-blur-sm transition-colors hover:bg-surface"
            aria-label="Tuỳ chọn gợi ý"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
              more_vert
            </span>
          </button>
        )}
        {menuOpen && (
          // Anchored to the whole cluster, not to the ⋮ button, which sits left of the heart:
          // anchoring to the button pushed the panel a heart's width further left, off the page
          // edge in the grid's left column. The width caps at one grid cell for the same reason.
          <div
            role="menu"
            className="absolute right-0 top-full mt-1.5 w-[min(14rem,calc(50vw-2rem))] overflow-hidden rounded-lg border border-outline-variant bg-surface py-1 shadow-[0_4px_16px_rgba(0,0,0,0.12)] animate-page-fade-in"
          >
            <button
              role="menuitem"
              onClick={(e) => handleDismiss(e, "not-interested")}
              className="flex w-full cursor-pointer items-start gap-2 px-3 py-2.5 text-left transition-colors hover:bg-surface-container"
            >
              <span className="material-symbols-outlined mt-0.5 text-[18px] text-on-surface-variant">
                thumb_down
              </span>
              <span className="min-w-0">
                <span className="block font-body-sm font-medium text-on-surface">
                  Không quan tâm
                </span>
                <span className="mt-0.5 block font-label-xs text-on-surface-variant">
                  Ít gợi ý sản phẩm như thế này hơn
                </span>
              </span>
            </button>
            <button
              role="menuitem"
              onClick={(e) => handleDismiss(e, "hidden")}
              className="flex w-full cursor-pointer items-start gap-2 px-3 py-2.5 text-left transition-colors hover:bg-surface-container"
            >
              <span className="material-symbols-outlined mt-0.5 text-[18px] text-on-surface-variant">
                visibility_off
              </span>
              <span className="min-w-0">
                <span className="block font-body-sm font-medium text-on-surface">Ẩn tin này</span>
                <span className="mt-0.5 block font-label-xs text-on-surface-variant">
                  Không hiện tin này trong Gợi ý cho bạn nữa
                </span>
              </span>
            </button>
          </div>
        )}
        <button
          onClick={handleFavoriteClick}
          disabled={isPending}
          className="grid h-8 w-8 place-items-center rounded-full bg-surface/85 shadow-sm backdrop-blur-sm transition-colors hover:bg-surface disabled:opacity-50"
          aria-label={product.favorited ? "Bỏ lưu sản phẩm" : "Lưu sản phẩm"}
        >
          <span
            className={`material-symbols-outlined text-[18px] transition-colors ${
              product.favorited ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
            }`}
            style={{ fontVariationSettings: product.favorited ? "'FILL' 1" : "'FILL' 0" }}
          >
            favorite
          </span>
        </button>
      </div>
    </div>
  );
}
