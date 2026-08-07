"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import type { ContactId, ListingDetail } from "@/api/generated/types.gen";
import Button from "@/components/ui/Button";
import { LISTING_STATUS_VI } from "@/lib/dictionaries";
import { usePublishListing } from "@/hooks/api/useCatalog";
import { useContacts } from "@/hooks/api/useContacts";
import { useUnpublishListing } from "@/hooks/api/useSellerListings";
import { canPublish, canUnpublish } from "../../_lib/listing-actions";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-secondary-container text-on-secondary-container",
  pending: "bg-primary-container text-on-primary-container",
  draft: "bg-surface-container-high text-on-surface-variant",
  hidden: "bg-surface-container-high text-on-surface-variant",
};

/**
 * Where the listing stands, and the one control that moves it.
 *
 * Publishing is also where the listing gets its location: `pickup_contact_id` names the
 * address a carrier collects from, and it is frozen onto the row at that moment because
 * it is both where the courier goes and how buyers find the listing. Omitting it means
 * the seller's default pickup address, which is why the selector starts on that one and
 * a seller with no address is told before they press anything.
 */
export default function PublicationPanel({ listing }: { listing: ListingDetail }) {
  const { data: contacts = [] } = useContacts();
  const publish = usePublishListing();
  const unpublish = useUnpublishListing();

  const [pickupId, setPickupId] = useState("");
  const chosen = pickupId || contacts.find((c) => c.is_default_pickup)?.id || contacts[0]?.id || "";

  const handlePublish = () => {
    publish.mutate(
      { id: listing.id, body: chosen ? { pickup_contact_id: chosen as ContactId } : undefined },
      { onSuccess: () => toast.success("Đã gửi sản phẩm đi kiểm duyệt.") },
    );
  };

  const handleUnpublish = () => {
    if (!confirm("Ẩn sản phẩm này khỏi trang bán?")) return;
    unpublish.mutate(listing.id, { onSuccess: () => toast.success("Đã ẩn sản phẩm.") });
  };

  return (
    <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-sm p-6 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-headline font-bold text-lg text-primary">Trạng thái</h2>
        <span
          className={`px-3 py-1 text-[11px] font-semibold rounded-full ${STATUS_STYLES[listing.status]}`}
        >
          {LISTING_STATUS_VI[listing.status]}
        </span>
      </div>

      {listing.taken_down_at && (
        <div className="rounded-xl bg-error/10 text-error p-4 font-body-sm">
          <strong className="block mb-1">Sản phẩm đã bị gỡ bởi kiểm duyệt viên.</strong>
          {listing.takedown_reason || "Không có lý do được gửi kèm."}
        </div>
      )}

      {listing.pending_edit && (
        <div className="rounded-xl bg-primary-container/40 text-on-surface p-4 font-body-sm">
          Bạn có một bản chỉnh sửa đang chờ kiểm duyệt. Người mua vẫn thấy bản đang bán cho tới khi
          bản mới được duyệt.
        </div>
      )}

      {canPublish(listing.status) && (
        <div className="space-y-3">
          <label
            htmlFor="pickup-contact"
            className="block font-label-sm font-semibold text-on-surface"
          >
            Địa chỉ lấy hàng
          </label>
          {contacts.length === 0 ? (
            <p className="font-body-sm text-on-surface-variant bg-surface-container-low rounded-lg p-3">
              Bạn chưa có địa chỉ nào. Thêm một địa chỉ ở Sổ địa chỉ trước khi đăng bán.
            </p>
          ) : (
            <select
              id="pickup-contact"
              value={chosen}
              onChange={(event) => setPickupId(event.target.value)}
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
          <p className="text-[11px] text-on-surface-variant">
            Đây cũng là vị trí người mua nhìn thấy trên tin đăng.
          </p>
          <Button
            fullWidth
            disabled={publish.isPending || contacts.length === 0}
            onClick={handlePublish}
          >
            {publish.isPending ? "Đang gửi..." : "Đăng bán"}
          </Button>
        </div>
      )}

      {canUnpublish(listing.status) && (
        <Button
          fullWidth
          variant="outline"
          disabled={unpublish.isPending}
          onClick={handleUnpublish}
        >
          {unpublish.isPending ? "Đang ẩn..." : "Ẩn khỏi trang bán"}
        </Button>
      )}

      {listing.status === "pending" && (
        <p className="font-body-sm text-on-surface-variant">
          Sản phẩm đang chờ kiểm duyệt. Bạn sẽ nhận được thông báo khi có kết quả.
        </p>
      )}
    </section>
  );
}
