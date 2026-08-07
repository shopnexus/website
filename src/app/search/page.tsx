"use client";

import React, { Suspense } from "react";
import ActiveFilterChips from "./_components/ActiveFilterChips";
import SearchFilterPanel from "./_components/SearchFilterPanel";
import SearchResults from "./_components/SearchResults";
import SearchToolbar from "./_components/SearchToolbar";
import { useSearchFilters } from "./_hooks/useSearchFilters";

function SearchPageContent(): React.ReactElement {
  const search = useSearchFilters();

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 w-full">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <SearchFilterPanel search={search} />

        <section className="md:col-span-9">
          <SearchToolbar search={search} />
          <ActiveFilterChips search={search} />
          <SearchResults search={search} />
        </section>
      </div>
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
