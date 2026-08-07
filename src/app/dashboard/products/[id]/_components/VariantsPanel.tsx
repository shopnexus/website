"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import type { ListingDetail } from "@/api/generated/types.gen";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { parseAmount } from "@/lib/money";
import { useAddVariant, useUpdateListing } from "@/hooks/api/useSellerListings";
import VariantRow from "./VariantRow";

const field =
  "w-full px-3 py-2.5 bg-surface-container-lowest rounded-lg border border-outline focus:border-primary outline-none transition-colors text-body-md tabular-nums";

/**
 * The rows a buyer actually buys.
 *
 * Deleting is offered only while more than one remains: a listing with no variant has no
 * price, and the server refuses it — so the button is absent rather than present and
 * doomed. Un-featuring goes through the listing rather than the variant, because
 * `is_featured: false` is documented as ignored and `clear_featured_variant_id` is the one
 * way to spell it.
 */
export default function VariantsPanel({ listing }: { listing: ListingDetail }) {
  const addVariant = useAddVariant();
  const updateListing = useUpdateListing();

  const [isFormOpen, setFormOpen] = useState(false);
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [weightG, setWeightG] = useState(0);

  const clearFeatured = () => {
    updateListing.mutate(
      { id: listing.id, body: { clear_featured_variant_id: true } },
      { onSuccess: () => toast.success("Thẻ sản phẩm sẽ hiển thị phiên bản rẻ nhất.") },
    );
  };

  const handleAdd = (event: React.FormEvent) => {
    event.preventDefault();
    addVariant.mutate(
      {
        id: listing.id,
        body: {
          attributes: {},
          package_details: weightG > 0 ? { weight_g: weightG } : {},
          price,
          quantity,
        },
      },
      {
        onSuccess: () => {
          toast.success("Đã thêm phiên bản.");
          setPrice(0);
          setQuantity(1);
          setWeightG(0);
          setFormOpen(false);
        },
      },
    );
  };

  return (
    <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-outline-variant/40 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-headline font-bold text-lg text-primary">Phiên bản & tồn kho</h2>
          <p className="font-body-sm text-on-surface-variant mt-1 max-w-lg">
            Giá, số lượng và khối lượng nằm ở đây — mỗi phiên bản là một thứ người mua có thể đặt.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setFormOpen(true)}
          icon={<span className="material-symbols-outlined text-[18px]">add</span>}
        >
          Thêm
        </Button>
      </div>

      <ul className="divide-y divide-outline-variant/30">
        {listing.variants.map((variant) => (
          <VariantRow
            key={variant.id}
            variant={variant}
            currency={listing.currency}
            canDelete={listing.variants.length > 1}
            onClearFeatured={clearFeatured}
          />
        ))}
      </ul>

      <Modal open={isFormOpen} title="Thêm phiên bản" onClose={() => setFormOpen(false)}>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label htmlFor="new-price" className="block font-label-sm font-semibold text-on-surface mb-1.5">
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
            <label
              htmlFor="new-quantity"
              className="block font-label-sm font-semibold text-on-surface mb-1.5"
            >
              Số lượng
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
            <label
              htmlFor="new-weight"
              className="block font-label-sm font-semibold text-on-surface mb-1.5"
            >
              Khối lượng (gram)
            </label>
            <input
              id="new-weight"
              inputMode="numeric"
              value={weightG}
              onChange={(event) => setWeightG(parseAmount(event.target.value))}
              className={field}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)} fullWidth>
              Hủy
            </Button>
            <Button type="submit" disabled={price <= 0 || addVariant.isPending} fullWidth>
              {addVariant.isPending ? "Đang thêm..." : "Thêm phiên bản"}
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
