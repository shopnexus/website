import { useState, useMemo } from "react";
import { mockListingPage } from "@/lib/mocks/catalog.mock";
import type { Listing, ListingStatus } from "@/types/catalog.type";

export type ProductFilter = "all" | "active" | "inactive" | "out_of_stock";

export function useProductsData() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ProductFilter>("all");

  const filteredProducts = useMemo(() => {
    let filtered = mockListingPage.data;

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(lowerQuery));
    }

    if (activeFilter === "active") {
      filtered = filtered.filter((p) => p.status === "active");
    } else if (activeFilter === "inactive") {
      filtered = filtered.filter((p) => p.status === "hidden" || p.status === "draft");
    } else if (activeFilter === "out_of_stock") {
      filtered = filtered.filter((p) => false); // just empty for now
    }

    return filtered;
  }, [searchQuery, activeFilter]);

  return {
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    products: filteredProducts,
  };
}
