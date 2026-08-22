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
 * The offer: what it costs, which one, how many are left, and the two buttons.
 *
 * This is the change the page most needed. The price used to be the *last* card in the right
 * column — under the description, the details and the classification picker — so a shopper
 * scrolled past everything the listing says to find out what it costs, and the variant they
 * picked changed a number that was no longer on screen. Everything that decides a purchase is
 * now one block, and it is the first thing beside the photos.
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
    <section aria-label="Giá và đặt mua">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
        <span className="font-display-lg text-[36px] font-bold leading-none tracking-tight tabular-nums text-primary">
          {formatMoney(selectedVariant.price, product.currency)}
        </span>
        {actions.isNegotiable && (
          <Badge variant="surface" className="self-center border border-primary text-primary">
            Có thể thương lượng
          </Badge>
        )}
      </div>

      <div className="mt-3 flex items-center gap-1.5 font-body-sm">
        <span
          className={[
            "material-symbols-outlined text-[18px]",
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
            <span className="text-on-surface-variant">
              đã bán {selectedVariant.stock.sold} phân loại này
            </span>
          </>
        )}
      </div>

      {product.variants.length > 1 && (
        <div className="mt-5">
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
          <div className="mt-5 flex items-center gap-4">
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

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button
              variant="secondary"
              size="lg"
              className="h-12 flex-1 rounded-xl"
              onClick={() => actions.addToCart(quantity)}
              disabled={actions.isOutOfStock}
              icon={<span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>}
            >
              Thêm vào giỏ
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="h-12 flex-1 rounded-xl"
              onClick={actions.buyNow}
              disabled={actions.isBuying || actions.isOutOfStock}
            >
              {actions.isOutOfStock
                ? "Hết hàng"
                : actions.isBuying
                  ? "Đang xử lý..."
                  : "Mua ngay"}
            </Button>
          </div>

          {actions.isNegotiable && !actions.isOutOfStock && (
            <button
              type="button"
              onClick={actions.negotiate}
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-outline-variant py-2.5 font-label-md text-on-surface transition-colors hover:border-primary hover:text-primary"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                handshake
              </span>
              Đề nghị mức giá của bạn
            </button>
          )}
        </>
      )}

      {!live && !actions.isOwn && (
        // Staff reading a listing that is down. There is nothing to buy — the server refuses a
        // cart line, a session and an offer alike — so the panel says so rather than laying out
        // three buttons that end in a 409.
        <p className="mt-5 flex items-center gap-2 rounded-2xl bg-surface-container-low p-4 font-label-md text-on-surface-variant">
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            visibility_off
          </span>
          Tin đăng này không còn hiển thị công khai — không thể mua.
        </p>
      )}

      {actions.isOwn && (
        // Nobody buys their own tin — the server refuses the draft, the cart line and the
        // offer alike — so this is the one thing a seller can do from their own product page.
        <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-surface-container-low p-4">
          <span className="flex items-center gap-2 font-label-md text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              storefront
            </span>
            Đây là tin đăng của bạn
          </span>
          <Link href={`/account/products/${product.id}`}>
            <Button variant="primary" className="h-11 w-full rounded-xl">
              Chỉnh sửa tin
            </Button>
          </Link>
        </div>
      )}

      <div className="mt-5 flex items-start gap-2 font-body-sm text-on-surface-variant">
        <span
          className="material-symbols-outlined shrink-0 text-[20px] text-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
          aria-hidden="true"
        >
          shield
        </span>
        Tiền được giữ cho tới khi bạn nhận hàng — hoàn 100% nếu hàng không đúng mô tả.
      </div>
    </section>
  );
}
