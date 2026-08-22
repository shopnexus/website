"use client";

import React from "react";
import { usePathname } from "next/navigation";

import { useIsClient } from "@/hooks/useIsClient";
import { useSearch } from "@/hooks/useSearch";
import AreaPicker from "@/components/ui/AreaPicker";

export default function Header(): React.ReactElement | null {
  const isMounted = useIsClient();
  const { query, setQuery, province, ward, setArea, handleSearch } = useSearch();
  const pathname = usePathname();

  if (!isMounted || pathname !== "/") {
    return null;
  }

  return (
    <section className="w-full max-w-[1440px] mx-auto px-4 md:px-8 pt-6 pb-4">
      <form
        onSubmit={handleSearch}
        className="flex flex-col md:flex-row gap-4 items-center bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant"
      >
        <div className="flex items-center gap-3 bg-surface-container rounded-full px-4 py-2 flex-1 w-full focus-within:ring-2 focus-within:ring-primary focus-within:bg-surface-container-lowest transition-all">
          <span className="material-symbols-outlined text-outline" aria-hidden="true">
            search
          </span>
          <input
            id="global-search-input"
            aria-label="Tìm kiếm sản phẩm"
            className="bg-transparent border-none focus:ring-0 w-full text-body-md placeholder:text-outline-variant outline-none text-on-surface"
            placeholder="Tìm kiếm đồ cũ, đồ thủ công, quà tặng... gõ sai chính tả vẫn tìm được"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <AreaPicker
          provinceCode={province}
          wardCode={ward}
          onChange={setArea}
          label="Chọn khu vực để tìm"
          className="shrink-0 w-full md:w-[260px]"
        />

        <button
          type="submit"
          aria-label="Thực hiện tìm kiếm"
          className="bg-primary text-on-primary px-8 py-2.5 rounded-full font-bold hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center min-w-[120px]"
        >
          Tìm Kiếm
        </button>
      </form>

    </section>
  );
}
