"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import type { CurrencyCode, Variant } from "@/api/generated/types.gen";
import Button from "@/components/ui/Button";
import { parseAmount } from "@/lib/money";
import { useDeleteVariant, useUpdateVariant } from "@/hooks/api/useSellerListings";
import { attributeSummary, pairsToAttributes } from "@/lib/variant-attributes";
import { stockFloor, variantChanged, variantDraftFrom } from "../_lib/editor.logic";
import type { VariantDraft } from "../types";
import AttributeEditor from "./AttributeEditor";

const field =
  "w-full px-3 py-2 bg-surface-container-lowest rounded-lg border border-outline focus:border-primary outline-none transition-colors text-body-md tabular-nums";
const labelCls = "block text-label-sm text-on-surface-variant mb-1.5";

/**
 * One purchasable row: what it is called, its price, what is on the shelf, how heavy it is.
 *
 * Stock is a total, never a delta — the API takes "the new total on hand" — and it cannot go
 * below what is already reserved or sold, so the floor is stated beside the input.
 */
export default function VariantRow({
  variant,
  currency,
  canDelete,
  showFeatured,
  isFeaturedChoice,
  onFeature,
  featuredGroupName,
}: {
  variant: Variant;
  currency: CurrencyCode;
  canDelete: boolean;
  /** Only meaningful once there is more than one row to choose between. */
  showFeatured: boolean;
  isFeaturedChoice: boolean;
  onFeature: () => void;
  featuredGroupName: string;
}) {
  const updateVariant = useUpdateVariant();
  const deleteVariant = useDeleteVariant();

  const [draft, setDraft] = useState<VariantDraft>(() => variantDraftFrom(variant));
  const [seenAt, setSeenAt] = useState(variant.created_at + variant.price + variant.stock.quantity);

  // Reseed when the server's copy moves under us — a stock change from a completed sale, or
  // the save that just landed — but never while the seller is mid-edit on an untouched row.
  const signature = variant.created_at + variant.price + variant.stock.quantity;
  if (signature !== seenAt && !variantChanged(draft, variant)) {
    setSeenAt(signature);
    setDraft(variantDraftFrom(variant));
  }

  const floor = stockFloor(variant);
  const dirty = variantChanged(draft, variant);
  const belowFloor = draft.quantity < floor;
  const noWeight = draft.weightG <= 0;
  const name = attributeSummary(variant.attributes);

  const handleSave = () => {
    updateVariant.mutate(
      {
        id: variant.id,
        body: {
          price: draft.price,
          quantity: draft.quantity,
          package_details: { weight_g: draft.weightG },
          attributes: pairsToAttributes(draft.attributes),
        },
      },
      { onSuccess: () => toast.success("Đã lưu.") },
    );
  };

  const handleDelete = () => {
    if (!confirm(`Xóa phiên bản ${name || "này"}?`)) return;
    deleteVariant.mutate(variant.id, { onSuccess: () => toast.success("Đã xóa phiên bản.") });
  };

  return (
    <li className="p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {showFeatured && (
            <label className="flex items-center gap-2 cursor-pointer pt-0.5 shrink-0">
              <input
                type="radio"
                name={featuredGroupName}
                checked={isFeaturedChoice}
                onChange={onFeature}
                disabled={updateVariant.isPending}
                className="size-4 accent-primary cursor-pointer"
              />
              <span className="sr-only">Hiện phiên bản {name || "này"} trên thẻ sản phẩm</span>
            </label>
          )}
          <p className="text-title-sm text-on-surface min-w-0 break-words">
            {name || <span className="text-on-surface-variant">Chưa đặt tên</span>}
          </p>
        </div>

        {canDelete && (
          <button
            type="button"
            aria-label={`Xóa phiên bản ${name || "này"}`}
            disabled={deleteVariant.isPending}
            onClick={handleDelete}
            className="grid size-9 shrink-0 place-items-center rounded-lg text-on-surface-variant hover:bg-error-container/40 hover:text-error transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              delete
            </span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor={`price-${variant.id}`} className={labelCls}>
            Giá bán ({currency === "VND" ? "₫" : currency})
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
          <label htmlFor={`stock-${variant.id}`} className={labelCls}>
            Số lượng đang có
          </label>
          <input
            id={`stock-${variant.id}`}
            inputMode="numeric"
            value={draft.quantity}
            onChange={(event) => setDraft({ ...draft, quantity: parseAmount(event.target.value) })}
            className={field}
          />
          <p
            className={`text-body-xs mt-1.5 ${belowFloor ? "text-error" : "text-on-surface-variant"}`}
          >
            Còn bán {variant.stock.available} · đang giữ cho đơn chưa trả {variant.stock.reserved} ·
            đã bán {variant.stock.sold}
            {floor > 0 && ` · không đặt được dưới ${floor}`}
          </p>
        </div>

        <div>
          <label htmlFor={`weight-${variant.id}`} className={labelCls}>
            Khối lượng (gram)
          </label>
          <input
            id={`weight-${variant.id}`}
            inputMode="numeric"
            value={draft.weightG === 0 ? "" : draft.weightG}
            placeholder="500"
            onChange={(event) => setDraft({ ...draft, weightG: parseAmount(event.target.value) })}
            className={field}
          />
          <p className={`text-body-xs mt-1.5 ${noWeight ? "text-error" : "text-on-surface-variant"}`}>
            {noWeight
              ? "Chưa có khối lượng thì không báo được phí giao hàng cho người mua."
              : "Dùng để tính phí giao hàng."}
          </p>
        </div>
      </div>

      <details className="group">
        <summary className="text-label-md text-primary cursor-pointer inline-flex items-center gap-1 list-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
          <span
            className="material-symbols-outlined text-[16px] transition-transform group-open:rotate-90"
            aria-hidden="true"
          >
            chevron_right
          </span>
          Thuộc tính phân biệt
        </summary>
        <div className="pt-3 space-y-2">
          <p className="text-body-xs text-on-surface-variant">
            Đây là tên của phiên bản, ví dụ Màu sắc · Đen. Hai phiên bản không được trùng bộ
            thuộc tính.
          </p>
          <AttributeEditor
            pairs={draft.attributes}
            onChange={(attributes) => setDraft({ ...draft, attributes })}
            idPrefix={`attr-${variant.id}`}
          />
        </div>
      </details>

      {dirty && (
        <div className="flex gap-2">
          <Button
            size="sm"
            disabled={updateVariant.isPending || belowFloor || draft.price <= 0 || noWeight}
            onClick={handleSave}
          >
            {updateVariant.isPending ? "Đang lưu..." : "Lưu"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setDraft(variantDraftFrom(variant))}>
            Hoàn tác
          </Button>
        </div>
      )}
    </li>
  );
}
