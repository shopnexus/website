"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import type { CurrencyCode, Variant } from "@/api/generated/types.gen";
import Button from "@/components/ui/Button";
import { formatMoney, parseAmount } from "@/lib/money";
import { useDeleteVariant, useUpdateVariant } from "@/hooks/api/useSellerListings";
import { stockFloor, variantChanged, variantDraftFrom } from "../_lib/editor.logic";
import type { VariantDraft } from "../types";

const field =
  "w-full px-3 py-2 bg-surface-container-lowest rounded-lg border border-outline focus:border-primary outline-none transition-colors text-body-md tabular-nums";

/**
 * One purchasable row: its price, what is on the shelf, and how heavy the parcel is.
 *
 * Stock is a total, never a delta — the API takes "the new total on hand" — and it cannot
 * go below what is already reserved or sold, so the floor is stated beside the input
 * rather than left for a 422 to explain.
 */
export default function VariantRow({
  variant,
  currency,
  canDelete,
  onClearFeatured,
}: {
  variant: Variant;
  currency: CurrencyCode;
  canDelete: boolean;
  onClearFeatured: () => void;
}) {
  const updateVariant = useUpdateVariant();
  const deleteVariant = useDeleteVariant();

  const [draft, setDraft] = useState<VariantDraft>(() => variantDraftFrom(variant));
  const [seenAt, setSeenAt] = useState(variant.created_at + variant.price + variant.stock.quantity);

  // Reseed when the server's copy moves under us — a stock change from a completed sale,
  // or the save that just landed — but never while the seller is mid-edit on an untouched
  // row, which is what the identity check below distinguishes.
  const signature = variant.created_at + variant.price + variant.stock.quantity;
  if (signature !== seenAt && !variantChanged(draft, variant)) {
    setSeenAt(signature);
    setDraft(variantDraftFrom(variant));
  }

  const floor = stockFloor(variant);
  const dirty = variantChanged(draft, variant);
  const belowFloor = draft.quantity < floor;

  const handleSave = () => {
    updateVariant.mutate(
      {
        id: variant.id,
        body: {
          price: draft.price,
          quantity: draft.quantity,
          package_details: draft.weightG > 0 ? { weight_g: draft.weightG } : {},
        },
      },
      { onSuccess: () => toast.success("Đã cập nhật phiên bản.") },
    );
  };

  const handleFeature = () => {
    if (variant.is_featured) {
      onClearFeatured();
      return;
    }
    updateVariant.mutate(
      { id: variant.id, body: { is_featured: true } },
      { onSuccess: () => toast.success("Phiên bản này sẽ hiển thị trên thẻ sản phẩm.") },
    );
  };

  const handleDelete = () => {
    if (!confirm("Xóa phiên bản này?")) return;
    deleteVariant.mutate(variant.id, { onSuccess: () => toast.success("Đã xóa phiên bản.") });
  };

  return (
    <li className="p-5 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="font-label-md font-semibold text-on-surface">
            {formatMoney(variant.price, currency)}
          </span>
          {variant.is_featured && (
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-primary-container text-on-primary-container uppercase tracking-wide">
              Hiển thị trên thẻ
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={updateVariant.isPending}
            onClick={handleFeature}
          >
            {variant.is_featured ? "Bỏ ghim" : "Ghim lên thẻ"}
          </Button>
          {canDelete && (
            <Button
              variant="outline"
              size="sm"
              className="text-error border-error hover:bg-error/10"
              disabled={deleteVariant.isPending}
              onClick={handleDelete}
            >
              Xóa
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor={`price-${variant.id}`}
            className="block font-label-sm text-on-surface-variant mb-1.5"
          >
            Giá bán
          </label>
          <input
            id={`price-${variant.id}`}
            inputMode="numeric"
            value={draft.price === 0 ? "" : new Intl.NumberFormat("vi-VN").format(draft.price)}
            onChange={(event) => setDraft({ ...draft, price: parseAmount(event.target.value) })}
            className={field}
          />
        </div>

        <div>
          <label
            htmlFor={`stock-${variant.id}`}
            className="block font-label-sm text-on-surface-variant mb-1.5"
          >
            Tồn kho
          </label>
          <input
            id={`stock-${variant.id}`}
            inputMode="numeric"
            value={draft.quantity}
            onChange={(event) => setDraft({ ...draft, quantity: parseAmount(event.target.value) })}
            className={field}
          />
          <p
            className={`text-[11px] mt-1.5 ${belowFloor ? "text-error" : "text-on-surface-variant"}`}
          >
            Còn bán {variant.stock.available} · giữ chỗ {variant.stock.reserved} · đã bán{" "}
            {variant.stock.sold}
            {floor > 0 && ` · không thể đặt dưới ${floor}`}
          </p>
        </div>

        <div>
          <label
            htmlFor={`weight-${variant.id}`}
            className="block font-label-sm text-on-surface-variant mb-1.5"
          >
            Khối lượng (gram)
          </label>
          <input
            id={`weight-${variant.id}`}
            inputMode="numeric"
            value={draft.weightG}
            onChange={(event) => setDraft({ ...draft, weightG: parseAmount(event.target.value) })}
            className={field}
          />
          <p className="text-[11px] text-on-surface-variant mt-1.5">
            Dùng để tính phí giao hàng.
          </p>
        </div>
      </div>

      {dirty && (
        <div className="flex gap-2">
          <Button
            size="sm"
            disabled={updateVariant.isPending || belowFloor || draft.price <= 0}
            onClick={handleSave}
          >
            {updateVariant.isPending ? "Đang lưu..." : "Lưu phiên bản"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setDraft(variantDraftFrom(variant))}>
            Hoàn tác
          </Button>
        </div>
      )}
    </li>
  );
}
