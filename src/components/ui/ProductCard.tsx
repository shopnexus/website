"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/stores/use-auth-store";
import { useAddFavorite, useRemoveFavorite, recordInteraction } from "@/hooks/api/useCatalog";
import { toast } from "react-hot-toast";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

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
  price_mode?: "fixed" | "negotiable";
  created_at: string;
  cover?: { url?: string | null } | null;
  seller?: { name: string; avatar?: { url?: string | null } | null };
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
  /** True while this card is inside its undo window — still on screen, fading out. */
  isDismissing?: boolean;
  onDismiss?: (type: "not-interested" | "hidden") => void;
}

export default function ProductCard({
  product,
  className = "",
  source,
  dismissible = false,
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

  return (
    <div
      className={`transition-all duration-300 ease-out ${
        isDismissing ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
    <Link
      href={`/product/${product.slug ?? product.id}`}
      onClick={handleCardClick}
      aria-hidden={isDismissing}
      tabIndex={isDismissing ? -1 : undefined}
      className={`bg-surface rounded-xl overflow-hidden border border-outline-variant/30 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow duration-300 flex flex-col group cursor-pointer ${className}`}
    >
      <div className="relative aspect-[4/3] bg-surface-container overflow-hidden shrink-0">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-on-surface-variant material-symbols-outlined text-[32px]">
            inventory_2
          </span>
        )}
        {product.price_mode === "negotiable" && (
          <div className="absolute top-2 left-2 z-10">
            <span className="text-[10px] font-bold px-2 py-1 bg-tertiary-container/90 backdrop-blur-sm text-on-tertiary-container rounded shadow-sm whitespace-nowrap">
              Thương lượng
            </span>
          </div>
        )}
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
          {dismissible && (
            <div ref={menuRef} className="relative">
              <button
                onClick={handleMenuToggle}
                className="p-1.5 h-9.5 aspect-square flex items-center justify-center rounded-full bg-surface/80 backdrop-blur-sm border border-outline-variant/20 shadow-sm hover:bg-surface transition-colors"
                aria-label="Tuỳ chọn gợi ý"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                  more_vert
                </span>
              </button>
              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-1.5 w-56 bg-surface rounded-lg border border-outline-variant/60 shadow-[0_4px_16px_rgba(0,0,0,0.12)] overflow-hidden py-1 animate-page-fade-in"
                >
                  <button
                    role="menuitem"
                    onClick={(e) => handleDismiss(e, "not-interested")}
                    className="w-full flex items-start gap-2.5 px-3.5 py-2.5 text-left hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant mt-0.5">
                      thumb_down
                    </span>
                    <span className="min-w-0">
                      <span className="block text-body-sm font-medium text-on-surface">Không quan tâm</span>
                      <span className="block text-[11px] text-on-surface-variant mt-0.5">
                        Ít gợi ý sản phẩm như thế này hơn
                      </span>
                    </span>
                  </button>
                  <button
                    role="menuitem"
                    onClick={(e) => handleDismiss(e, "hidden")}
                    className="w-full flex items-start gap-2.5 px-3.5 py-2.5 text-left hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant mt-0.5">
                      visibility_off
                    </span>
                    <span className="min-w-0">
                      <span className="block text-body-sm font-medium text-on-surface">Ẩn tin này</span>
                      <span className="block text-[11px] text-on-surface-variant mt-0.5">
                        Không hiện tin này trong Gợi ý cho bạn nữa
                      </span>
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
          <button
            onClick={handleFavoriteClick}
            disabled={isPending}
            className="p-1.5 h-9.5 rounded-full bg-surface/80 backdrop-blur-sm border border-outline-variant/20 shadow-sm hover:bg-surface transition-colors disabled:opacity-50"
            aria-label={product.favorited ? "Bỏ lưu sản phẩm" : "Lưu sản phẩm"}
          >
            <span
              className={`material-symbols-outlined text-[20px] transition-colors ${
                product.favorited ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
                }`}
              style={{ fontVariationSettings: product.favorited ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
          </button>
        </div>
      </div>

      <div className="p-3 flex flex-col flex-1 gap-2">
        <div className="flex items-center gap-1.5">
          {product.seller?.avatar?.url ? (
            <Image
              src={product.seller.avatar.url}
              alt={product.seller?.name || "Seller"}
              width={20}
              height={20}
              className="w-5 h-5 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-secondary-container flex items-center justify-center text-[10px] font-bold text-on-surface shrink-0">
              {(product.seller?.name || "S").charAt(0)}
            </div>
          )}
          <span className="font-body-sm text-[11px] text-on-surface-variant truncate">
            {product.seller?.name || "Người bán"}
          </span>
        </div>

        <h3 className="font-headline text-[15px] leading-snug text-on-surface line-clamp-2 mt-0.5 font-bold">
          {product.name}
        </h3>

        {/* Social proof, and only when there is any: "0.0 (0)" beside a price reads as a
            verdict on the goods rather than as a listing nobody has bought yet. */}
        {(product.review_count ?? 0) > 0 && (
          <div className="flex items-center gap-1 text-[11px] text-on-surface-variant">
            <span
              className="material-symbols-outlined text-[13px] text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
              aria-hidden="true"
            >
              star
            </span>
            <span className="font-bold text-on-surface">{(product.rating ?? 0).toFixed(1)}</span>
            <span>({product.review_count})</span>
            {(product.sold ?? 0) > 0 && <span className="truncate">· Đã bán {product.sold}</span>}
          </div>
        )}
        {(product.review_count ?? 0) === 0 && (product.sold ?? 0) > 0 && (
          <div className="text-[11px] text-on-surface-variant">Đã bán {product.sold}</div>
        )}

        <div className="mt-auto pt-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-[1.25rem] text-primary shrink-0">{formatPrice(product.price)}</span>
          </div>

          <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-outline-variant/30 text-[11px] text-on-surface-variant font-medium">
            <span className="shrink-0">{new Date(product.created_at).toLocaleDateString("vi-VN")}</span>
            {product.location && (
              <span className="flex items-center gap-0.5 min-w-0">
                <span className="material-symbols-outlined text-[13px] shrink-0">location_on</span>
                <span className="truncate">
                  {product.location.distance_km != null
                    ? `${product.location.distance_km.toFixed(1)} km`
                    : product.location.province_name}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
    </div>
  );
}
