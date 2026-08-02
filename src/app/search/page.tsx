"use client";

import React, { useState, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ui/ProductCard";
import Chip from "@/components/ui/Chip";
import { mockListingPage, mockCategoryList } from "@/lib/mocks/catalog.mock";
import type { Listing } from "@/types/catalog.type";

function SearchPageContent(): React.ReactElement {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "";

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [priceFrom, setPriceFrom] = useState<string>("");
  const [priceTo, setPriceTo] = useState<string>("");
  const [appliedPriceFrom, setAppliedPriceFrom] = useState<string>("");
  const [appliedPriceTo, setAppliedPriceTo] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [extraProducts, setExtraProducts] = useState<Listing[]>([]);

  const subCategories = [
    { id: "sub-1", label: "Điện thoại thông minh", count: "1,245" },
    { id: "sub-2", label: "Máy tính bảng", count: "453" },
    { id: "sub-3", label: "Phụ kiện & Linh kiện", count: "2,109" },
  ];

  const toggleSub = (label: string): void => {
    setSelectedSubs((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const applyPriceFilter = (): void => {
    setAppliedPriceFrom(priceFrom);
    setAppliedPriceTo(priceTo);
  };

  const clearAllFilters = (): void => {
    setSelectedCategory("");
    setSelectedSubs([]);
    setVerifiedOnly(false);
    setPriceFrom("");
    setPriceTo("");
    setAppliedPriceFrom("");
    setAppliedPriceTo("");
  };

  const filteredProducts = useMemo(() => {
    let result = [...mockListingPage.data];

    if (initialQuery) {
      const qLower = initialQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(qLower) ||
          p.seller.name.toLowerCase().includes(qLower)
      );
    }

    if (selectedCategory) {
      result = result.filter(
        (p) => p.category_id === selectedCategory
      );
    }

    
    if (appliedPriceFrom) {
      const minPrice = Number(appliedPriceFrom);
      if (!Number.isNaN(minPrice)) {
        result = result.filter((p) => p.price >= minPrice);
      }
    }

    if (appliedPriceTo) {
      const maxPrice = Number(appliedPriceTo);
      if (!Number.isNaN(maxPrice) && maxPrice > 0) {
        result = result.filter((p) => p.price <= maxPrice);
      }
    }

    if (sortBy === "price_asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [initialQuery, selectedCategory, verifiedOnly, appliedPriceFrom, appliedPriceTo, sortBy]);

  const displayedProducts = useMemo(() => {
    return [...filteredProducts, ...extraProducts];
  }, [filteredProducts, extraProducts]);

  const handleLoadMore = (): void => {
    const batchIndex = Math.floor(extraProducts.length / 8) + 1;
    const baseList = filteredProducts.length > 0 ? filteredProducts : mockListingPage.data.slice(0, 8);
    const clonedBatch = baseList.slice(0, 8).map((p, idx) => ({
      ...p,
      id: `${p.id}-clone-${batchIndex}-${idx}-${Date.now()}`,
    }));
    setExtraProducts((prev) => [...prev, ...clonedBatch]);
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
        {mockCategoryList.data.map((cat) => {
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

            <div>
              <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider mb-4 text-[11px]">
                Danh mục phụ
              </h3>
              <div className="space-y-3">
                {subCategories.map((sub) => (
                  <label key={sub.id} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedSubs.includes(sub.label)}
                      onChange={() => toggleSub(sub.label)}
                      className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20 bg-surface-container-low cursor-pointer"
                    />
                    <span className="text-body-sm text-on-surface-variant group-hover:text-primary transition-colors">
                      {sub.label} ({sub.count})
                    </span>
                  </label>
                ))}
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
              Tìm thấy <span className="font-bold text-primary">{filteredProducts.length}</span> kết quả
              cho{" "}
              {initialQuery ? (
                <span className="italic text-on-surface-variant">&quot;{initialQuery}&quot;</span>
              ) : (
                <span className="italic text-on-surface-variant">
                  &quot;{mockCategoryList.data.find(c => c.id === selectedCategory)?.name || "Tất cả"}&quot;
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
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant/30 text-on-surface font-body-sm rounded-lg py-1.5 pl-3 pr-8 focus:ring-primary focus:border-primary outline-none cursor-pointer"
              >
                <option value="newest">Mới nhất</option>
                <option value="relevant">Độ liên quan</option>
                <option value="price_asc">Giá: Thấp đến Cao</option>
                <option value="price_desc">Giá: Cao đến Thấp</option>
              </select>
            </div>
          </div>

          {(selectedCategory || selectedSubs.length > 0 || verifiedOnly || appliedPriceFrom || appliedPriceTo) && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {selectedCategory && (
                <Chip selected onRemove={() => setSelectedCategory("")}>
                  {mockCategoryList.data.find(c => c.id === selectedCategory)?.name || selectedCategory}
                </Chip>
              )}
              {selectedSubs.map((sub) => (
                <Chip key={sub} selected onRemove={() => toggleSub(sub)}>
                  {sub}
                </Chip>
              ))}
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

          {displayedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {displayedProducts.map((product) => (
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

          {displayedProducts.length > 0 && (
            <div className="mt-12 flex justify-center">
              <button
                type="button"
                onClick={handleLoadMore}
                className="px-12 py-3 rounded-full border-2 border-primary text-primary font-bold hover:bg-primary hover:text-on-primary transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm" aria-hidden="true">
                  add
                </span>
                <span>
                  {extraProducts.length > 0
                    ? `Tải thêm sản phẩm (Đã tải thêm ${extraProducts.length})`
                    : "Tải thêm sản phẩm"}
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
