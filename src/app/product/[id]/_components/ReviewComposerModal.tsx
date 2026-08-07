"use client";

import { useState } from "react";
import Image from "next/image";
import Modal from "@/components/ui/Modal";
import StarPicker from "@/components/ui/StarPicker";
import type { ListingId, Order, OrderId } from "@/api/generated/types.gen";
import { MAX_ATTACHMENTS, MAX_BODY, useReviewComposer } from "../_hooks/useReviewComposer";

/**
 * Write a review of something you bought.
 *
 * The order is part of the form because it is part of the fact: one review per listing per
 * order, so buying twice earns a second review and the buyer has to say which purchase
 * they are talking about. With a single matching purchase there is nothing to choose and
 * the picker stays out of the way.
 */
export default function ReviewComposerModal({
  open,
  onClose,
  listingId,
  orders,
}: {
  open: boolean;
  onClose: () => void;
  listingId: ListingId;
  orders: Order[];
}) {
  const composer = useReviewComposer(listingId);
  const [orderId, setOrderId] = useState<OrderId | "">("");

  const chosen = orders.length === 1 ? orders[0].id : orderId;

  const close = () => {
    composer.reset();
    onClose();
  };

  return (
    <Modal open={open} title="Đánh giá sản phẩm" onClose={close}>
      <div className="flex flex-col gap-5 overflow-y-auto px-6 py-5">
        {orders.length > 1 && (
          <label className="flex flex-col gap-2">
            <span className="font-label-md text-on-surface">Đơn hàng</span>
            <select
              value={orderId}
              onChange={(event) => setOrderId(event.target.value as OrderId)}
              className="rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-sm text-on-surface outline-none focus:border-primary"
            >
              <option value="">Chọn đơn hàng bạn muốn đánh giá</option>
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  Mua ngày {new Date(order.created_at).toLocaleDateString("vi-VN")}
                </option>
              ))}
            </select>
          </label>
        )}

        <StarPicker value={composer.rating} onChange={composer.setRating} />

        <label className="flex flex-col gap-2">
          <span className="font-label-md text-on-surface">Cảm nhận của bạn</span>
          <textarea
            value={composer.body}
            onChange={(event) => composer.setBody(event.target.value.slice(0, MAX_BODY))}
            rows={5}
            placeholder="Hàng có đúng như mô tả không? Đóng gói thế nào? Điều gì người mua sau nên biết?"
            className="resize-y rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-sm text-on-surface outline-none focus:border-primary"
          />
          <span className="self-end font-label-sm text-on-surface-variant">
            {composer.body.length}/{MAX_BODY}
          </span>
        </label>

        <div className="flex flex-col gap-2">
          <span className="font-label-md text-on-surface">
            Ảnh thực tế ({composer.photos.length}/{MAX_ATTACHMENTS})
          </span>
          <div className="flex flex-wrap gap-2">
            {composer.photos.map((photo) => (
              <div
                key={photo.resourceId}
                className="relative h-20 w-20 overflow-hidden rounded-xl border border-outline-variant"
              >
                <Image src={photo.previewUrl} alt="" fill unoptimized className="object-cover" />
                <button
                  type="button"
                  onClick={() => composer.removePhoto(photo.resourceId)}
                  aria-label="Bỏ ảnh này"
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
                >
                  <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                    close
                  </span>
                </button>
              </div>
            ))}

            {composer.photos.length < MAX_ATTACHMENTS && (
              <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-outline-variant text-on-surface-variant transition-colors hover:border-primary hover:text-primary">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="sr-only"
                  disabled={composer.isUploading}
                  onChange={(event) => {
                    const files = Array.from(event.target.files ?? []);
                    event.target.value = "";
                    if (files.length > 0) void composer.addPhotos(files);
                  }}
                />
                <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
                  {composer.isUploading ? "progress_activity" : "add_a_photo"}
                </span>
                <span className="font-label-sm">{composer.isUploading ? "Đang tải" : "Thêm"}</span>
              </label>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2 border-t border-outline-variant px-6 py-4">
        <button
          type="button"
          onClick={close}
          className="rounded-full px-4 py-2 font-label-md text-on-surface-variant hover:text-on-surface"
        >
          Huỷ
        </button>
        <button
          type="button"
          disabled={!chosen || composer.rating < 1 || composer.isSending || composer.isUploading}
          onClick={() => chosen && composer.send(chosen, close)}
          className="rounded-full bg-primary px-6 py-2 font-label-md text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {composer.isSending ? "Đang gửi..." : "Gửi đánh giá"}
        </button>
      </div>
    </Modal>
  );
}
