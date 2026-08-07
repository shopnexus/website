"use client";

import type { SearchState } from "../_hooks/useSearchFilters";
import { CONDITION_OPTIONS, RADIUS_OPTIONS } from "../_lib/search.logic";
import SearchTagFilter from "./SearchTagFilter";

const SECTION = "pt-4 border-t border-outline-variant/10";
const HEADING = "font-label-md text-on-surface-variant uppercase tracking-wider mb-4 text-[11px]";
const FIELD =
  "w-full bg-surface-container rounded-lg px-3 py-2 text-body-sm outline-none focus:ring-1 focus:ring-primary border-none text-on-surface";

/** Every server-side filter `/listings` accepts, as the rail beside the results. */
export default function SearchFilterPanel({ search }: { search: SearchState }) {
  return (
    <aside className="md:col-span-3 space-y-6 sticky top-24">
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/30 space-y-6">
        <h2 className="font-headline font-bold text-headline-sm text-on-surface">Bộ lọc</h2>

        {search.subCategories.length > 0 && (
          <div>
            <h3 className={HEADING}>Danh mục phụ</h3>
            <div className="space-y-2">
              {search.subCategories.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => search.setSelectedCategory(sub.id)}
                  className="block w-full text-left text-body-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <SearchTagFilter
          selected={search.tag}
          categoryId={search.selectedCategory}
          onSelect={search.setTag}
        />

        <div className={SECTION}>
          <h3 className={HEADING}>Khu vực</h3>
          <div className="flex flex-col gap-2">
            <select
              aria-label="Tỉnh / Thành phố"
              value={search.provinceCode}
              onChange={(event) => {
                search.setProvinceCode(event.target.value);
                search.setWardCode("");
              }}
              className={`${FIELD} cursor-pointer`}
            >
              <option value="">Toàn quốc</option>
              {search.provinces.map((province) => (
                <option key={province.code} value={province.code}>
                  {province.name}
                </option>
              ))}
            </select>
            {search.wards.length > 0 && (
              <select
                aria-label="Phường / Xã"
                value={search.wardCode}
                onChange={(event) => search.setWardCode(event.target.value)}
                className={`${FIELD} cursor-pointer`}
              >
                <option value="">Tất cả phường / xã</option>
                {search.wards.map((ward) => (
                  <option key={ward.code} value={ward.code}>
                    {ward.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {search.position ? (
              <>
                <select
                  aria-label="Bán kính tìm kiếm"
                  value={search.radiusKm}
                  onChange={(event) => search.setRadiusKm(Number(event.target.value))}
                  className={`${FIELD} cursor-pointer`}
                >
                  {RADIUS_OPTIONS.map((km) => (
                    <option key={km} value={km}>
                      Trong vòng {km} km
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={search.clearPosition}
                  className="text-primary font-label-sm hover:underline cursor-pointer font-bold text-left"
                >
                  Bỏ tìm quanh tôi
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={search.locateMe}
                className="w-full flex items-center justify-center gap-1.5 bg-surface-container text-on-surface py-2 rounded-lg text-label-md font-bold hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  my_location
                </span>
                Tìm quanh tôi
              </button>
            )}
          </div>
        </div>

        <div className={SECTION}>
          <h3 className={HEADING}>Khoảng giá (₫)</h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              aria-label="Giá từ"
              placeholder="Từ"
              value={search.priceFrom}
              onChange={(event) => search.setPriceFrom(event.target.value)}
              className={FIELD}
            />
            <span className="text-on-surface-variant">-</span>
            <input
              type="number"
              aria-label="Giá đến"
              placeholder="Đến"
              value={search.priceTo}
              onChange={(event) => search.setPriceTo(event.target.value)}
              className={FIELD}
            />
          </div>
          <button
            type="button"
            onClick={search.applyPrice}
            className="w-full mt-4 bg-primary text-on-primary py-2 rounded-full text-label-md font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
          >
            Áp dụng
          </button>
        </div>

        <div className={SECTION}>
          <h3 className={HEADING}>Tình trạng</h3>
          <div className="space-y-3">
            {CONDITION_OPTIONS.map(({ value, label }) => (
              <label key={value || "all"} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="radio"
                    name="condition"
                    checked={search.condition === value}
                    onChange={() => search.setCondition(value)}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 rounded-full border-2 border-outline-variant peer-checked:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary transition-colors flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                </div>
                <span className="text-body-sm text-on-surface group-hover:text-primary transition-colors">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
