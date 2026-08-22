"use client";

import Button from "@/components/ui/Button";
import ProductCard from "@/components/ui/ProductCard";
import ProductCardSkeleton from "@/components/ui/ProductCardSkeleton";
import { SHOP_SORTS, type ShopListingsState, type ShopSort } from "../_hooks/useShopListings";

/** The shelf, with the orderings a shop's own catalogue can be read in. */
export default function ShopListings({ listings: state }: { listings: ShopListingsState }) {
  const {
    listings,
    totalCount,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    sort,
    setSort,
  } = state;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-headline-sm font-bold text-on-surface">
          Tất cả sản phẩm{totalCount !== null ? ` (${totalCount})` : ""}
        </h2>
        <div className="flex items-center gap-2">
          <label htmlFor="shop-sort" className="font-label-sm text-on-surface-variant">
            Sắp xếp:
          </label>
          <select
            id="shop-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as ShopSort)}
            className="rounded-lg border border-outline-variant bg-surface-container-lowest py-1.5 pl-3 pr-8 font-body-sm text-on-surface outline-none focus:border-primary"
          >
            {SHOP_SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="py-12 text-center text-on-surface-variant">
          Gian hàng này chưa có sản phẩm nào.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {listings.map((listing) => (
              <ProductCard key={listing.id} product={listing} />
            ))}
          </div>

          {hasNextPage && (
            <div className="mt-8 flex justify-center">
              <Button variant="outline" disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>
                {isFetchingNextPage ? "Đang tải..." : "Tải thêm"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
