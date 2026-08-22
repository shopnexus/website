"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import QuantitySelector from "@/components/ui/QuantitySelector";
import { formatMoney } from "@/lib/money";
import { listingIsLive } from "@/lib/listing-state";
import type { ListingDetail, Variant } from "@/api/generated/types.gen";
import type { PurchaseActions } from "../_hooks/usePurchaseActions";
import { stockNote } from "../_lib/facts";
import VariantPicker from "./VariantPicker";

/**
 * The offer: what it costs, which one, how many are left, and the buttons.
 *
 * A column of its own on a wide screen, and it sticks. Before this it was the top of a 640px
 * column that had nothing else in it, so the buttons stretched to a quarter of the page each
 * and the whole card floated in white space; it also scrolled away, which is why the page
 * needed a fixed bar at the bottom to put the same two buttons back. At 336px the controls
 * are the size of controls, and the bar is only needed on a phone.
 *
 * "Mua ngay" is stacked above "Thêm vào giỏ" rather than beside it. Two buttons of equal
 * width side by side are two equal choices, and they are not: one is the action this page
 * exists for.
 */
export default function BuyPanel({
  product,
  selectedVariant,
  selectedAttributes,
  onSelectAttribute,
  actions,
}: {
  product: ListingDetail;
  selectedVariant: Variant;
  selectedAttributes: Record<string, string>;
  onSelectAttribute: (key: string, value: string) => void;
  actions: PurchaseActions;
}) {
  const [quantity, setQuantity] = useState(1);
  const available = selectedVariant.stock.available;
  const stock = stockNote(available);
  const live = listingIsLive(product);

  return (
    <section
      aria-label="Giá và đặt mua"
      className="rounded-2xl border border-outline-variant bg-surface p-4"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="text-[30px] font-extrabold leading-none tracking-tight tabular-nums text-primary">
          {formatMoney(selectedVariant.price, product.currency)}
        </span>
        {actions.isNegotiable && (
          <Badge variant="surface" className="border border-primary text-primary">
            Thương lượng được
          </Badge>
        )}
      </div>

      <div className="mt-2.5 flex items-center gap-1.5 font-body-sm">
        <span
          className={[
            "material-symbols-outlined text-[17px]",
            stock.scarce ? "text-error" : "text-primary",
          ].join(" ")}
          style={{ fontVariationSettings: "'FILL' 1" }}
          aria-hidden="true"
        >
          {available > 0 ? "inventory_2" : "remove_shopping_cart"}
        </span>
        <span className={stock.scarce ? "font-semibold text-error" : "text-on-surface-variant"}>
          {stock.text}
        </span>
        {selectedVariant.stock.sold > 0 && (
          <>
            <span className="text-on-surface-variant" aria-hidden="true">
              ·
            </span>
            <span className="text-on-surface-variant">đã bán {selectedVariant.stock.sold}</span>
          </>
        )}
      </div>

      {product.variants.length > 1 && (
        <div className="mt-4 border-t border-outline-variant pt-4">
          <VariantPicker
            variants={product.variants}
            selected={selectedVariant}
            selectedAttributes={selectedAttributes}
            onSelect={onSelectAttribute}
          />
        </div>
      )}

      {live && !actions.isOwn && (
        <>
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="font-label-sm uppercase tracking-wide text-on-surface-variant">
              Số lượng
            </span>
            <QuantitySelector
              value={quantity}
              onChange={setQuantity}
              min={1}
              max={Math.max(1, available)}
            />
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <Button
              variant="primary"
              className="h-11 w-full rounded-xl font-bold"
              onClick={actions.buyNow}
              disabled={actions.isBuying || actions.isOutOfStock}
            >
              {actions.isOutOfStock
                ? "Hết hàng"
                : actions.isBuying
                  ? "Đang xử lý..."
                  : "Mua ngay"}
            </Button>
            <Button
              variant="secondary"
              className="h-11 w-full rounded-xl"
              onClick={() => actions.addToCart(quantity)}
              disabled={actions.isOutOfStock}
              icon={
                <span className="material-symbols-outlined text-[19px]">add_shopping_cart</span>
              }
            >
              Thêm vào giỏ
            </Button>

            {actions.isNegotiable && !actions.isOutOfStock && (
              <button
                type="button"
                onClick={actions.negotiate}
                className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-outline-variant font-label-md text-on-surface transition-colors hover:border-primary hover:text-primary"
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  handshake
                </span>
                Đề nghị mức giá của bạn
              </button>
            )}
          </div>
        </>
      )}

      {!live && !actions.isOwn && (
        // Staff reading a listing that is down. There is nothing to buy — the server refuses a
        // cart line, a session and an offer alike — so the panel says so rather than laying out
        // three buttons that end in a 409.
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-surface-container-low p-3 font-label-md text-on-surface-variant">
          <span className="material-symbols-outlined text-[19px]" aria-hidden="true">
            visibility_off
          </span>
          Tin đăng này không còn hiển thị công khai — không thể mua.
        </p>
      )}

      {actions.isOwn && (
        // Nobody buys their own tin — the server refuses the draft, the cart line and the
        // offer alike — so this is the one thing a seller can do from their own product page.
        <div className="mt-4 flex flex-col gap-2.5 rounded-xl bg-surface-container-low p-3">
          <span className="flex items-center gap-2 font-label-md text-on-surface-variant">
            <span className="material-symbols-outlined text-[19px]" aria-hidden="true">
              storefront
            </span>
            Đây là tin đăng của bạn
          </span>
          <Link href={`/account/products/${product.id}`}>
            <Button variant="primary" className="h-10 w-full rounded-xl">
              Chỉnh sửa tin
            </Button>
          </Link>
        </div>
      )}

      <p className="mt-4 flex items-start gap-2 border-t border-outline-variant pt-3 font-body-sm text-on-surface-variant">
        <span
          className="material-symbols-outlined shrink-0 text-[18px] text-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
          aria-hidden="true"
        >
          shield
        </span>
        Tiền được giữ tới khi bạn nhận hàng — hoàn 100% nếu không đúng mô tả.
      </p>
    </section>
  );
}
