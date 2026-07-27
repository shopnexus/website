"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import QuantitySelector from "@/components/ui/QuantitySelector";
import { CART_GROUPS, formatPrice } from "@/lib/mock-data";

export default function CartPage(){
  const [quantities, setQuantities] = useState<Record<string, number>>(
    CART_GROUPS.flatMap((g) => g.items).reduce((acc, item) => ({ ...acc, [item.id]: item.quantity }), {})
  );

  const handleQuantityChange = (id: string, value: number) => {
    setQuantities((prev) => ({ ...prev, [id]: value }));
  };

  const calculateSubtotal = () => {
    return CART_GROUPS.reduce((total, group) => {
      return (
        total +
        group.items.reduce((groupTotal, item) => {
          return groupTotal + item.product.price * (quantities[item.id] || 1);
        }, 0)
      );
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shippingFee = 35000;
  const total = subtotal + shippingFee;

  return (
    <div className="bg-surface-container-lowest min-h-screen py-8">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        <h1 className="font-headline-md font-bold mb-6">Giỏ hàng của bạn</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Cart Items List ── */}
          <div className="flex-1 flex flex-col gap-6">
            {CART_GROUPS.map((group, gIdx) => (
              <div key={gIdx} className="bg-surface rounded-2xl border border-outline-variant overflow-hidden shadow-sm">
                {/* Shop Header */}
                <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="w-5 h-5 rounded text-primary border-outline-variant focus:ring-primary focus:ring-offset-background" defaultChecked />
                    <span className="font-headline-sm text-base font-bold text-on-surface flex items-center gap-1">
                      {group.seller.name}
                      {group.seller.isVerified && (
                        <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          verified
                        </span>
                      )}
                    </span>
                  </div>
                  <Link href={`/shop/${group.seller.id}`} className="text-primary font-label-md hover:underline flex items-center gap-1">
                    Xem Shop
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </Link>
                </div>

                {/* Items */}
                <div className="flex flex-col">
                  {group.items.map((item, iIdx) => (
                    <div key={item.id} className={["p-6 flex flex-col sm:flex-row gap-4", iIdx > 0 ? "border-t border-outline-variant" : ""].join(" ")}>
                      <div className="flex items-start gap-4">
                        <input type="checkbox" className="w-5 h-5 mt-4 rounded text-primary border-outline-variant focus:ring-primary focus:ring-offset-background" defaultChecked />
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-outline-variant shrink-0">
                          <Image src={item.product.images[0]} alt={item.product.title} fill className="object-cover" />
                        </div>
                      </div>
                      
                      <div className="flex-1 flex flex-col gap-2 min-w-0">
                        <Link href={`/product/${item.product.id}`} className="font-body-md text-on-surface hover:text-primary transition-colors line-clamp-2">
                          {item.product.title}
                        </Link>
                        <div className="text-body-sm text-on-surface-variant p-2 bg-surface-container-low rounded-lg inline-block self-start">
                          Phân loại: {item.variant}
                        </div>
                      </div>
                      
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-4 mt-2 sm:mt-0 shrink-0">
                        <div className="font-price-lg text-primary text-lg">
                          {formatPrice(item.product.price)}
                        </div>
                        <QuantitySelector
                          value={quantities[item.id] || 1}
                          onChange={(val) => handleQuantityChange(item.id, val)}
                        />
                        <button className="text-error hover:opacity-80 transition-opacity p-2 -mr-2">
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Shop Footer / Voucher */}
                <div className="px-6 py-4 border-t border-outline-variant border-dashed flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary">local_offer</span>
                  <input type="text" placeholder="Nhập mã giảm giá của Shop" className="flex-1 bg-transparent text-body-sm outline-none placeholder:text-outline-variant" />
                  <span className="font-label-md text-primary cursor-pointer hover:underline">Lưu</span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Order Summary ── */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="bg-surface rounded-2xl border border-outline-variant p-6 sticky top-24 shadow-sm">
              <h2 className="font-headline-sm font-bold mb-6">Tóm tắt đơn hàng</h2>
              
              <div className="flex flex-col gap-4 text-body-md text-on-surface-variant border-b border-outline-variant pb-6 mb-6">
                <div className="flex justify-between">
                  <span>Tạm tính (3 sản phẩm)</span>
                  <span className="text-on-surface font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển dự kiến</span>
                  <span className="text-on-surface font-medium">{formatPrice(shippingFee)}</span>
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
      </div>
    </div>
  );
}
