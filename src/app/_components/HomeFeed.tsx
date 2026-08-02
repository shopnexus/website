"use client";

import React, { useState, useEffect } from "react";
import ProductCard from "@/components/ui/ProductCard";
import { CatalogService } from "@/services/catalog.service";
import type { Listing } from "@/types/catalog.type";

export default function HomeFeed(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<"all" | "newest" | "suggested">("all");
  const [products, setProducts] = useState<Listing[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchListings = async (currentPage: number, append: boolean = false) => {
    try {
      const loader = append ? setIsLoadingMore : setIsLoading;
      loader(true);
      
      const res = await CatalogService.searchListings({ limit: 12, page: currentPage });
      const newProducts = res.data || [];
      
      if (append) {
        setProducts((prev) => [...prev, ...newProducts]);
      } else {
        setProducts(newProducts);
      }
      
      setHasMore(newProducts.length === 12); // Assume limit is 12
    } catch (error) {
      console.error("Failed to fetch listings", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    // Reset and fetch when tab changes (if activeTab logic was supported by API)
    setPage(1);
    fetchListings(1, false);
  }, [activeTab]);

  const handleLoadMore = (): void => {
    if (!hasMore || isLoadingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchListings(nextPage, true);
  };

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

          {hasMore && products.length > 0 && (
            <div className="mt-12 flex justify-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-12 py-3 rounded-full border-2 border-primary text-primary font-bold hover:bg-primary hover:text-on-primary transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-sm" aria-hidden="true">
                  {isLoadingMore ? "sync" : "add"}
                </span>
                <span>
                  {isLoadingMore ? "Đang tải..." : "Tải thêm sản phẩm"}
                </span>
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
