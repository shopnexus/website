"use client";

import Chip from "@/components/ui/Chip";
import { LISTING_CONDITION_VI } from "@/lib/dictionaries";
import type { SearchState } from "../_hooks/useSearchFilters";

/** What is currently narrowing the results, each removable where it is shown. */
export default function ActiveFilterChips({ search }: { search: SearchState }) {
  if (!search.hasAnyFilter) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {search.provinceCode && (
        <Chip
          selected
          onRemove={() => {
            search.setProvinceCode("");
            search.setWardCode("");
          }}
        >
          {search.wardCode
            ? search.wards.find((ward) => ward.code === search.wardCode)?.name
            : search.selectedProvince?.name}
        </Chip>
      )}
      {search.position && (
        <Chip selected onRemove={search.clearPosition}>
          Trong vòng {search.radiusKm} km
        </Chip>
      )}
      {search.selectedCategory && (
        <Chip selected onRemove={() => search.setSelectedCategory("")}>
          {search.selectedCategoryName || search.selectedCategory}
        </Chip>
      )}
      {search.tag && (
        <Chip selected onRemove={() => search.setTag("")}>
          #{search.tag}
        </Chip>
      )}
      {search.condition && (
        <Chip selected onRemove={() => search.setCondition("")}>
          Tình trạng: {LISTING_CONDITION_VI[search.condition]}
        </Chip>
      )}
      {(search.appliedPriceFrom || search.appliedPriceTo) && (
        <Chip selected onRemove={search.clearPrice}>
          Giá: {search.appliedPriceFrom || "0"} - {search.appliedPriceTo || "∞"}đ
        </Chip>
      )}
      <button
        type="button"
        onClick={search.clearAll}
        className="text-primary font-label-sm hover:underline ml-2 cursor-pointer font-bold"
      >
        Xóa tất cả
      </button>
    </div>
  );
}
