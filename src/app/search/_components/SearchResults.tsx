"use client";

import ProductCard from "@/components/ui/ProductCard";
import ProductCardSkeleton from "@/components/ui/ProductCardSkeleton";
import type { SearchState } from "../_hooks/useSearchFilters";

const GRID = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12";

/**
 * The result grid, its empty state and the way to the next page.
 *
 * The empty state offers the specific step back rather than one button: a query that
 * matched nothing under a narrow "từ khoá" match is a different problem from a filter
 * stack that excluded everything, and telling them apart is what saves the search.
 */
export default function SearchResults({ search }: { search: SearchState }) {
  const { listings, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = search.feed;

  if (isLoading) {
    return (
      <div className={GRID}>
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="bg-surface-container-low rounded-2xl p-12 text-center my-8 border border-outline-variant/20">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2" aria-hidden="true">
          search_off
        </span>
        <p className="text-body-lg text-on-surface-variant font-medium">
          {search.query
            ? `Không có tin đăng nào khớp với "${search.query}".`
            : "Không tìm thấy sản phẩm nào phù hợp với bộ lọc của bạn."}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {search.query && search.mode !== "semantic" && (
            <button
              type="button"
              onClick={() => search.setMode("semantic")}
              className="px-6 py-2 rounded-full border-2 border-primary text-primary font-bold text-label-md hover:bg-primary hover:text-on-primary transition-colors cursor-pointer"
            >
              Tìm theo ý nghĩa thay vì đúng chữ
            </button>
          )}
          {search.hasAnyFilter && (
            <button
              type="button"
              onClick={search.clearAll}
              className="px-6 py-2 bg-primary text-on-primary rounded-full font-bold text-label-md hover:opacity-90 transition-opacity cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={GRID}>
        {listings.map((listing) => (
          <ProductCard key={listing.id} product={listing} />
        ))}
      </div>

      {hasNextPage && (
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
  );
}
