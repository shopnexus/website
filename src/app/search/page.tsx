"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ui/ProductCard";
import Chip from "@/components/ui/Chip";
import { useCategories, useListingsFeed } from "@/hooks/api/useCatalog";
import type { CategoryId, GetListingsData, ListingCondition } from "@/api/generated/types.gen";
import { LISTING_CONDITION_VI } from "@/lib/dictionaries";

type SortOption = NonNullable<NonNullable<GetListingsData["query"]>["sort"]>;

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "newest", label: "Mới nhất" },
  { value: "relevance", label: "Độ liên quan" },
  { value: "price-asc", label: "Giá: Thấp đến Cao" },
  { value: "price-desc", label: "Giá: Cao đến Thấp" },
  { value: "rating", label: "Đánh giá cao" },
];

/** A price input that is blank or not a number means "no bound". */
function priceBound(raw: string): number | undefined {
  if (!raw.trim()) return undefined;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : undefined;
}

function SearchPageContent(): React.ReactElement {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "";

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [condition, setCondition] = useState<ListingCondition | "">("");
  const [provinceCode, setProvinceCode] = useState<string>("");
  const [provinces, setProvinces] = useState<Array<{ code: number; name: string }>>([]);
  const [priceFrom, setPriceFrom] = useState<string>("");
  const [priceTo, setPriceTo] = useState<string>("");
  const [appliedPriceFrom, setAppliedPriceFrom] = useState<string>("");
  const [appliedPriceTo, setAppliedPriceTo] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch((err) => console.error("Failed to fetch provinces", err));
  }, []);

  const { data: categories = [] } = useCategories();

  // The tree arrives flat with parent_id, so the nav shows roots and the sidebar shows
  // the children of whatever is selected. It used to show three hardcoded phone
  // categories with invented result counts.
  const rootCategories = categories.filter((c) => !c.parent_id);
  const subCategories = selectedCategory
    ? categories.filter((c) => c.parent_id === selectedCategory)
    : [];

  // `sort=relevance` is refused without a query — the server rejects combinations rather
  // than resolving them by precedence — so fall back to newest when the box is empty.
  const sort: SortOption = sortBy === "relevance" && !initialQuery ? "newest" : sortBy;

  const {
    listings,
    totalCount,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useListingsFeed({
    limit: 12,
    q: initialQuery || undefined,
    category_id: (selectedCategory as CategoryId) || undefined,
    condition: (condition as ListingCondition) || undefined,
    province_code: provinceCode || undefined,
    // Price is a server-side filter and sorting is a server-side order: `min_price`,
    // `max_price` and `sort` are all parameters `/listings` accepts. Filtering the
    // current page in memory only ever hid rows from the page that happened to load.
    min_price: priceBound(appliedPriceFrom),
    max_price: priceBound(appliedPriceTo),
    sort,
  });

  const applyPriceFilter = (): void => {
    setAppliedPriceFrom(priceFrom);
    setAppliedPriceTo(priceTo);
  };

  const clearAllFilters = (): void => {
    setSelectedCategory("");
    setCondition("");
    setProvinceCode("");
    setPriceFrom("");
    setPriceTo("");
    setAppliedPriceFrom("");
    setAppliedPriceTo("");
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 w-full">
      <nav className="flex items-center gap-6 mb-8 overflow-x-auto hide-scrollbar pb-3 border-b border-outline-variant/20">
        <button
          type="button"
          onClick={() => setSelectedCategory("")}
          className={`flex items-center gap-2 shrink-0 font-bold text-label-md transition-colors pb-1 cursor-pointer ${
            !selectedCategory
              ? "text-primary border-b-2 border-primary"
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: !selectedCategory ? "'FILL' 1" : "'FILL' 0" }}
          >
            menu
          </span>
          <span>Tất cả danh mục</span>
        </button>
        {rootCategories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(isSelected ? "" : cat.id)}
              className={`flex items-center gap-2 shrink-0 font-bold text-label-md transition-colors pb-1 cursor-pointer ${
                isSelected
                  ? "text-primary border-b-2 border-primary"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0" }}
              >
                category
              </span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <aside className="md:col-span-3 space-y-6 sticky top-24">
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/30 space-y-6">
            <h2 className="font-headline font-bold text-headline-sm text-on-surface">Bộ lọc</h2>

            {subCategories.length > 0 && (
              <div>
                <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider mb-4 text-[11px]">
                  Danh mục phụ
                </h3>
                <div className="space-y-2">
                  {subCategories.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSelectedCategory(sub.id)}
                      className="block w-full text-left text-body-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-outline-variant/10">
              <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider mb-4 text-[11px]">
                Khoảng giá (₫)
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Từ"
                  value={priceFrom}
                  onChange={(e) => setPriceFrom(e.target.value)}
                  className="w-full bg-surface-container rounded-lg px-3 py-2 text-body-sm focus:ring-1 focus:ring-primary outline-none border-none text-on-surface"
                />
                <span className="text-on-surface-variant">-</span>
                <input
                  type="number"
                  placeholder="Đến"
                  value={priceTo}
                  onChange={(e) => setPriceTo(e.target.value)}
                  className="w-full bg-surface-container rounded-lg px-3 py-2 text-body-sm focus:ring-1 focus:ring-primary outline-none border-none text-on-surface"
                />
              </div>
              <button
                type="button"
                onClick={applyPriceFilter}
                className="w-full mt-4 bg-primary text-on-primary py-2 rounded-full text-label-md font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
              >
                Áp dụng
              </button>
            </div>

            <div className="pt-4 border-t border-outline-variant/10">
              <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider mb-4 text-[11px]">
                Tình trạng
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="radio"
                      name="condition"
                      checked={condition === ""}
                      onChange={() => setCondition("")}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 rounded-full border-2 border-outline-variant peer-checked:border-primary transition-colors flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                    </div>
                  </div>
                  <span className="text-body-sm text-on-surface group-hover:text-primary transition-colors">
                    Tất cả
                  </span>
                </label>
                {(Object.entries(LISTING_CONDITION_VI) as [ListingCondition, string][]).map(
                  ([key, label]) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="radio"
                          name="condition"
                          checked={condition === key}
                          onChange={() => setCondition(key)}
                          className="peer sr-only"
                        />
                        <div className="w-5 h-5 rounded-full border-2 border-outline-variant peer-checked:border-primary transition-colors flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-primary opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                        </div>
                      </div>
                      <span className="text-body-sm text-on-surface group-hover:text-primary transition-colors">
                        {label}
                      </span>
                    </label>
                  )
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/10">
              <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider mb-4 text-[11px]">
                Khu vực
              </h3>
              <select
                value={provinceCode}
                onChange={(e) => setProvinceCode(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 text-on-surface font-body-sm rounded-lg py-2 pl-3 pr-8 focus:ring-1 focus:ring-primary focus:border-primary outline-none cursor-pointer"
              >
                <option value="">Tất cả khu vực</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code.toString()}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </aside>

        <section className="md:col-span-9">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="font-headline text-headline-sm text-on-surface">
              {/* total_count is null for a ranked query — the search never visits the
                  rows it does not return — so fall back to what is on screen. */}
              Tìm thấy <span className="font-bold text-primary">{totalCount ?? listings.length}</span> kết quả
              cho{" "}
              {initialQuery ? (
                <span className="italic text-on-surface-variant">&quot;{initialQuery}&quot;</span>
              ) : (
                <span className="italic text-on-surface-variant">
                  &quot;{categories.find(c => c.id === selectedCategory)?.name || "Tất cả"}&quot;
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <label htmlFor="sort-select" className="text-label-sm text-on-surface-variant whitespace-nowrap">
                Sắp xếp theo:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-surface-container-lowest border border-outline-variant/30 text-on-surface font-body-sm rounded-lg py-1.5 pl-3 pr-8 focus:ring-primary focus:border-primary outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    // Relevance only has a meaning when there is a query to be relevant to.
                    disabled={option.value === "relevance" && !initialQuery}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(selectedCategory || condition || provinceCode || appliedPriceFrom || appliedPriceTo) && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {selectedCategory && (
                <Chip selected onRemove={() => setSelectedCategory("")}>
                  {categories.find((c) => c.id === selectedCategory)?.name || selectedCategory}
                </Chip>
              )}
              {condition && (
                <Chip selected onRemove={() => setCondition("")}>
                  Tình trạng: {LISTING_CONDITION_VI[condition as ListingCondition]}
                </Chip>
              )}
              {provinceCode && (
                <Chip selected onRemove={() => setProvinceCode("")}>
                  Khu vực: {provinces.find((p) => p.code.toString() === provinceCode)?.name || provinceCode}
                </Chip>
              )}
              {(appliedPriceFrom || appliedPriceTo) && (
                <Chip
                  selected
                  onRemove={() => {
                    setAppliedPriceFrom("");
                    setAppliedPriceTo("");
                    setPriceFrom("");
                    setPriceTo("");
                  }}
                >
                  Giá: {appliedPriceFrom || "0"} - {appliedPriceTo || "∞"}đ
                </Chip>
              )}
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-primary font-label-sm hover:underline ml-2 cursor-pointer font-bold"
              >
                Xóa tất cả
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-20 text-on-surface-variant">
              Đang tải dữ liệu...
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {listings.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-surface-container-low rounded-2xl p-12 text-center my-8 border border-outline-variant/20">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">
                search_off
              </span>
              <p className="text-body-lg text-on-surface-variant font-medium">
                Không tìm thấy sản phẩm nào phù hợp với bộ lọc của bạn.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-4 px-6 py-2 bg-primary text-on-primary rounded-full font-bold text-label-md hover:opacity-90 transition-opacity cursor-pointer inline-block"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}

          {hasNextPage && listings.length > 0 && (
            <div className="mt-12 flex justify-center">
              <button
                type="button"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-12 py-3 rounded-full border-2 border-primary text-primary font-bold hover:bg-primary hover:text-on-primary transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-sm" aria-hidden="true">
                  {isFetchingNextPage ? "sync" : "add"}
                </span>
                <span>
                  {isFetchingNextPage ? "Đang tải..." : "Tải thêm sản phẩm"}
                </span>
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function SearchPage(): React.ReactElement {
  return (
    <Suspense fallback={<div className="p-8 text-center font-bold text-primary animate-pulse">Đang tải kết quả tìm kiếm...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
