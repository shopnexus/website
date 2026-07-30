"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import StepIndicator from "@/components/ui/StepIndicator";
import { mockDraftOrderPage, mockContact } from "@/lib/mocks/order.mock";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

export default function CheckoutPage(){
  const router = useRouter();
  
  const subtotal = mockDraftOrderPage.data.reduce((total, draft) => {
    return total + draft.snapshot.skus.reduce((acc, sku) => acc + sku.price, 0); // Assuming 1 qty per sku for mock
  }, 0);
  
  const shippingFee = 35000;
  const total = subtotal + shippingFee;

  const handlePlaceOrder = () => {
    router.push("/orders"); // Mock redirecting to orders page on success
  };

  return (
    <div className="bg-surface-container-lowest min-h-screen py-8 pb-24">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        
        <div className="mb-8 hidden md:block">
           <StepIndicator 
             steps={["Giỏ hàng", "Thanh toán", "Xác nhận"]} 
             currentStep={1} 
           />
        </div>

        <h1 className="font-headline-md font-bold mb-6">Thanh toán</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 flex flex-col gap-6">
            
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
                <div className="font-bold">{mockContact.full_name} <span className="font-normal text-on-surface-variant mx-2">|</span> {mockContact.phone}</div>
                <div className="text-on-surface-variant">
                  {mockContact.address_detail}, {mockContact.address}<br />
                  {mockContact.ward_name}, {mockContact.province_name}
                </div>
                <div className="mt-2 text-label-sm border border-primary text-primary px-2 py-0.5 rounded w-fit">Mặc định</div>
              </div>
            </section>

            <section className="bg-surface rounded-2xl border border-outline-variant overflow-hidden shadow-sm">
              <h2 className="font-headline-sm font-bold p-6 border-b border-outline-variant">
                Sản phẩm
              </h2>
              
              {mockDraftOrderPage.data.map((draft, dIdx) => (
                <div key={draft.id} className={["p-6", dIdx > 0 ? "border-t border-outline-variant border-dashed" : ""].join(" ")}>
                  <div className="font-label-md text-on-surface mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">store</span>
                    Shop {draft.snapshot.seller_id}
                  </div>
                  
                  <div className="flex flex-col gap-4 mb-6">
                    {draft.snapshot.skus.map((sku) => (
                      <div key={sku.id} className="flex gap-4">
                        <div className="relative w-16 h-16 rounded border border-outline-variant overflow-hidden shrink-0">
                          {sku.attachments?.[0] ? (
                            <Image src={`https://cdn.shopnexus.vn/mock/${sku.attachments[0]}`} alt={draft.snapshot.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-surface-container flex items-center justify-center text-xs">No img</div>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col min-w-0">
                          <span className="font-body-sm text-on-surface truncate">{draft.snapshot.name}</span>
                          {sku.attributes && Object.keys(sku.attributes).length > 0 && (
                            <span className="text-xs text-on-surface-variant mt-1">Loại: {Object.values(sku.attributes).join(", ")}</span>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-price-sm text-on-surface">{formatPrice(sku.price)}</div>
                          <div className="text-xs text-on-surface-variant mt-1">x1</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-surface-container-low p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h4 className="font-label-md text-on-surface mb-1 text-primary">Phương thức vận chuyển</h4>
                      <div className="font-body-sm text-on-surface font-medium">Nhanh (Giao hàng dự kiến 1-2 ngày)</div>
                      <div className="text-xs text-on-surface-variant mt-0.5">Nhận hàng dự kiến sớm</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-price-sm text-on-surface font-medium">{formatPrice(shippingFee)}</span>
                      <button className="text-primary text-sm hover:underline">Thay đổi</button>
                    </div>
                  </div>
                  
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
                    <span className="material-symbols-outlined text-[32px] text-primary">qr_code_2</span>
                    <span className="font-label-md text-on-surface">Thanh toán VNPay QR</span>
                  </div>
                  <input type="radio" name="paymentMethod" className="w-5 h-5 text-primary focus:ring-primary accent-primary" />
                </label>
              </div>
            </section>
          </div>

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
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span className="font-label-md text-on-surface">Tổng thanh toán</span>
                <span className="font-headline-md text-[22px] text-primary font-bold leading-none">
                  {formatPrice(total)}
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
