"use client";

import Skeleton from "@/components/ui/Skeleton";
import type { SearchState } from "../_hooks/useSearchFilters";
import { SEARCH_MODES, SORT_OPTIONS } from "../_lib/search.logic";
import type { SearchMode, SortOption } from "../_types";

/**
 * What was found, how it was matched, and how it is ordered.
 *
 * `total_count` is explicitly null for a ranked query — an approximate nearest-neighbour
 * search never visits the rows it did not return — so the headline says "hơn N" rather
 * than inventing a total the server refused to claim.
 */
export default function SearchToolbar({ search }: { search: SearchState }) {
  const { totalCount, listings, isLoading, hasNextPage } = search.feed;
  const subject = search.query
    ? `"${search.query}"`
    : `"${search.selectedCategoryName || "Tất cả"}"`;

  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="font-headline text-headline-sm text-on-surface">
          {isLoading ? (
            <Skeleton className="h-6 w-48 inline-block align-middle" />
          ) : totalCount !== null ? (
            <>
              Tìm thấy <span className="font-bold text-primary">{totalCount}</span> kết quả cho{" "}
              <span className="italic text-on-surface-variant">{subject}</span>
            </>
          ) : (
            <>
              <span className="font-bold text-primary">
                {hasNextPage ? `Hơn ${listings.length}` : listings.length}
              </span>{" "}
              kết quả phù hợp nhất cho{" "}
              <span className="italic text-on-surface-variant">{subject}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="sort-select" className="text-label-sm text-on-surface-variant whitespace-nowrap">
            Sắp xếp theo:
          </label>
          <select
            id="sort-select"
            value={search.sortBy}
            onChange={(event) => search.setSortBy(event.target.value as SortOption)}
            className="bg-surface-container-lowest border border-outline-variant/30 text-on-surface font-body-sm rounded-lg py-1.5 pl-3 pr-8 focus:ring-primary focus:border-primary outline-none cursor-pointer"
          >
            {SORT_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
                // Relevance needs a query, distance needs a position, and a personal
                // recommendation needs somebody to recommend to. The server answers 400
                // or 401 for each, so none of them is offered without what it needs.
                disabled={!search.isSortAvailable(option.value)}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Only with a query: the server ignores `mode` without one. */}
      {search.query && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-label-sm text-on-surface-variant">Cách khớp:</span>
          {SEARCH_MODES.map((option) => {
            const isSelected = search.mode === option.value;
            return (
              <button
                key={option.value}
                type="button"
                title={option.hint}
                aria-pressed={isSelected}
                onClick={() => search.setMode(option.value as SearchMode)}
                className={`rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors cursor-pointer ${
                  isSelected
                    ? "border-transparent bg-primary-container text-on-primary-container"
                    : "border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
