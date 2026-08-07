"use client";

import { useState } from "react";
import { useListingsFeed } from "@/hooks/api/useCatalog";
import type { AccountId, GetListingsData } from "@/api/generated/types.gen";

export type ShopSort = NonNullable<NonNullable<GetListingsData["query"]>["sort"]>;

/** Orderings that mean something inside one shop — a relevance or distance rank does not. */
export const SHOP_SORTS: Array<{ value: ShopSort; label: string }> = [
  { value: "newest", label: "Mới nhất" },
  { value: "best-selling", label: "Bán chạy" },
  { value: "rating", label: "Đánh giá cao" },
  { value: "price-asc", label: "Giá thấp trước" },
  { value: "price-desc", label: "Giá cao trước" },
];

/**
 * One seller's shelf. Owned by the page rather than by the grid, because the tab strip
 * shows the total and a count that lived inside the tab's own panel would only exist
 * while that panel was open.
 */
export function useShopListings(sellerId: AccountId) {
  const [sort, setSort] = useState<ShopSort>("newest");
  const feed = useListingsFeed({ seller_id: sellerId, limit: 24, sort });

  return { sort, setSort, ...feed };
}

export type ShopListingsState = ReturnType<typeof useShopListings>;
