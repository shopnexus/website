"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import StepIndicator from "@/components/ui/StepIndicator";
import { CART_GROUPS, formatPrice } from "@/lib/mock-data";

export default function CheckoutPage(){
  const router = useRouter();
  
  // Calculate totals from mock data
  const subtotal = CART_GROUPS.reduce((total, group) => {
    return total + group.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, 0);
  const shippingFee = 35000;
  const total = subtotal + shippingFee;

  const handlePlaceOrder = () => {
    router.push("/order/success");
  };

  return (
    <div className="bg-surface-container-lowest min-h-screen py-8 pb-24">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        
        {/* Step Indicator */}
        <div className="mb-8 hidden md:block">
           <StepIndicator 
             steps={["Giỏ hàng", "Thanh toán", "Xác nhận"]} 
             currentStep={1} 
           />
        </div>

        <h1 className="font-headline-md font-bold mb-6">Thanh toán</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Left Column: Forms ── */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Delivery Address */}
            <section className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0Ij48cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iNCIgZmlsbD0iIzAwNGU0NyIvPjxyZWN0IHg9IjIwIiB3aWR0aD0iMjAiIGhlaWdodD0iNCIgZmlsbD0iI2JhMWExYSIvPjwvc3ZnPg==')] bg-repeat-x"></div>
              
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-headline-sm font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  Địa chỉ nhận hàng
                </h2>
                <button className="text-primary font-label-md hover:underline">Thay đổi</button>
              </div>
              
              <div className="flex flex-col gap-1 text-body-md text-on-surface">
                <div className="font-bold">Nguyễn Văn An <span className="font-normal text-on-surface-variant mx-2">|</span> 0901234567</div>
                <div className="text-on-surface-variant">
                  Tòa nhà The Nexus, 3A-3B Tôn Đức Thắng<br />
                  Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
                </div>
                <div className="mt-2 text-label-sm border border-primary text-primary px-2 py-0.5 rounded w-fit">Mặc định</div>
              </div>
            </section>

            {/* Products & Shipping per shop */}
            <section className="bg-surface rounded-2xl border border-outline-variant overflow-hidden shadow-sm">
              <h2 className="font-headline-sm font-bold p-6 border-b border-outline-variant">
                Sản phẩm
              </h2>
              
              {CART_GROUPS.map((group, gIdx) => (
                <div key={gIdx} className={["p-6", gIdx > 0 ? "border-t border-outline-variant border-dashed" : ""].join(" ")}>
                  {/* Shop Info */}
                  <div className="font-label-md text-on-surface mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">store</span>
                    {group.seller.name}
                  </div>
                  
                  {/* Items */}
                  <div className="flex flex-col gap-4 mb-6">
                    {group.items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="relative w-16 h-16 rounded border border-outline-variant overflow-hidden shrink-0">
                          <Image src={item.product.images[0]} alt={item.product.title} fill className="object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col min-w-0">
                          <span className="font-body-sm text-on-surface truncate">{item.product.title}</span>
                          <span className="text-xs text-on-surface-variant mt-1">Loại: {item.variant}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-price-sm text-on-surface">{formatPrice(item.product.price)}</div>
                          <div className="text-xs text-on-surface-variant mt-1">x{item.quantity}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Shipping Selection for this shop */}
                  <div className="bg-surface-container-low p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h4 className="font-label-md text-on-surface mb-1 text-primary">Phương thức vận chuyển</h4>
                      <div className="font-body-sm text-on-surface font-medium">Nhanh (Giao hàng dự kiến 1-2 ngày)</div>
                      <div className="text-xs text-on-surface-variant mt-0.5">Nhận hàng vào 26 Th07 - 27 Th07</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-price-sm text-on-surface font-medium">{formatPrice(20000)}</span>
                      <button className="text-primary text-sm hover:underline">Thay đổi</button>
                    </div>
                  </div>
                  
                  {/* Shop Message */}
                  <div className="mt-4 flex flex-col gap-2">
                    <span className="text-label-md text-on-surface-variant font-medium">Lời nhắn cho người bán:</span>
                    <textarea 
                      placeholder="Lưu ý cho Người bán (ví dụ: giao trong giờ hành chính)..." 
                      className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest text-sm text-on-surface outline-none transition-all duration-200 focus:bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 px-4 py-3 min-h-[80px] resize-y"
                    />
                  </div>
                </div>
              ))}
            </section>

            {/* Payment Method */}
            <section className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm">
              <h2 className="font-headline-sm font-bold mb-6">Phương thức thanh toán</h2>
              
              <div className="flex flex-col gap-4">
                <label className="flex items-center justify-between p-4 border border-outline-variant rounded-xl cursor-pointer hover:bg-surface-container-low transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary-container/10">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-[32px] text-primary">payments</span>
                    <span className="font-label-md text-on-surface">Thanh toán khi nhận hàng (COD)</span>
                  </div>
                  <input type="radio" name="paymentMethod" className="w-5 h-5 text-primary focus:ring-primary accent-primary" defaultChecked />
                </label>
                
                <label className="flex items-center justify-between p-4 border border-outline-variant rounded-xl cursor-pointer hover:bg-surface-container-low transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary-container/10">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-[32px] text-primary">credit_card</span>
                    <span className="font-label-md text-on-surface">Thẻ Tín dụng/Ghi nợ</span>
                  </div>
                  <input type="radio" name="paymentMethod" className="w-5 h-5 text-primary focus:ring-primary accent-primary" />
                </label>
                
                <label className="flex items-center justify-between p-4 border border-outline-variant rounded-xl cursor-pointer hover:bg-surface-container-low transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary-container/10">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-[32px] text-primary">account_balance</span>
                    <span className="font-label-md text-on-surface">Chuyển khoản ngân hàng</span>
                  </div>
                  <input type="radio" name="paymentMethod" className="w-5 h-5 text-primary focus:ring-primary accent-primary" />
                </label>
              </div>
            </section>
          </div>

          {/* ── Right Column: Order Summary ── */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="bg-surface rounded-2xl border border-outline-variant p-6 sticky top-24 shadow-sm">
              <h2 className="font-headline-sm font-bold mb-6">Đơn hàng</h2>
              
              <div className="flex flex-col gap-4 text-body-md text-on-surface-variant border-b border-outline-variant pb-6 mb-6">
                <div className="flex justify-between">
                  <span>Tổng tiền hàng</span>
                  <span className="text-on-surface">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span className="text-on-surface">{formatPrice(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-primary">
                  <span>Giảm giá phí vận chuyển</span>
                  <span>-{formatPrice(15000)}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span className="font-label-md text-on-surface">Tổng thanh toán</span>
                <span className="font-headline-md text-[22px] text-primary font-bold leading-none">
                  {formatPrice(total - 15000)}
                </span>
              </div>
              
              <div className="text-right text-xs text-on-surface-variant mb-6">
                Đã bao gồm VAT (nếu có)
              </div>
              
              <Button variant="primary" fullWidth size="lg" onClick={handlePlaceOrder}>
                Đặt hàng
              </Button>
              
              <p className="text-xs text-on-surface-variant text-center mt-4 px-4 leading-relaxed">
                Bằng việc tiến hành Đặt hàng, bạn đồng ý với các <Link href="#" className="text-primary hover:underline">Điều khoản Dịch vụ</Link> của ShopNexus.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
