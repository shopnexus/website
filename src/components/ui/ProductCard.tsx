"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/mock-data";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className = "" }: ProductCardProps) {
  return (
    <Link
      href={`/product/${product.id}`}
      className={`bg-surface rounded-xl overflow-hidden border border-outline-variant/30 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow duration-300 flex flex-col group cursor-pointer ${className}`}
    >
      <div className="relative aspect-[4/3] bg-surface-container overflow-hidden shrink-0">
        <Image
          src={product.images[0]}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />

        {/* Top Left Badge: Discount */}
        {product.discount ? (
          <div className="absolute top-2 left-2 bg-error text-on-error font-label-md text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider z-10">
            -{product.discount}%
          </div>
        ) : null}

        {/* Top Right Badge: LIVE */}
        {product.isLive ? (
          <div className="absolute top-2 right-2 bg-error text-white font-label-md text-[10px] px-2 py-1 rounded-full flex items-center gap-1 font-bold z-10">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> LIVE
          </div>
        ) : null}
      </div>

      <div className="p-3 flex flex-col flex-1 gap-2">
        {/* Seller Info */}
        <div className="flex items-center gap-1.5">
          {product.seller?.avatar ? (
            <Image
              src={product.seller.avatar}
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
          {product.seller?.isVerified && (
            <span
              className="material-symbols-outlined text-primary text-[14px] shrink-0"
              style={{ fontVariationSettings: "'FILL' 1" }}
              title="Người bán xác thực"
            >
              verified
            </span>
          )}
        </div>

        {/* Product Title */}
        <h3 className="font-headline text-[15px] leading-snug text-on-surface line-clamp-2 mt-0.5 font-bold">
          {product.title}
        </h3>

        {/* Bottom Price and Meta */}
        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-[1.25rem] text-primary">{formatPrice(product.price)}</span>
            {product.originalPrice ? (
              <span className="text-xs text-on-surface-variant line-through">{formatPrice(product.originalPrice)}</span>
            ) : null}
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-outline-variant/30 text-[11px] text-on-surface-variant font-medium">
            <span className="flex items-center gap-1 truncate">
              <span className="material-symbols-outlined text-[13px] text-primary shrink-0">location_on</span>{" "}
              <span className="truncate">{product.location || "TP. Hồ Chí Minh"}</span>
            </span>
            <span className="shrink-0 ml-1">{product.postedAt || "Vừa xong"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
