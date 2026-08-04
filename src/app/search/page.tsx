"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import ProductCard from "@/components/ui/ProductCard";
import Chip from "@/components/ui/Chip";
import { useCategories, useListingsFeed } from "@/hooks/api/useCatalog";
import { useAdminAreas } from "@/hooks/useAdminAreas";
import type { CategoryId, GetListingsData } from "@/api/generated/types.gen";

type SortOption = NonNullable<NonNullable<GetListingsData["query"]>["sort"]>;

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "newest", label: "Mới nhất" },
  { value: "relevance", label: "Độ liên quan" },
  { value: "price-asc", label: "Giá: Thấp đến Cao" },
  { value: "price-desc", label: "Giá: Cao đến Thấp" },
  { value: "rating", label: "Đánh giá cao" },
  { value: "distance", label: "Gần tôi nhất" },
];

/** What the radius selector offers. Any value here needs a position to mean anything. */
const RADIUS_OPTIONS = [5, 10, 25, 50, 100] as const;

/** Where the buyer is, as `/listings` wants it. */
interface Position {
  lat: number;
  lon: number;
}

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
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [priceFrom, setPriceFrom] = useState<string>("");
  const [priceTo, setPriceTo] = useState<string>("");
  const [appliedPriceFrom, setAppliedPriceFrom] = useState<string>("");
  const [appliedPriceTo, setAppliedPriceTo] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [provinceCode, setProvinceCode] = useState<string>("");
  const [districtCode, setDistrictCode] = useState<string>("");
  const [position, setPosition] = useState<Position | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(25);

  const { data: categories = [] } = useCategories();
  // Districts, not wards: a filter this coarse is what a browse needs, and the deep
  // document is several times the size.
  const { data: provinces = [] } = useAdminAreas(2);

  const selectedProvince = provinces.find((p) => p.code.toString() === provinceCode);

  /**
   * A "near me" browse. The device's position is the only one this page can offer — the
   * alternative the API takes, `near_contact_id`, is one of the caller's saved addresses,
   * and picking one belongs to checkout rather than to a public search.
   */
  const locateMe = (): void => {
    if (!navigator.geolocation) {
      toast.error("Thiết bị không hỗ trợ định vị.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setPosition({ lat: coords.latitude, lon: coords.longitude }),
      () => toast.error("Không lấy được vị trí. Vui lòng cho phép truy cập định vị."),
    );
  };

  // The tree arrives flat with parent_id, so the nav shows roots and the sidebar shows
  // the children of whatever is selected. It used to show three hardcoded phone
  // categories with invented result counts.
  const rootCategories = categories.filter((c) => !c.parent_id);
  const subCategories = selectedCategory
    ? categories.filter((c) => c.parent_id === selectedCategory)
    : [];

  // The server refuses combinations rather than resolving them by precedence, so the two
  // sorts that need something fall back when they do not have it: `relevance` needs a
  // query, `distance` needs a position.
  const sort: SortOption =
    (sortBy === "relevance" && !initialQuery) || (sortBy === "distance" && !position)
      ? "newest"
      : sortBy;

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
    // Price is a server-side filter and sorting is a server-side order: `min_price`,
    // `max_price` and `sort` are all parameters `/listings` accepts. Filtering the
    // current page in memory only ever hid rows from the page that happened to load.
    min_price: priceBound(appliedPriceFrom),
    max_price: priceBound(appliedPriceTo),
    // Matched against the listing's own snapshot of the seller's pickup address. Only the
    // narrowest level is sent — a district is already inside its province.
    province_code: districtCode ? undefined : provinceCode || undefined,
    district_code: districtCode || undefined,
    // A position ranks and reports distance on its own; the radius is what excludes.
    lat: position?.lat,
    lon: position?.lon,
    radius_km: position ? radiusKm : undefined,
    sort,
  });

  const applyPriceFilter = (): void => {
    setAppliedPriceFrom(priceFrom);
    setAppliedPriceTo(priceTo);
  };

  const clearAllFilters = (): void => {
    setSelectedCategory("");
    setVerifiedOnly(false);
    setPriceFrom("");
    setPriceTo("");
    setAppliedPriceFrom("");
    setAppliedPriceTo("");
    setProvinceCode("");
    setDistrictCode("");
    setPosition(null);
    if (sortBy === "distance") setSortBy("newest");
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
                Khu vực
              </h3>
              <div className="flex flex-col gap-2">
                <select
                  aria-label="Tỉnh / Thành phố"
                  value={provinceCode}
                  onChange={(e) => {
                    setProvinceCode(e.target.value);
                    setDistrictCode("");
                  }}
                  className="w-full bg-surface-container rounded-lg px-3 py-2 text-body-sm outline-none focus:ring-1 focus:ring-primary border-none text-on-surface cursor-pointer"
                >
                  <option value="">Toàn quốc</option>
                  {provinces.map((p) => (
                    <option key={p.code} value={p.code.toString()}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {selectedProvince?.districts && selectedProvince.districts.length > 0 && (
                  <select
                    aria-label="Quận / Huyện"
                    value={districtCode}
                    onChange={(e) => setDistrictCode(e.target.value)}
                    className="w-full bg-surface-container rounded-lg px-3 py-2 text-body-sm outline-none focus:ring-1 focus:ring-primary border-none text-on-surface cursor-pointer"
                  >
                    <option value="">Tất cả quận / huyện</option>
                    {selectedProvince.districts.map((d) => (
                      <option key={d.code} value={d.code.toString()}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="mt-4 flex flex-col gap-2">
                {position ? (
                  <>
                    <select
                      aria-label="Bán kính tìm kiếm"
                      value={radiusKm}
                      onChange={(e) => setRadiusKm(Number(e.target.value))}
                      className="w-full bg-surface-container rounded-lg px-3 py-2 text-body-sm outline-none focus:ring-1 focus:ring-primary border-none text-on-surface cursor-pointer"
                    >
                      {RADIUS_OPTIONS.map((km) => (
                        <option key={km} value={km}>
                          Trong vòng {km} km
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        setPosition(null);
                        if (sortBy === "distance") setSortBy("newest");
                      }}
                      className="text-primary font-label-sm hover:underline cursor-pointer font-bold text-left"
                    >
                      Bỏ tìm quanh tôi
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={locateMe}
                    className="w-full flex items-center justify-center gap-1.5 bg-surface-container text-on-surface py-2 rounded-lg text-label-md font-bold hover:bg-surface-container-high transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">my_location</span>
                    Tìm quanh tôi
                  </button>
                )}
              </div>
            </div>

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
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-body-sm font-semibold flex items-center gap-2 text-on-surface">
                  <span
                    className="material-symbols-outlined text-primary text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                  Người bán xác thực
                </span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </div>
              </label>
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
                    // Relevance only has a meaning when there is a query to be relevant
                    // to, and distance only when the browse knows where the buyer is.
                    disabled={
                      (option.value === "relevance" && !initialQuery) ||
                      (option.value === "distance" && !position)
                    }
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(selectedCategory ||
            verifiedOnly ||
            appliedPriceFrom ||
            appliedPriceTo ||
            provinceCode ||
            position) && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {provinceCode && (
                <Chip
                  selected
                  onRemove={() => {
                    setProvinceCode("");
                    setDistrictCode("");
                  }}
                >
                  {districtCode
                    ? selectedProvince?.districts?.find((d) => d.code.toString() === districtCode)?.name
                    : selectedProvince?.name}
                </Chip>
              )}
              {position && (
                <Chip
                  selected
                  onRemove={() => {
                    setPosition(null);
                    if (sortBy === "distance") setSortBy("newest");
                  }}
                >
                  Trong vòng {radiusKm} km
                </Chip>
              )}
              {selectedCategory && (
                <Chip selected onRemove={() => setSelectedCategory("")}>
                  {categories.find(c => c.id === selectedCategory)?.name || selectedCategory}
                </Chip>
              )}
              {verifiedOnly && (
                <Chip selected onRemove={() => setVerifiedOnly(false)}>
                  Người bán xác thực
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
