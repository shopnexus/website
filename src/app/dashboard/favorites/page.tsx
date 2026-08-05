"use client";

import React from "react";
import ProductCard from "@/components/ui/ProductCard";
import Skeleton from "@/components/ui/Skeleton";
import { useListingsFeed } from "@/hooks/api/useCatalog";
import Link from "next/link";

import ProductCardSkeleton from "@/components/ui/ProductCardSkeleton";

export default function FavoritesPage() {
  const { listings, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useListingsFeed({
    favorited: true,
  });

  return (
    <div className="p-6 max-w-[1200px] mx-auto w-full">
      <h1 className="font-headline-lg font-bold text-on-surface mb-6">Sản phẩm đã lưu</h1>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : listings.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {hasNextPage && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-6 py-2.5 rounded-full border border-outline-variant font-label-md font-bold text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-50"
              >
                {isFetchingNextPage ? "Đang tải thêm..." : "Tải thêm"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-2xl p-12 text-center border border-outline-variant/30">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant/50 mb-4 block">
            heart_broken
          </span>
          <h2 className="font-headline-sm font-bold text-on-surface mb-2">Chưa có sản phẩm nào</h2>
          <p className="text-body-lg text-on-surface-variant mb-6 max-w-md mx-auto">
            Bạn chưa lưu sản phẩm nào. Hãy dạo quanh và lưu lại những món đồ bạn yêu thích nhé!
          </p>
          <Link
            href="/"
            className="inline-flex px-6 py-2.5 bg-primary text-on-primary rounded-full font-bold text-label-md hover:opacity-90 transition-opacity"
          >
            Khám phá ngay
          </Link>
        </div>
      )}
    </div>
  );
}
