"use client";

import Link from "next/link";
import AreaPicker from "@/components/ui/AreaPicker";
import MenuSelect from "@/components/ui/MenuSelect";
import { useContacts } from "@/hooks/api/useContacts";
import { useAuthStore } from "@/stores/use-auth-store";
import type { SearchState } from "../_hooks/useSearchFilters";
import { RADIUS_OPTIONS, radiusLabel } from "../_lib/search.logic";
import { HEADING, SECTION } from "./filter-styles";

/**
 * Measuring from a saved address. Only geocoded ones are offered — the server 422s on an
 * address with no coordinates. Its own component so nothing is fetched for a guest (401).
 */
function SavedAddressOrigin({ search }: { search: SearchState }) {
  const { data: contacts = [], isLoading } = useContacts();
  const geocoded = contacts.filter((c) => c.latitude !== null && c.longitude !== null);

  if (isLoading || contacts.length === 0) return null;

  if (geocoded.length === 0) {
    return (
      <p className="font-label-sm text-on-surface-variant">
        Địa chỉ đã lưu chưa có toạ độ.{" "}
        <Link href="/account/settings" className="font-bold text-primary hover:underline">
          Cập nhật
        </Link>
      </p>
    );
  }

  return (
    <MenuSelect
      label="Đo từ địa chỉ đã lưu"
      align="start"
      className="w-full justify-between"
      value={search.nearContactId ?? ""}
      onChange={(id) => {
        if (id) search.useSavedAddress(id as (typeof geocoded)[number]["id"]);
        else search.clearOrigin();
      }}
      options={[
        { value: "", label: "Hoặc đo từ địa chỉ đã lưu…" },
        ...geocoded.map((contact) => ({
          value: contact.id,
          label: `${contact.full_name} — ${contact.ward_name}, ${contact.province_name}`,
        })),
      ]}
    />
  );
}

/**
 * Which area, and what it is near — two questions, not one. The area is a hard boundary; an
 * origin only measures, until a radius bounds it. So both are offered at the same time.
 *
 * There used to be a sentence under the button explaining what sharing a position buys you.
 * It has moved to where it is needed: the sort menu greys out "Gần tôi nhất" and says why.
 * An explanation preloaded above a control everybody understands is a paragraph the reader
 * pays for and skips; the same words at the moment somebody is blocked are an instruction.
 */
export default function AreaFilterSection({ search }: { search: SearchState }) {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className={SECTION}>
      <h3 className={HEADING}>Khu vực</h3>

      <AreaPicker
        provinceCode={search.provinceCode}
        wardCode={search.wardCode}
        onChange={search.setArea}
        label="Chọn tỉnh, thành phố hoặc phường xã"
      />

      <div className="mt-3 space-y-2">
        {search.hasOrigin ? (
          <>
            <p className="flex items-center gap-1.5 font-label-sm text-on-surface-variant">
              <span
                className="material-symbols-outlined text-[16px] text-primary"
                aria-hidden="true"
              >
                {search.position ? "my_location" : "home_pin"}
              </span>
              {search.position ? "Đang đo từ vị trí của bạn" : "Đang đo từ địa chỉ đã lưu"}
            </p>
            <MenuSelect
              label="Bán kính tìm kiếm"
              align="start"
              className="w-full justify-between"
              value={String(search.radiusKm)}
              onChange={(value) => search.setRadiusKm(Number(value))}
              options={RADIUS_OPTIONS.map((km) => ({
                value: String(km),
                label: radiusLabel(km),
              }))}
            />
            <button
              type="button"
              onClick={search.clearOrigin}
              className="cursor-pointer text-left font-label-sm font-bold text-primary hover:underline"
            >
              Bỏ đo khoảng cách
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={search.locateMe}
              className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-surface-container py-2 font-label-md font-bold text-on-surface transition-colors hover:bg-surface-container-high focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                my_location
              </span>
              Tìm quanh tôi
            </button>
            {isAuthenticated && <SavedAddressOrigin search={search} />}
          </>
        )}
      </div>
    </div>
  );
}
