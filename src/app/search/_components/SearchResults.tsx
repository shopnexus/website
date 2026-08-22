"use client";

import ProductCard from "@/components/ui/ProductCard";
import ProductCardSkeleton from "@/components/ui/ProductCardSkeleton";
import type { SearchState } from "../_hooks/useSearchFilters";

const GRID = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12";

/**
 * The result grid, its empty state and the way to the next page.
 *
 * A retrieval miss on the query itself has no button to offer — there is one retrieval
 * path and the understanding stage already reads past a typo or a vague phrase, so
 * nothing is left for the shopper to retry by hand. A filter stack that excluded
 * everything is the one case with a real way back, which is why "Xóa bộ lọc" only
 * shows up then.
 */
export default function SearchResults({ search }: { search: SearchState }) {
  const { listings, isLoading, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    search.feed;
  // A typed query is a search; a category picked with nothing typed is a category browse.
  // Neither when the page opened to neither (the whole catalogue, unfiltered) — that click
  // is not one of the three the contract can tell apart.
  const source = search.query ? "search" : search.selectedCategory ? "category" : undefined;

  if (isLoading) {
    return (
      <div className={GRID}>
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // A failed request is not an empty catalogue. Both rendered the same "nothing matched"
  // card, whose "clear your filters" was advice that could not work.
  if (isError) {
    return (
      <div className="bg-surface-container-low rounded-2xl p-12 text-center my-8 border border-outline-variant">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2" aria-hidden="true">
          cloud_off
        </span>
        <p className="text-body-lg text-on-surface-variant font-medium">
          Không tải được kết quả tìm kiếm.
        </p>
        <p className="text-body-sm text-on-surface-variant mt-1">
          Kiểm tra đường truyền mạng rồi thử lại.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-6 px-6 py-2 bg-primary text-on-primary rounded-full font-bold text-label-md hover:opacity-90 transition-opacity cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="bg-surface-container-low rounded-2xl p-12 text-center my-8 border border-outline-variant">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2" aria-hidden="true">
          search_off
        </span>
        <p className="text-body-lg text-on-surface-variant font-medium">
          {search.query
            ? `Không có tin đăng nào khớp với "${search.query}".`
            : "Không tìm thấy sản phẩm nào phù hợp với bộ lọc của bạn."}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
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
          <ProductCard key={listing.id} product={listing} source={source} />
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
