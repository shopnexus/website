"use client";

import MenuSelect from "@/components/ui/MenuSelect";
import Skeleton from "@/components/ui/Skeleton";
import type { SearchState } from "../_hooks/useSearchFilters";
import { SORT_OPTIONS } from "../_lib/search.logic";
import type { SortOption } from "../_types";

/** Why an option is greyed, in the words that say what to do about it. */
const UNAVAILABLE_BECAUSE: Partial<Record<SortOption, string>> = {
  relevance: "Cần một từ khoá để xếp theo độ liên quan",
  distance: "Bật “Tìm quanh tôi” để xếp theo khoảng cách",
  recommended: "Đăng nhập để nhận gợi ý riêng",
};

/**
 * What was found, and how it is ordered.
 *
 * `total_count` is explicitly null for a ranked query — an approximate nearest-neighbour
 * search never visits the rows it did not return — so the headline says "hơn N" rather
 * than inventing a total the server refused to claim.
 *
 * The count is grouped: it read `121860`, which is a number nobody can take in at a glance,
 * and the whole job of this line is a glance. The subject is named only when there is one —
 * `kết quả cho "Tất cả"` is a phrase that means "kết quả".
 */
export default function SearchToolbar({ search }: { search: SearchState }) {
  const { totalCount, listings, isLoading, hasNextPage } = search.feed;
  const subject = search.query || search.selectedCategoryName || null;

  const sortOptions = SORT_OPTIONS.map((option) => ({
    ...option,
    // Relevance needs a query, distance needs a position, and a personal recommendation
    // needs somebody to recommend to. The server answers 400 or 401 for each, so none of
    // them is offered without what it needs — but they stay listed, because a control that
    // disappears is a feature nobody finds.
    disabled: !search.isSortAvailable(option.value),
    disabledReason: UNAVAILABLE_BECAUSE[option.value],
  }));

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      {/*
       * Announced, because changing a filter replaces the grid without navigating anywhere:
       * a sighted shopper sees the count move, and without a live region nobody using a
       * screen reader is told the page they are on now holds something else.
       */}
      <div
        className="min-w-0 font-title-lg text-on-surface"
        aria-live="polite"
        aria-atomic="true"
      >
        {isLoading ? (
          <Skeleton className="inline-block h-6 w-48 align-middle" />
        ) : (
          <>
            <span className="font-bold text-primary">
              {totalCount !== null
                ? new Intl.NumberFormat("vi-VN").format(totalCount)
                : hasNextPage
                  ? `Hơn ${listings.length}`
                  : listings.length}
            </span>{" "}
            kết quả
            {subject && (
              <>
                {" cho "}
                <span className="text-on-surface-variant">“{subject}”</span>
              </>
            )}
          </>
        )}
      </div>

      <MenuSelect
        label="Sắp xếp kết quả"
        value={search.sortBy}
        onChange={(value) => search.setSortBy(value as SortOption)}
        options={sortOptions}
      />
    </div>
  );
}
