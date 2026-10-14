"use client";

import type { ContactId, ListingDetail } from "@/api/generated/types.gen";
import { LISTING_STATUS_VI } from "@/lib/dictionaries";
import { useContacts } from "@/hooks/api/useContacts";
import { canPublish } from "../../_lib/listing-actions";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-secondary-container text-on-secondary-container",
  pending: "bg-primary-container text-on-primary-container",
  draft: "bg-surface-container-high text-on-surface-variant",
  hidden: "bg-surface-container-high text-on-surface-variant",
};

/**
 * Where the listing stands, and the address it ships from.
 *
 * No buttons: this panel used to carry "Đăng bán" while the form beside it carried "Lưu thay
 * đổi", which is two controls competing to be the one a seller presses. The page has a single
 * action bar now and this is what it reads from — the pickup address in particular, which is
 * why the selector stays here beside the status it belongs to.
 *
 * `pickup_contact_id` names the address a carrier collects from, and it is frozen onto the row
 * when the listing goes live because it is both where the courier goes and how buyers find the
 * listing. Omitting it means the seller's default, which is why the selector starts there.
 */
export default function PublicationPanel({
  listing,
  pickupContactID,
  onPickupChange,
}: {
  listing: ListingDetail;
  pickupContactID: string;
  onPickupChange: (id: string) => void;
}) {
  const { data: contacts = [] } = useContacts();

  return (
    <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 md:p-6 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-title-md text-on-surface">Trạng thái</h2>
        <span className={`px-3 py-1 text-label-xs rounded-full ${STATUS_STYLES[listing.status]}`}>
          {LISTING_STATUS_VI[listing.status]}
        </span>
      </div>

      {listing.taken_down_at && (
        <div className="rounded-xl bg-error/10 text-error p-4 text-body-sm">
          <strong className="block mb-1">Sản phẩm đã bị gỡ bởi kiểm duyệt viên.</strong>
          {listing.takedown_reason || "Không có lý do được gửi kèm."}
        </div>
      )}

      {listing.status === "pending" && (
        <p className="text-body-sm text-on-surface-variant">
          Đang chờ kiểm duyệt. Bạn sẽ nhận được thông báo khi có kết quả.
        </p>
      )}

      {canPublish(listing.status) && (
        <div className="space-y-3">
          <label htmlFor="pickup-contact" className="block text-label-sm text-on-surface">
            Địa chỉ lấy hàng
          </label>
          {contacts.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant bg-surface-container-low rounded-lg p-3">
              Bạn chưa có địa chỉ nào. Thêm một địa chỉ ở Thông tin liên lạc trước khi đăng bán.
            </p>
          ) : (
            <select
              id="pickup-contact"
              value={pickupContactID}
              onChange={(event) => onPickupChange(event.target.value as ContactId)}
              className="w-full px-3 py-2.5 bg-surface-container-lowest rounded-lg border border-outline focus:border-primary outline-none transition-colors text-body-md"
            >
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.full_name} — {contact.address}, {contact.ward_name},{" "}
                  {contact.province_name}
                </option>
              ))}
            </select>
          )}
          <p className="text-body-xs text-on-surface-variant">
            Đây cũng là vị trí người mua nhìn thấy trên tin đăng.
          </p>
        </div>
      )}
    </section>
  );
}
