"use client";

import React, { useState } from "react";
import ProductCard from "@/components/ui/ProductCard";
import { useListingsFeed } from "@/hooks/api/useCatalog";

export default function HomeFeed(): React.ReactElement {
  // Presentational only for now: the API does support sorting these three ways
  // (`sort=newest` / `sort=recommended`), but `recommended` needs a token and this feed
  // renders for signed-out visitors too, so wiring it is a separate change.
  const [activeTab, setActiveTab] = useState<"all" | "newest" | "suggested">("all");

  const {
    listings: products,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useListingsFeed({ limit: 12 });

  return (
    <section>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h2 className="font-headline font-bold text-headline-md text-on-surface">Dòng Khám Phá</h2>
        <div className="flex gap-4 border-b sm:border-none border-outline-variant/20 w-full sm:w-auto pb-2 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`text-label-md font-bold transition-colors cursor-pointer pb-1 sm:pb-0 ${
              activeTab === "all"
                ? "text-primary border-b-2 sm:border-b-2 border-primary"
                : "text-on-surface-variant hover:text-primary border-b-2 border-transparent"
            }`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("newest")}
            className={`text-label-md font-bold transition-colors cursor-pointer pb-1 sm:pb-0 ${
              activeTab === "newest"
                ? "text-primary border-b-2 sm:border-b-2 border-primary"
                : "text-on-surface-variant hover:text-primary border-b-2 border-transparent"
            }`}
          >
            Vừa đăng
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("suggested")}
            className={`text-label-md font-bold transition-colors cursor-pointer pb-1 sm:pb-0 ${
              activeTab === "suggested"
                ? "text-primary border-b-2 sm:border-b-2 border-primary"
                : "text-on-surface-variant hover:text-primary border-b-2 border-transparent"
            }`}
          >
            Đề xuất
          </button>
        </div>
      </div>

      {isLoading && products.length === 0 ? (
        <div className="flex justify-center py-20 text-on-surface-variant">
          Đang tải sản phẩm...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {products.length === 0 && (
            <div className="text-center py-12 text-on-surface-variant">
              Không có sản phẩm nào.
            </div>
          )}

          {hasNextPage && products.length > 0 && (
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
                <span>
                  {isFetchingNextPage ? "Đang tải..." : "Tải thêm sản phẩm"}
                </span>
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
