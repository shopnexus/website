"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import StepIndicator from "@/components/ui/StepIndicator";

export default function OrderSuccessPage(){
  return (
    <div className="bg-surface-container-lowest min-h-screen py-8">
      <div className="max-w-[800px] mx-auto px-4 md:px-8">
        
        {/* Step Indicator */}
        <div className="mb-12 hidden md:block">
           <StepIndicator 
             steps={["Giỏ hàng", "Thanh toán", "Xác nhận"]} 
             currentStep={3} 
           />
        </div>

        <div className="bg-surface rounded-3xl border border-outline-variant p-8 md:p-12 text-center shadow-sm">
          {/* Success Animation/Icon */}
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-md border-4 border-surface text-on-primary">
            <span className="material-symbols-outlined" style={{ fontSize: "60px", fontVariationSettings: "'wght' 700" }}>
              check
            </span>
          </div>

          <h1 className="font-display-lg text-[32px] md:text-[40px] font-bold text-on-surface mb-2">
            Đặt hàng thành công!
          </h1>
          <p className="font-body-md text-on-surface-variant mb-8 max-w-md mx-auto">
            Cảm ơn bạn đã mua sắm tại ShopNexus. Đơn hàng của bạn đã được xác nhận và đang được xử lý.
          </p>

          {/* Order Details Card */}
          <div className="bg-surface-container-low rounded-2xl p-6 mb-8 text-left max-w-lg mx-auto border border-outline-variant">
            <div className="flex justify-between items-center border-b border-outline-variant border-dashed pb-4 mb-4">
              <span className="font-label-md text-on-surface-variant">Mã đơn hàng</span>
              <span className="font-headline-sm font-bold text-primary">#ORD-9824X</span>
            </div>
            <div className="flex justify-between items-center border-b border-outline-variant border-dashed pb-4 mb-4">
              <span className="font-label-md text-on-surface-variant">Phương thức thanh toán</span>
              <span className="font-label-md text-on-surface">Thanh toán khi nhận hàng (COD)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-label-md text-on-surface-variant">Tổng thanh toán</span>
              <span className="font-price-lg text-primary text-xl">3.450.000 đ</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
            <Link href="/orders" className="flex-1">
              <Button variant="primary" fullWidth size="lg">
                Theo dõi đơn hàng
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="outline" fullWidth size="lg">
                Tiếp tục mua sắm
              </Button>
            </Link>
          </div>
          
          <div className="mt-8 pt-8 border-t border-outline-variant flex items-start gap-4 text-left max-w-lg mx-auto">
            <span className="material-symbols-outlined text-primary text-[24px]">local_shipping</span>
            <div>
              <h4 className="font-label-md font-bold text-on-surface mb-1">Giao hàng dự kiến</h4>
              <p className="font-body-sm text-on-surface-variant">
                Đơn hàng của bạn sẽ được giao vào <span className="font-bold text-on-surface">26 Th07 - 27 Th07</span>. ShopNexus sẽ gửi thông báo cho bạn khi đơn hàng bắt đầu được giao.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
