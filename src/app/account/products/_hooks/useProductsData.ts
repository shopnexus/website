"use client";

import { useState } from "react";
import { useListingsFeed } from "@/hooks/api/useCatalog";
import type { ListingStatus } from "@/api/generated/types.gen";

export type ProductFilter = "all" | ListingStatus;

/**
 * The seller's own listings.
 *
 * Everything is a server filter. `mine=true` is what makes the seller's unpublished rows
 * visible at all, and it is also the only case in which `status` is honoured — a shopper
 * may not ask for someone else's drafts, so the two travel together.
 *
 * The filter set mirrors the ListingStatus enum rather than inventing categories: the
 * previous "Hết hàng" tab could never work, because stock lives on a variant and
 * `GET /listings` returns listings without their variants.
 */
export function useProductsData() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ProductFilter>("all");

  const trimmed = searchQuery.trim();

  const { listings, totalCount, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useListingsFeed({
      mine: true,
      status: activeFilter === "all" ? undefined : activeFilter,
      // A query moves the server's default sort to relevance on its own.
      q: trimmed || undefined,
      limit: 24,
    });

  return {
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    products: listings,
    totalCount,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  };
}
