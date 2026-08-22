"use client";

import EmptyState from "@/components/ui/EmptyState";
import ProductCard from "@/components/ui/ProductCard";
import ProductCardSkeleton from "@/components/ui/ProductCardSkeleton";
import { useListingsFeed } from "@/hooks/api/useCatalog";

const GRID = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6";

/** The saved listings themselves. Empty, this is one card and nothing else. */
export default function SavedListingsGrid() {
  const { listings, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useListingsFeed({
    favorited: true,
  });

  if (isLoading) {
    return (
      <div className={GRID}>
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <EmptyState
        icon="favorite"
        title="Chưa có tin đăng nào được lưu"
        description="Nhấn hình trái tim trên một tin đăng để giữ nó lại đây, rồi so sánh khi bạn đã xem đủ."
        action={{ label: "Dạo quanh tin đăng", href: "/search" }}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className={GRID}>
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
            className="px-6 py-2.5 rounded-full border border-outline-variant text-label-md text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-50"
          >
            {isFetchingNextPage ? "Đang tải thêm..." : "Tải thêm"}
          </button>
        </div>
      )}
    </div>
  );
}
