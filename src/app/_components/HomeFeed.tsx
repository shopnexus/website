"use client";

import React from "react";
import ProductCard from "@/components/ui/ProductCard";
import ProductCardSkeleton from "@/components/ui/ProductCardSkeleton";
import { useHomeFeed } from "./useHomeFeed";

export default function HomeFeed(): React.ReactElement {
  const { tabs, active, setSort, feed } = useHomeFeed();
  const { listings, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = feed;

  return (
    <section>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h2 className="font-headline font-bold text-headline-md text-on-surface">Dòng Khám Phá</h2>
        <div className="flex gap-4 border-b sm:border-none border-outline-variant/20 w-full sm:w-auto pb-2 sm:pb-0 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSort(tab.id)}
              aria-pressed={active === tab.id}
              className={`shrink-0 text-label-md font-bold transition-colors cursor-pointer pb-1 sm:pb-0 border-b-2 ${
                active === tab.id
                  ? "text-primary border-primary"
                  : "text-on-surface-variant hover:text-primary border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && listings.length === 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {listings.map((listing) => (
              <ProductCard
                key={listing.id}
                product={listing}
                source={active === "recommended" ? "recommended" : undefined}
              />
            ))}
          </div>

          {listings.length === 0 && (
            <div className="text-center py-12 text-on-surface-variant">Không có sản phẩm nào.</div>
          )}

          {hasNextPage && listings.length > 0 && (
            <div className="mt-12 flex justify-center">
              <button
                type="button"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-12 py-3 rounded-full border-2 border-primary text-primary font-bold hover:bg-primary hover:text-on-primary transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-sm" aria-hidden="true">
                  {isFetchingNextPage ? "sync" : "add"}
                </span>
                <span>{isFetchingNextPage ? "Đang tải..." : "Tải thêm sản phẩm"}</span>
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
