"use client";

import React, { Suspense, useState } from "react";
import ActiveFilterChips from "./_components/ActiveFilterChips";
import SearchFilterPanel from "./_components/SearchFilterPanel";
import SearchFilterSheet from "./_components/SearchFilterSheet";
import SearchResults from "./_components/SearchResults";
import SearchToolbar from "./_components/SearchToolbar";
import SearchUnderstanding from "./_components/SearchUnderstanding";
import { useSearchFilters, type SearchState } from "./_hooks/useSearchFilters";

/** How many filters are on: a control that hides state has to say how much. */
function activeFilterCount(search: SearchState): number {
  return [
    search.selectedCategory,
    search.tag,
    search.condition,
    search.minPrice !== undefined || search.maxPrice !== undefined,
    search.provinceCode,
    search.wardCode,
    search.hasOrigin,
  ].filter(Boolean).length;
}

function SearchPageContent(): React.ReactElement {
  const search = useSearchFilters();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const count = activeFilterCount(search);

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 w-full">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <SearchFilterPanel search={search} />

        <section className="md:col-span-9">
          <SearchToolbar search={search} />

          {/* Hidden from `md` up, where the rail is already on screen. */}
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="md:hidden mb-4 w-full flex items-center justify-center gap-2 bg-surface-container-lowest border border-outline-variant text-on-surface py-2.5 rounded-full font-bold text-label-md cursor-pointer hover:bg-surface-container transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              tune
            </span>
            Bộ lọc
            {count > 0 && (
              <span className="bg-primary text-on-primary rounded-full min-w-5 h-5 px-1.5 inline-flex items-center justify-center text-label-sm">
                {count}
              </span>
            )}
          </button>

          <SearchUnderstanding search={search} />
          <ActiveFilterChips search={search} />
          <SearchResults search={search} />
        </section>
      </div>

      <SearchFilterSheet
        search={search}
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
      />
    </div>
  );
}

export default function SearchPage(): React.ReactElement {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center font-bold text-primary animate-pulse">
          Đang tải kết quả tìm kiếm...
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
