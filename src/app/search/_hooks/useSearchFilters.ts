"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useCategories, useListingsFeed, type ListingFilters } from "@/hooks/api/useCatalog";
import { useProvinces, useWards } from "@/hooks/useAdminAreas";
import { useAuthStore } from "@/stores/use-auth-store";
import type { CategoryId, TagSlug } from "@/api/generated/types.gen";
import type { ConditionFilter, Position, SearchMode, SortOption } from "../_types";
import {
  effectiveSort,
  locationFilter,
  positionFilter,
  priceBound,
  sortIsAvailable,
} from "../_lib/search.logic";

/** Build a new URLSearchParams from the current one, applying a patch of key→value overrides.
 *  A value of "" removes the key entirely to keep URLs clean. */
function patchParams(current: URLSearchParams, patch: Record<string, string>): string {
  const next = new URLSearchParams(current);
  for (const [k, v] of Object.entries(patch)) {
    if (v) next.set(k, v);
    else next.delete(k);
  }
  return next.toString();
}

const PAGE_SIZE = 12;

/**
 * Every knob the search page turns, and the one feed they all feed into.
 *
 * All of it is server-side: `/listings` filters and orders, so nothing here narrows a page
 * that already arrived — filtering in memory only ever hid rows from whichever page
 * happened to load.
 */
export function useSearchFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const { isAuthenticated } = useAuthStore();

  // category and tag are URL-authoritative so that:
  // 1. Picking either after a search re-fires GET /listings?q=...&category_id=...
  // 2. The URL is shareable and survives a page refresh.
  const selectedCategory = searchParams.get("category") ?? "";
  const tag = (searchParams.get("tag") ?? "") as TagSlug;

  const setSelectedCategory = useCallback(
    (id: string) => {
      router.replace(`?${patchParams(searchParams, { category: id, tag: "" })}`, { scroll: false });
    },
    [router, searchParams],
  );

  const setTag = useCallback(
    (slug: TagSlug) => {
      router.replace(`?${patchParams(searchParams, { tag: slug })}`, { scroll: false });
    },
    [router, searchParams],
  );

  const [condition, setCondition] = useState<ConditionFilter>("");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [appliedPriceFrom, setAppliedPriceFrom] = useState("");
  const [appliedPriceTo, setAppliedPriceTo] = useState("");
  // `null` is "not chosen", which is not the same as any particular ordering: the default
  // depends on whether something was typed, and storing one here would freeze the answer
  // from the moment the page mounted.
  const [sortBy, setSortBy] = useState<SortOption | null>(null);
  const [mode, setMode] = useState<SearchMode>("hybrid");
  // An administrative code, from the search box on the home page.
  const [provinceCode, setProvinceCode] = useState<string>(
    () => searchParams.get("province") || "",
  );
  const [wardCode, setWardCode] = useState("");
  const [position, setPosition] = useState<Position | null>(null);
  const [radiusKm, setRadiusKm] = useState(25);

  const { data: categories = [] } = useCategories();
  const { data: provinces = [] } = useProvinces();
  // Ward is the only level under a province now, so it is what a narrower browse offers.
  const { data: wards = [] } = useWards(provinceCode);

  const availability = {
    hasQuery: Boolean(query),
    hasPosition: position !== null,
    isSignedIn: isAuthenticated,
  };
  // What is really in force, which is what both the request and the selector must say. They
  // used to disagree: the selector showed the shopper's lapsed pick while the request carried
  // the fallback, so the page claimed one ordering and served another.
  const activeSort = effectiveSort(sortBy, availability);

  const filters: ListingFilters = {
    limit: PAGE_SIZE,
    q: query || undefined,
    // Ignored by the server without a query, so it is only sent with one.
    mode: query ? mode : undefined,
    category_id: (selectedCategory as CategoryId) || undefined,
    tag: tag || undefined,
    condition: condition || undefined,
    min_price: priceBound(appliedPriceFrom),
    max_price: priceBound(appliedPriceTo),
    ...locationFilter(provinceCode, wardCode),
    ...positionFilter(position, radiusKm),
    sort: activeSort,
  };

  const feed = useListingsFeed(filters);

  /**
   * A "near me" browse. The device's position is the only one this page can offer — the
   * alternative the API takes, `near_contact_id`, is one of the caller's saved addresses,
   * and picking one belongs to checkout rather than to a public search.
   */
  const locateMe = () => {
    if (!navigator.geolocation) {
      toast.error("Thiết bị không hỗ trợ định vị.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setPosition({ lat: coords.latitude, lon: coords.longitude }),
      () => toast.error("Không lấy được vị trí. Vui lòng cho phép truy cập định vị."),
    );
  };

  const clearPosition = () => {
    setPosition(null);
    // Back to unchosen rather than to a named ordering: the shopper never picked one, and
    // the default is what they had before they asked for distance.
    if (sortBy === "distance") setSortBy(null);
  };

  const clearAll = () => {
    // Clear URL-driven filters in one replace to avoid double navigation.
    router.replace(`?${patchParams(searchParams, { category: "", tag: "" })}`, { scroll: false });
    setCondition("");
    setPriceFrom("");
    setPriceTo("");
    setAppliedPriceFrom("");
    setAppliedPriceTo("");
    setProvinceCode("");
    setWardCode("");
    clearPosition();
  };

  const hasAnyFilter = Boolean(
    selectedCategory || tag || condition || appliedPriceFrom || appliedPriceTo || provinceCode || position,
  );

  // The tree arrives flat with parent_id, so the nav shows roots and the sidebar shows
  // the children of whatever is selected.
  const rootCategories = useMemo(() => categories.filter((c) => !c.parent_id), [categories]);
  const subCategories = useMemo(
    () => (selectedCategory ? categories.filter((c) => c.parent_id === selectedCategory) : []),
    [categories, selectedCategory],
  );

  return {
    query,
    categories,
    rootCategories,
    subCategories,
    provinces,
    wards,
    selectedProvince: provinces.find((p) => p.code === provinceCode),
    selectedCategoryName: categories.find((c) => c.id === selectedCategory)?.name,

    selectedCategory,
    setSelectedCategory,
    tag,
    setTag,
    condition,
    setCondition,
    priceFrom,
    setPriceFrom,
    priceTo,
    setPriceTo,
    appliedPriceFrom,
    appliedPriceTo,
    applyPrice: () => {
      setAppliedPriceFrom(priceFrom);
      setAppliedPriceTo(priceTo);
    },
    clearPrice: () => {
      setAppliedPriceFrom("");
      setAppliedPriceTo("");
      setPriceFrom("");
      setPriceTo("");
    },
    sortBy: activeSort,
    setSortBy,
    mode,
    setMode,
    provinceCode,
    setProvinceCode,
    wardCode,
    setWardCode,
    position,
    radiusKm,
    setRadiusKm,
    locateMe,
    clearPosition,
    clearAll,
    hasAnyFilter,
    isSortAvailable: (sort: SortOption) => sortIsAvailable(sort, availability),
    feed,
  };
}

export type SearchState = ReturnType<typeof useSearchFilters>;
