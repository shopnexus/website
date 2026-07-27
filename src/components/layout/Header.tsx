"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";

import { useSearch } from "@/hooks/useSearch";
import { useUserLocation } from "@/hooks/useUserLocation";
import Select from "@/components/ui/Select";

const SUGGESTIONS = ["Máy ảnh phim", "Gốm thủ công", "Vinyl xưa", "Túi Canvas"];

export default function Header(): React.ReactElement | null {
  const { query, setQuery, location, setLocation, isLoading, handleSearch } = useSearch("hcm");
  const { locationOptions } = useUserLocation(location, setLocation);
  const router = useRouter();
  const pathname = usePathname();

  // Only render big hero search bar on Home page ("/")
  if (pathname !== "/") {
    return null;
  }

  const handleSuggestionClick = (keyword: string): void => {
    setQuery(keyword);
    router.push(`/search?q=${encodeURIComponent(keyword)}`);
  };

  return (
    <section className="w-full max-w-[1440px] mx-auto px-4 md:px-8 pt-6 pb-4">
      <form
        onSubmit={handleSearch}
        className="flex flex-col md:flex-row gap-4 items-center bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30"
      >
        <div className="flex items-center gap-3 bg-surface-container rounded-full px-4 py-2 flex-1 w-full focus-within:ring-2 focus-within:ring-primary focus-within:bg-surface-container-lowest transition-all">
          <span className="material-symbols-outlined text-outline" aria-hidden="true">
            search
          </span>
          <input
            id="global-search-input"
            aria-label="Tìm kiếm sản phẩm"
            className="bg-transparent border-none focus:ring-0 w-full text-body-md placeholder:text-outline-variant outline-none text-on-surface"
            placeholder="Tìm kiếm đồ cũ, đồ thủ công, quà tặng..."
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 bg-surface-container rounded-full px-4 py-2 shrink-0 min-w-[180px]">
          <span className="material-symbols-outlined text-primary" aria-hidden="true">
            location_on
          </span>
          <div className="flex-1">
            <Select
              options={locationOptions}
              value={location}
              onChange={setLocation}
              placeholder="Chọn khu vực"
              className="w-full"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          aria-label="Thực hiện tìm kiếm"
          className="bg-primary text-on-primary px-8 py-2.5 rounded-full font-bold hover:opacity-90 transition-opacity cursor-pointer disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></span>
          ) : (
            "Tìm Kiếm"
          )}
        </button>
      </form>

      {/* Suggestion Chips */}
      <div className="flex flex-wrap gap-2 mt-4 overflow-x-auto hide-scrollbar items-center">
        <span className="text-label-sm text-on-surface-variant self-center mr-2">Gợi ý:</span>
        {SUGGESTIONS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => handleSuggestionClick(item)}
            className="bg-surface-container-high px-4 py-1.5 rounded-full text-label-sm hover:bg-secondary-container hover:text-on-secondary-container transition-colors cursor-pointer"
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  );
}
