"use client";

import Link from "next/link";
import AreaPicker from "@/components/ui/AreaPicker";
import { useContacts } from "@/hooks/api/useContacts";
import { useAuthStore } from "@/stores/use-auth-store";
import type { SearchState } from "../_hooks/useSearchFilters";
import { RADIUS_OPTIONS, radiusLabel } from "../_lib/search.logic";

const HEADING ="font-label-md text-on-surface-variant uppercase tracking-wider mb-4 text-label-xs";
const FIELD =
  "w-full bg-surface-container rounded-lg px-3 py-2 text-body-sm outline-none focus:ring-1 focus:ring-primary border-none text-on-surface";

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
      <p className="text-label-sm text-on-surface-variant">
        Địa chỉ đã lưu của bạn chưa có toạ độ nên chưa dùng để đo khoảng cách được.{" "}
        <Link href="/account/settings" className="text-primary font-bold hover:underline">
          Cập nhật địa chỉ
        </Link>
      </p>
    );
  }

  return (
    <select
      aria-label="Đo từ địa chỉ đã lưu"
      value={search.nearContactId ?? ""}
      onChange={(event) => {
        const id = event.target.value;
        if (id) search.useSavedAddress(id as (typeof geocoded)[number]["id"]);
        else search.clearOrigin();
      }}
      className={`${FIELD} cursor-pointer`}
    >
      <option value="">Hoặc đo từ địa chỉ đã lưu...</option>
      {geocoded.map((contact) => (
        <option key={contact.id} value={contact.id}>
          {contact.full_name} — {contact.ward_name}, {contact.province_name}
        </option>
      ))}
    </select>
  );
}

/**
 * Which area, and what it is near — two questions, not one. The area is a hard boundary; an
 * origin only measures, until a radius bounds it. So both are offered at the same time.
 */
export default function AreaFilterSection({ search }: { search: SearchState }) {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="pt-4 border-t border-outline-variant">
      <h3 className={HEADING}>Khu vực</h3>

      <AreaPicker
        provinceCode={search.provinceCode}
        wardCode={search.wardCode}
        onChange={search.setArea}
        label="Chọn tỉnh, thành phố hoặc phường xã"
      />

      <div className="mt-4 space-y-2">
        {search.hasOrigin ? (
          <>
            <div className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-primary" aria-hidden="true">
                {search.position ? "my_location" : "home_pin"}
              </span>
              {search.position ? "Đang đo từ vị trí của bạn" : "Đang đo từ địa chỉ đã lưu"}
            </div>
            <label className="block">
              <span className="sr-only">Bán kính tìm kiếm</span>
              <select
                value={search.radiusKm}
                onChange={(event) => search.setRadiusKm(Number(event.target.value))}
                className={`${FIELD} cursor-pointer`}
              >
                {RADIUS_OPTIONS.map((km) => (
                  <option key={km} value={km}>
                    {radiusLabel(km)}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={search.clearOrigin}
              className="text-primary font-label-sm hover:underline cursor-pointer font-bold text-left"
            >
              Bỏ đo khoảng cách
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={search.locateMe}
              className="w-full flex items-center justify-center gap-1.5 bg-surface-container text-on-surface py-2 rounded-lg text-label-md font-bold hover:bg-surface-container-high transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                my_location
              </span>
              Tìm quanh tôi
            </button>
            {isAuthenticated && <SavedAddressOrigin search={search} />}
            <p className="text-label-sm text-on-surface-variant">
              Có vị trí thì mỗi tin đăng sẽ hiện khoảng cách và bạn sắp xếp được theo gần nhất.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
