"use client";

import Button from "@/components/ui/Button";
import MenuSelect from "@/components/ui/MenuSelect";
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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-title-lg font-bold text-on-surface">
          Tất cả sản phẩm{totalCount !== null ? ` (${totalCount})` : ""}
        </h2>
        <MenuSelect
          label="Sắp xếp sản phẩm"
          value={sort}
          onChange={(value) => setSort(value as ShopSort)}
          options={SHOP_SORTS.map((option) => ({ value: option.value, label: option.label }))}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
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
