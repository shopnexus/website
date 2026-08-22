"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import type { ListingDetail } from "@/api/generated/types.gen";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { parseAmount } from "@/lib/money";
import { useAddVariant, useUpdateVariant } from "@/hooks/api/useSellerListings";
import { blankPair, pairsToAttributes, type AttributePair } from "@/lib/variant-attributes";
import AttributeEditor from "./AttributeEditor";
import VariantRow from "./VariantRow";

const field =
  "w-full px-3 py-2.5 bg-surface-container-lowest rounded-lg border border-outline focus:border-primary outline-none transition-colors text-body-md tabular-nums";

/**
 * The rows a buyer actually buys.
 *
 * One variant is the common case, so it is presented as plain price-and-stock with no
 * mention of variants; the vocabulary only appears once there is a second row to tell apart.
 *
 * Deleting is offered only while more than one remains: a listing with no variant has no
 * price and the server refuses it. Exactly one variant is always featured — the flag moves
 * between rows and can never be dropped, so the radio has no "none" option.
 */
export default function VariantsPanel({ listing }: { listing: ListingDetail }) {
  const addVariant = useAddVariant();
  const updateVariant = useUpdateVariant();

  const [isFormOpen, setFormOpen] = useState(false);
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [weightG, setWeightG] = useState(0);
  const [attributes, setAttributes] = useState<AttributePair[]>(() => [blankPair()]);

  const many = listing.variants.length > 1;
  // Always exactly one: the server refuses a listing without a featured variant.
  const featuredId = listing.variants.find((variant) => variant.is_featured)?.id ?? null;

  const feature = (id: string) => {
    updateVariant.mutate(
      { id, body: { is_featured: true } },
      { onSuccess: () => toast.success("Đã đổi phiên bản hiện trên thẻ.") },
    );
  };

  const closeForm = () => {
    setFormOpen(false);
    setPrice(0);
    setQuantity(1);
    setWeightG(0);
    setAttributes([blankPair()]);
  };

  const handleAdd = (event: React.FormEvent) => {
    event.preventDefault();
    addVariant.mutate(
      {
        id: listing.id,
        body: {
          attributes: pairsToAttributes(attributes),
          package_details: { weight_g: weightG },
          price,
          quantity,
        },
      },
      {
        onSuccess: () => {
          toast.success("Đã thêm phiên bản.");
          closeForm();
        },
      },
    );
  };

  // A second variant needs attributes to tell it from the first: the server's uniqueness
  // index is over the whole set, so two unnamed rows are refused.
  const namedEnough = Object.keys(pairsToAttributes(attributes)).length > 0;

  return (
    <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest overflow-hidden">
      <div className="p-5 md:p-6 border-b border-outline-variant flex items-start justify-between gap-4">
        <div>
          <h2 className="text-title-md text-on-surface">
            {many ? `Phiên bản (${listing.variants.length})` : "Giá & tồn kho"}
          </h2>
          <p className="text-body-sm text-on-surface-variant mt-1 max-w-lg">
            {many
              ? "Mỗi phiên bản là một lựa chọn người mua đặt riêng, có giá và tồn kho riêng."
              : "Giá bán, số lượng đang có và khối lượng kiện hàng."}
          </p>
        </div>
        {many && (
          <Button
            size="sm"
            onClick={() => setFormOpen(true)}
            icon={<span className="material-symbols-outlined text-[18px]">add</span>}
          >
            Thêm
          </Button>
        )}
      </div>

      <ul className="divide-y divide-outline-variant">
        {listing.variants.map((variant) => (
          <VariantRow
            key={variant.id}
            variant={variant}
            currency={listing.currency}
            canDelete={many}
            showFeatured={many}
            isFeaturedChoice={featuredId === variant.id}
            onFeature={() => feature(variant.id)}
            featuredGroupName={`featured-${listing.id}`}
          />
        ))}
      </ul>

      {!many && (
        <div className="p-5 md:p-6 border-t border-outline-variant flex items-center justify-between gap-4 flex-wrap">
          <p className="text-body-sm text-on-surface-variant">
            Bán nhiều màu, kích cỡ hay dung lượng?
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setFormOpen(true)}
            icon={<span className="material-symbols-outlined text-[18px]">add</span>}
          >
            Thêm phiên bản
          </Button>
        </div>
      )}

      <Modal open={isFormOpen} title="Thêm phiên bản" onClose={closeForm}>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <p className="text-label-sm text-on-surface mb-1.5">Thuộc tính phân biệt</p>
            <p className="text-body-xs text-on-surface-variant mb-2">
              Tên của phiên bản này, ví dụ Màu sắc · Đen. Không được trùng với phiên bản đã có.
            </p>
            <AttributeEditor pairs={attributes} onChange={setAttributes} idPrefix="new-attr" />
          </div>

          <div>
            <label htmlFor="new-price" className="block text-label-sm text-on-surface mb-1.5">
              Giá bán
            </label>
            <input
              id="new-price"
              inputMode="numeric"
              value={price === 0 ? "" : new Intl.NumberFormat("vi-VN").format(price)}
              onChange={(event) => setPrice(parseAmount(event.target.value))}
              className={field}
            />
          </div>

          <div>
            <label htmlFor="new-quantity" className="block text-label-sm text-on-surface mb-1.5">
              Số lượng đang có
            </label>
            <input
              id="new-quantity"
              inputMode="numeric"
              value={quantity}
              onChange={(event) => setQuantity(parseAmount(event.target.value))}
              className={field}
            />
          </div>

          <div>
            <label htmlFor="new-weight" className="block text-label-sm text-on-surface mb-1.5">
              Khối lượng (gram)
            </label>
            <input
              id="new-weight"
              inputMode="numeric"
              value={weightG === 0 ? "" : weightG}
              placeholder="500"
              onChange={(event) => setWeightG(parseAmount(event.target.value))}
              className={field}
            />
            <p className="text-body-xs text-on-surface-variant mt-1.5">
              Chưa có khối lượng thì không báo được phí giao hàng cho người mua.
            </p>
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={closeForm} fullWidth>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={price <= 0 || weightG <= 0 || !namedEnough || addVariant.isPending}
              fullWidth
            >
              {addVariant.isPending ? "Đang thêm..." : "Thêm phiên bản"}
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
