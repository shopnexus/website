"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useCategories, useListingsFeed, type ListingFilters } from "@/hooks/api/useCatalog";
import { useProvinces, useWards } from "@/hooks/useAdminAreas";
import { useAuthStore } from "@/stores/use-auth-store";
import type { CategoryId, ContactId, TagSlug } from "@/api/generated/types.gen";
import type { AreaSelection } from "@/components/ui/AreaPicker";
import type { ConditionFilter, SortOption } from "../_types";
import {
  CONDITION_OPTIONS,
  DEFAULT_RADIUS_KM,
  SORT_OPTIONS,
  effectiveSort,
  locationFilter,
  originFilter,
  sortIsAvailable,
} from "../_lib/search.logic";
import {
  CLEARED,
  conditionParam,
  patchParams,
  positionParam,
  positionPatch,
  priceParam,
  radiusParam,
  sortParam,
  type ParamPatch,
} from "../_lib/search.url";

const PAGE_SIZE = 12;

const SORT_VALUES = SORT_OPTIONS.map((option) => option.value);
const CONDITION_VALUES = CONDITION_OPTIONS.map((option) => option.value);

/**
 * Every knob the search page turns, and the one feed they all feed into. All of it is
 * server-side, and all of it lives in the query string (`_lib/search.url.ts`) so a filtered
 * search is a link. The price pair is the exception: only its applied half is in the URL.
 */
export function useSearchFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const patch = useCallback(
    (next: ParamPatch) => {
      router.replace(`?${patchParams(searchParams, next)}`, { scroll: false });
    },
    [router, searchParams],
  );

  const query = searchParams.get("q") || "";
  const selectedCategory = searchParams.get("category") ?? "";
  const tag = (searchParams.get("tag") ?? "") as TagSlug;
  const provinceCode = searchParams.get("province") ?? "";
  const wardCode = searchParams.get("ward") ?? "";
  const condition = conditionParam(searchParams.get("condition"), CONDITION_VALUES);
  const minPrice = priceParam(searchParams.get("min"));
  const maxPrice = priceParam(searchParams.get("max"));
  const sortBy = sortParam(searchParams.get("sort"), SORT_VALUES);
  const position = positionParam(searchParams);
  const nearContactId = (searchParams.get("near") || "") as ContactId | "";
  const radiusKm = radiusParam(searchParams.get("radius"), DEFAULT_RADIUS_KM);

  // A draft, committed by "Áp dụng" or Enter, seeded from the URL.
  const urlMin = minPrice === undefined ? "" : String(minPrice);
  const urlMax = maxPrice === undefined ? "" : String(maxPrice);
  const [priceFrom, setPriceFrom] = useState(urlMin);
  const [priceTo, setPriceTo] = useState(urlMax);

  // Resynced during render when the URL moves under the draft ("clear all", a chip's ×, the
  // back button) — an effect would commit the stale value first. Same idiom as `useSearch`.
  const [syncedTo, setSyncedTo] = useState({ urlMin, urlMax });
  if (syncedTo.urlMin !== urlMin || syncedTo.urlMax !== urlMax) {
    setSyncedTo({ urlMin, urlMax });
    setPriceFrom(urlMin);
    setPriceTo(urlMax);
  }

  // Holds one `sort=recommended` run still while it is paged through; drawn per mount, so
  // reloading is a new run. Not in the URL, or a shared link would replay the sender's run.
  const [recommendedSeed] = useState(() => Math.random().toString(36).substring(7));

  const { data: categories = [] } = useCategories();
  const { data: provinces = [] } = useProvinces();
  // Ward is the only level under a province now, so it is what a narrower browse offers.
  const { data: wards = [] } = useWards(provinceCode);

  // A position or a saved address, never both: the server refuses the pair.
  const hasOrigin = position !== null || Boolean(nearContactId);

  const availability = {
    hasQuery: Boolean(query),
    hasPosition: hasOrigin,
    isSignedIn: isAuthenticated,
  };
  // What is really in force, which is what both the request and the selector must say. They
  // used to disagree: the selector showed the shopper's lapsed pick while the request carried
  // the fallback, so the page claimed one ordering and served another.
  const activeSort = effectiveSort(sortBy, availability);

  const filters: ListingFilters = {
    limit: PAGE_SIZE,
    q: query || undefined,
    category_id: (selectedCategory as CategoryId) || undefined,
    tag: tag || undefined,
    condition: condition || undefined,
    min_price: minPrice,
    max_price: maxPrice,
    ...locationFilter(provinceCode, wardCode),
    ...originFilter(position, nearContactId || null, radiusKm),
    sort: activeSort,
    seed: activeSort === "recommended" ? recommendedSeed : undefined,
  };

  const feed = useListingsFeed(filters);

  const setSelectedCategory = useCallback(
    (id: string) => patch({ category: id, tag: "" }),
    [patch],
  );
  const setTag = useCallback((slug: TagSlug) => patch({ tag: slug }), [patch]);
  const setCondition = useCallback(
    (value: ConditionFilter) => patch({ condition: value }),
    [patch],
  );
  const setSortBy = useCallback((sort: SortOption) => patch({ sort }), [patch]);

  // One patch, not two setters: separately, a ward from the old province stayed in force.
  const setArea = useCallback(
    (area: AreaSelection) => patch({ province: area.provinceCode, ward: area.wardCode }),
    [patch],
  );
  const clearArea = useCallback(() => patch({ province: "", ward: "" }), [patch]);
  /** Widening back to the whole province, which is what removing a ward chip means. */
  const clearWard = useCallback(() => patch({ ward: "" }), [patch]);

  const setRadiusKm = useCallback((km: number) => patch({ radius: String(km) }), [patch]);

  // The device's position, or a saved address (`near_contact_id`) for somebody shopping from
  // home. Each clears the other, because sending both is a 400.
  const locateMe = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Thiết bị không hỗ trợ định vị.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        patch({
          ...positionPatch({ lat: coords.latitude, lon: coords.longitude }),
          near: "",
        }),
      () => toast.error("Không lấy được vị trí. Hãy cho phép truy cập định vị rồi thử lại."),
    );
  }, [patch]);

  const useSavedAddress = useCallback(
    (id: ContactId) => patch({ near: id, lat: "", lon: "" }),
    [patch],
  );

  // Drops the ordering that needed it in the same patch: `sort=distance` with nothing to
  // measure from is a 400 on the next load.
  const clearOrigin = useCallback(
    () =>
      patch({
        lat: "",
        lon: "",
        near: "",
        radius: "",
        ...(sortBy === "distance" ? { sort: "" } : {}),
      }),
    [patch, sortBy],
  );

  const applyPrice = useCallback(
    () => patch({ min: priceFrom.trim(), max: priceTo.trim() }),
    [patch, priceFrom, priceTo],
  );
  const clearPrice = useCallback(() => patch({ min: "", max: "" }), [patch]);

  /** Everything but the words typed: "clear all" on a search keeps the search. */
  const clearAll = useCallback(() => patch(CLEARED), [patch]);

  const hasAnyFilter = Boolean(
    selectedCategory ||
      tag ||
      condition ||
      minPrice !== undefined ||
      maxPrice !== undefined ||
      provinceCode ||
      hasOrigin,
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
    selectedWard: wards.find((w) => w.code === wardCode),
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
    minPrice,
    maxPrice,
    applyPrice,
    clearPrice,
    sortBy: activeSort,
    setSortBy,

    provinceCode,
    wardCode,
    setArea,
    clearArea,
    clearWard,

    position,
    nearContactId: nearContactId || null,
    hasOrigin,
    radiusKm,
    setRadiusKm,
    locateMe,
    useSavedAddress,
    clearOrigin,

    clearAll,
    hasAnyFilter,
    isSortAvailable: (sort: SortOption) => sortIsAvailable(sort, availability),
    feed,
  };
}

export type SearchState = ReturnType<typeof useSearchFilters>;
