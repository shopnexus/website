"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/stores/use-auth-store";
import { useAddFavorite, useRemoveFavorite } from "@/hooks/api/useCatalog";
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
  name: string;
  price: number;
  created_at: string;
  cover?: { url?: string | null } | null;
  seller?: { name: string; avatar?: { url?: string | null } | null };
  /**
   * Where the goods are. Null on a listing that was never published, and `distance_km` is
   * only filled in when the browse sent a position.
   */
  location?: { province_name: string; distance_km?: number } | null;
  favorited?: boolean;
  favorite_count?: number;
}

interface ProductCardProps {
  product: ProductCardItem;
  className?: string;
}

export default function ProductCard({ product, className = "" }: ProductCardProps) {
  const imageUrl = product.cover?.url || "https://picsum.photos/seed/fallback/600/750";
  const { user } = useAuthStore();
  const { mutate: addFavorite, isPending: isAdding } = useAddFavorite();
  const { mutate: removeFavorite, isPending: isRemoving } = useRemoveFavorite();
  const isPending = isAdding || isRemoving;

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
    <Link
      href={`/product/${product.id}`}
      className={`bg-surface rounded-xl overflow-hidden border border-outline-variant/30 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow duration-300 flex flex-col group cursor-pointer ${className}`}
    >
      <div className="relative aspect-[4/3] bg-surface-container overflow-hidden shrink-0">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
        <button
          onClick={handleFavoriteClick}
          disabled={isPending}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-surface/80 backdrop-blur-sm border border-outline-variant/20 shadow-sm hover:bg-surface transition-colors z-10 disabled:opacity-50"
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

        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-[1.25rem] text-primary">{formatPrice(product.price)}</span>
          </div>

          <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-outline-variant/30 text-[11px] text-on-surface-variant font-medium">
            <span className="shrink-0">{new Date(product.created_at).toLocaleDateString("vi-VN")}</span>
            {product.location && (
              <span className="flex items-center gap-0.5 min-w-0">
                <span className="material-symbols-outlined text-[13px] shrink-0">location_on</span>
                <span className="truncate">
                  {product.location.distance_km !== undefined
                    ? `${product.location.distance_km.toFixed(1)} km`
                    : product.location.province_name}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
