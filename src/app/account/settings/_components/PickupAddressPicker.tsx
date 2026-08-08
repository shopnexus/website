"use client";

import Link from "next/link";
import type { Contact, ContactId } from "@/api/generated/types.gen";
import Button from "@/components/ui/Button";

/**
 * Which saved address a courier collects from.
 *
 * It matters twice: it is where the parcel is picked up, and it is the location buyers see
 * on the listing — a listing freezes it at publication. So changing it here changes where
 * the *next* listing says it is, not the ones already live, and the copy says so.
 */
export default function PickupAddressPicker({
  contacts,
  loading,
  saving,
  onChoose,
}: {
  contacts: ReadonlyArray<Contact>;
  loading: boolean;
  saving: boolean;
  onChoose: (id: ContactId) => void;
}) {
  if (loading) {
    return <div className="h-24 rounded-xl bg-surface-container-high animate-pulse" />;
  }

  if (contacts.length === 0) {
    return (
      <div className="text-center py-8">
        <span className="material-symbols-outlined text-4xl opacity-40 mb-3 block text-on-surface-variant">
          location_off
        </span>
        <p className="font-body-md text-on-surface-variant mb-4">
          Bạn chưa lưu địa chỉ nào. Người bán cần ít nhất một địa chỉ để đăng tin.
        </p>
        <Link href="/account/contacts">
          <Button>Mở sổ địa chỉ</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {contacts.map((contact) => (
        <div
          key={contact.id}
          className={[
            "flex flex-wrap items-center gap-4 p-4 rounded-xl border transition-colors",
            contact.is_default_pickup
              ? "border-primary bg-primary/5"
              : "border-outline-variant bg-surface",
          ].join(" ")}
        >
          <div className="min-w-0 flex-1">
            <p className="font-label-md font-bold text-on-surface flex items-center gap-2 flex-wrap">
              {contact.full_name}
              {contact.is_default_pickup && (
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-primary-container text-on-primary-container uppercase tracking-wide">
                  Đang dùng
                </span>
              )}
            </p>
            <p className="font-body-sm text-on-surface-variant mt-0.5">
              {contact.address}, {contact.ward_name}, {contact.province_name}
            </p>
            <p className="font-body-sm text-on-surface-variant">{contact.phone}</p>
          </div>

          {!contact.is_default_pickup && (
            <Button
              variant="outline"
              size="sm"
              disabled={saving}
              onClick={() => onChoose(contact.id)}
            >
              Dùng địa chỉ này
            </Button>
          )}
        </div>
      ))}

      <p className="text-[11px] text-on-surface-variant leading-relaxed">
        Tin đăng đã lên sàn giữ nguyên địa chỉ lấy hàng đã chọn lúc đăng. Thay đổi ở đây áp dụng
        cho những tin bạn đăng sau này.
      </p>
    </div>
  );
}
