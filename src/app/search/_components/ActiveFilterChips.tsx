"use client";

import Chip from "@/components/ui/Chip";
import { LISTING_CONDITION_VI } from "@/lib/dictionaries";
import { formatMoney } from "@/lib/money";
import type { SearchState } from "../_hooks/useSearchFilters";

/**
 * What is narrowing the results, each removable. The area is two chips: dropping the ward
 * should widen to its province, where one chip for both levels only went to the whole country.
 */
export default function ActiveFilterChips({ search }: { search: SearchState }) {
  if (!search.hasAnyFilter) return null;

  const priceLabel =
    search.minPrice !== undefined && search.maxPrice !== undefined
      ? `${formatMoney(search.minPrice, "VND")} – ${formatMoney(search.maxPrice, "VND")}`
      : search.minPrice !== undefined
        ? `Từ ${formatMoney(search.minPrice, "VND")}`
        : `Đến ${formatMoney(search.maxPrice ?? 0, "VND")}`;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {/* Only once the name is known: "01" is the code the API wants, not a place a shopper
          would recognise, and the division list loads a moment after the page. */}
      {search.provinceCode && search.selectedProvince && (
        <Chip selected onRemove={search.clearArea} removeLabel="Bỏ lọc theo tỉnh, thành phố">
          {search.selectedProvince.name}
        </Chip>
      )}
      {search.wardCode && search.selectedWard && (
        <Chip selected onRemove={search.clearWard} removeLabel="Bỏ lọc theo phường, xã">
          {search.selectedWard.name}
        </Chip>
      )}
      {search.hasOrigin && (
        <Chip selected onRemove={search.clearOrigin} removeLabel="Bỏ đo khoảng cách">
          {search.radiusKm === 0 ? "Hiện khoảng cách" : `Trong vòng ${search.radiusKm} km`}
        </Chip>
      )}
      {search.selectedCategory && (
        <Chip
          selected
          onRemove={() => search.setSelectedCategory("")}
          removeLabel="Bỏ lọc theo danh mục"
        >
          {search.selectedCategoryName || search.selectedCategory}
        </Chip>
      )}
      {search.tag && (
        <Chip selected onRemove={() => search.setTag("")} removeLabel="Bỏ lọc theo thẻ">
          #{search.tag}
        </Chip>
      )}
      {search.condition && (
        <Chip
          selected
          onRemove={() => search.setCondition("")}
          removeLabel="Bỏ lọc theo tình trạng"
        >
          Tình trạng: {LISTING_CONDITION_VI[search.condition]}
        </Chip>
      )}
      {(search.minPrice !== undefined || search.maxPrice !== undefined) && (
        <Chip selected onRemove={search.clearPrice} removeLabel="Bỏ lọc theo khoảng giá">
          Giá: {priceLabel}
        </Chip>
      )}
      <button
        type="button"
        onClick={search.clearAll}
        className="text-primary font-label-sm hover:underline ml-2 cursor-pointer font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
      >
        Xóa tất cả
      </button>
    </div>
  );
}
