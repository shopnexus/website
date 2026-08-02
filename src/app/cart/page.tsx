"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import QuantitySelector from "@/components/ui/QuantitySelector";
import { useCart, type ResolvedCartItem } from "@/hooks/api/useCart";
import type { AccountSummary } from "@/api/generated/types.gen";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

/** A flat placeholder until checkout quotes the real thing per parcel and address. */
const ESTIMATED_SHIPPING_FEE = 35000;

export default function CartPage() {
  const { items, subtotal, isLoading, updateQuantity, removeItem } = useCart();

  const groupedItems = useMemo(() => {
    const groups = new Map<string, { seller: AccountSummary; items: ResolvedCartItem[] }>();
    for (const item of items) {
      const seller = item.listing.seller;
      const group = groups.get(seller.id) ?? { seller, items: [] };
      group.items.push(item);
      groups.set(seller.id, group);
    }
    return [...groups.values()];
  }, [items]);

  const total = subtotal + (items.length > 0 ? ESTIMATED_SHIPPING_FEE : 0);

  if (isLoading && items.length === 0) {
    return (
      <div className="bg-surface-container-lowest min-h-screen py-8 flex justify-center">
        Đang tải giỏ hàng...
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest min-h-screen py-8">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        <h1 className="font-headline-md font-bold mb-6">Giỏ hàng của bạn</h1>

        {items.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant">
            Giỏ hàng của bạn đang trống. 
            <div className="mt-4">
              <Link href="/">
                <Button variant="primary">Tiếp tục mua sắm</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 flex flex-col gap-6">
              {groupedItems.map((group) => (
                <div key={group.seller.id} className="bg-surface rounded-2xl border border-outline-variant overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="w-5 h-5 rounded text-primary border-outline-variant focus:ring-primary focus:ring-offset-background" defaultChecked />
                      <span className="font-headline-sm text-base font-bold text-on-surface flex items-center gap-1">
                        {group.seller.name}
                      </span>
                    </div>
                    <Link href={`/shop/${group.seller.id}`} className="text-primary font-label-md hover:underline flex items-center gap-1">
                      Xem Shop
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </Link>
                  </div>

                  <div className="flex flex-col">
                    {group.items.map(({ cartItemId, quantity, listing, variant }, iIdx) => {
                      const image = variant?.images[0] ?? listing.images[0];
                      return (
                      <div key={cartItemId} className={["p-6 flex flex-col sm:flex-row gap-4", iIdx > 0 ? "border-t border-outline-variant" : ""].join(" ")}>
                        <div className="flex items-start gap-4">
                          <input type="checkbox" className="w-5 h-5 mt-4 rounded text-primary border-outline-variant focus:ring-primary focus:ring-offset-background" defaultChecked />
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-outline-variant shrink-0">
                            {image?.url ? (
                              <Image src={image.url} alt={listing.name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full bg-surface-container flex items-center justify-center">N/A</div>
                            )}
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col gap-2 min-w-0">
                          <Link href={`/product/${listing.id}`} className="font-body-md text-on-surface hover:text-primary transition-colors line-clamp-2">
                            {listing.name}
                          </Link>
                          {variant && Object.keys(variant.attributes).length > 0 && (
                            <div className="text-body-sm text-on-surface-variant p-2 bg-surface-container-low rounded-lg inline-block self-start">
                              Phân loại: {Object.values(variant.attributes).join(", ")}
                            </div>
                          )}
                          {!variant && (
                            // The variant is gone but the line survives: the shopper has to
                            // be told rather than shown a silent 0 ₫.
                            <div className="text-body-sm text-error">
                              Phiên bản này không còn được bán.
                            </div>
                          )}
                        </div>

                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-4 mt-2 sm:mt-0 shrink-0">
                            <div className="font-price-md text-primary mt-2">
                              {formatPrice(variant?.price ?? 0)}
                            </div>
                          <QuantitySelector
                            value={quantity}
                            onChange={(val) => updateQuantity(cartItemId, val)}
                          />
                          <button
                            onClick={() => removeItem(cartItemId)}
                            className="text-error hover:opacity-80 transition-opacity p-2 -mr-2"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </div>
                      );
                    })}
                  </div>

                  <div className="px-6 py-4 border-t border-outline-variant border-dashed flex items-center gap-4">
                    <span className="material-symbols-outlined text-primary">local_offer</span>
                    <input type="text" placeholder="Nhập mã giảm giá của Shop" className="flex-1 bg-transparent text-body-sm outline-none placeholder:text-outline-variant" />
                    <span className="font-label-md text-primary cursor-pointer hover:underline">Lưu</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="w-full lg:w-[380px] shrink-0">
              <div className="bg-surface rounded-2xl border border-outline-variant p-6 sticky top-24 shadow-sm">
                <h2 className="font-headline-sm font-bold mb-6">Tóm tắt đơn hàng</h2>
                
                <div className="flex flex-col gap-4 text-body-md text-on-surface-variant border-b border-outline-variant pb-6 mb-6">
                  <div className="flex justify-between">
                    <span>Tạm tính ({items.length} sản phẩm)</span>
                    <span className="text-on-surface font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí vận chuyển dự kiến</span>
                    <span className="text-on-surface font-medium">{formatPrice(ESTIMATED_SHIPPING_FEE)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mã giảm giá ShopNexus</span>
                    <Link href="#" className="text-primary hover:underline">Chọn mã</Link>
                  </div>
                </div>
                
                <div className="flex justify-between items-end mb-6">
                  <span className="font-label-md text-on-surface">Tổng cộng</span>
                  <span className="font-display-lg text-[28px] text-primary font-bold leading-none">
                    {formatPrice(total)}
                  </span>
                </div>
                
                <Link href="/checkout" className="block w-full">
                  <Button variant="primary" fullWidth size="lg">
                    Thanh toán
                  </Button>
                </Link>
                
                <div className="mt-6 p-4 bg-surface-container-low rounded-xl flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">verified_user</span>
                  <div>
                    <h4 className="font-label-md text-on-surface mb-1">Thanh toán an toàn</h4>
                    <p className="font-body-sm text-on-surface-variant">ShopNexus giữ tiền của bạn cho đến khi bạn xác nhận đã nhận hàng thành công.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
