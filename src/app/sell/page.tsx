"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import StepIndicator from "@/components/ui/StepIndicator";

export default function SellPage() {
  const [currentStep, setCurrentStep] = useState(0); // 0, 1, 2

  const handleNext = () => {
    if (currentStep < 2) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest py-8 pb-24">
      <div className="max-w-3xl mx-auto px-4 md:px-8">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">sell</span>
            Tạo tin đăng mới
          </h1>
          <Link
            href="/"
            className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined">close</span>
          </Link>
        </div>

        {/* Step Indicator */}
        <StepIndicator
          steps={["Hình ảnh", "Thông tin", "Giá & Giao hàng"]}
          currentStep={currentStep}
          className="mb-10"
        />

        {/* Card */}
        <div className="bg-surface rounded-3xl border border-outline-variant shadow-sm overflow-hidden">

          {/* Content body */}
          <div className="p-6 md:p-10">

            {/* STEP 0: Images */}
            {currentStep === 0 && (
              <div>
                <h3 className="text-xl font-bold mb-2">Thêm hình ảnh / video</h3>
                <p className="text-sm text-on-surface-variant mb-8">
                  Đăng tối đa 10 hình ảnh và 1 video. Hình ảnh rõ nét sẽ giúp bạn bán nhanh hơn.
                </p>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mb-8">
                  {/* Main Upload Box */}
                  <div className="col-span-2 row-span-2 sm:col-span-2 aspect-square bg-surface-container-low border-2 border-dashed border-primary/50 rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-surface-container transition-colors">
                    <span className="material-symbols-outlined text-[48px] text-primary mb-2">add_a_photo</span>
                    <div className="text-sm font-semibold text-primary mb-1">Tải ảnh lên</div>
                    <div className="text-xs text-on-surface-variant">hoặc kéo thả vào đây</div>
                  </div>

                  {/* Image Slots */}
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square bg-surface-container-lowest border border-outline-variant border-dashed rounded-2xl flex items-center justify-center text-outline-variant hover:border-primary hover:text-primary transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined">add</span>
                    </div>
                  ))}
                </div>

                <div className="bg-surface-container-low rounded-xl p-4 text-sm text-on-surface-variant flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5 shrink-0">info</span>
                  <span>Ảnh đầu tiên sẽ là ảnh bìa. Ảnh ngang 4:3 hoặc vuông 1:1 được khuyến nghị.</span>
                </div>
              </div>
            )}

            {/* STEP 1: Info */}
            {currentStep === 1 && (
              <div className="flex flex-col gap-6">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">
                    Tên sản phẩm <span className="text-error">*</span>
                  </label>
                  <Input placeholder="Ví dụ: iPhone 14 Pro Max 256GB mới 99%" />
                  <div className="text-xs text-on-surface-variant mt-1 text-right">0/100</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">
                      Danh mục <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <select className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 pl-4 pr-10 text-base outline-none focus:border-primary appearance-none cursor-pointer">
                        <option value="">Chọn danh mục</option>
                        <option value="phone">Điện thoại</option>
                        <option value="fashion">Thời trang</option>
                        <option value="furniture">Nội thất</option>
                        <option value="vehicle">Xe cộ</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">
                      Tình trạng <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <select className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 pl-4 pr-10 text-base outline-none focus:border-primary appearance-none cursor-pointer">
                        <option value="">Chọn tình trạng</option>
                        <option value="new">Mới</option>
                        <option value="used_99">Đã sử dụng (99%)</option>
                        <option value="used_90">Đã sử dụng (90%)</option>
                        <option value="used">Đã sử dụng</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">
                    Khu vực
                  </label>
                  <div className="relative">
                    <select className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 pl-4 pr-10 text-base outline-none focus:border-primary appearance-none cursor-pointer">
                      <option value="">Chọn tỉnh / thành phố</option>
                      <option value="hn">Hà Nội</option>
                      <option value="hcm">TP. Hồ Chí Minh</option>
                      <option value="dn">Đà Nẵng</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">
                    Mô tả chi tiết <span className="text-error">*</span>
                  </label>
                  <textarea
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-base outline-none focus:border-primary resize-none h-36"
                    placeholder="Mô tả chi tiết về sản phẩm, nguồn gốc, tình trạng, phụ kiện đi kèm..."
                  />
                  <div className="text-xs text-on-surface-variant mt-1 text-right">0/3000</div>
                </div>
              </div>
            )}

            {/* STEP 2: Price & Delivery */}
            {currentStep === 2 && (
              <div className="flex flex-col gap-6">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">
                    Giá bán (VNĐ) <span className="text-error">*</span>
                  </label>
                  <Input type="number" placeholder="Nhập giá bán..." leftIcon="payments" className="py-3 text-lg" />
                  <div className="text-xs text-on-surface-variant mt-1">
                    Tip: Giá cạnh tranh giúp bạn bán nhanh hơn 3x
                  </div>
                </div>

                <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant">
                  <h4 className="text-sm font-semibold text-on-surface mb-4">Phương thức giao dịch</h4>
                  <label className="flex items-start gap-3 cursor-pointer mb-4">
                    <input
                      type="checkbox"
                      className="w-5 h-5 mt-0.5 rounded text-primary border-outline-variant focus:ring-primary bg-surface"
                      defaultChecked
                    />
                    <div>
                      <span className="text-base text-on-surface font-medium block">Giao hàng qua ShopNexus</span>
                      <span className="text-sm text-on-surface-variant block mt-0.5">
                        Người mua thanh toán online hoặc COD, ShopNexus vận chuyển.
                      </span>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 mt-0.5 rounded text-primary border-outline-variant focus:ring-primary bg-surface"
                    />
                    <div>
                      <span className="text-base text-on-surface font-medium block">Tự giao dịch</span>
                      <span className="text-sm text-on-surface-variant block mt-0.5">
                        Gặp mặt trực tiếp hoặc tự ship. Không được bảo vệ bởi ShopNexus.
                      </span>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Địa chỉ lấy hàng</label>
                  <div className="bg-surface border border-outline-variant rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-sm">Nhà riêng</div>
                      <div className="text-sm text-on-surface-variant mt-0.5">Tòa nhà The Nexus, Quận 1, TP. HCM</div>
                    </div>
                    <button className="text-primary text-sm hover:underline">Thay đổi</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 md:px-10 py-5 border-t border-outline-variant bg-surface-container-lowest flex justify-between items-center">
            <button
              className="text-primary text-sm font-semibold hover:underline"
              onClick={currentStep === 0 ? () => {} : handlePrev}
            >
              {currentStep === 0 ? "Lưu nháp" : "Quay lại"}
            </button>

            <Button variant="primary" className="px-8" onClick={currentStep === 2 ? () => {} : handleNext}>
              {currentStep === 2 ? "Đăng bán ngay" : "Tiếp tục"}
              {currentStep < 2 && (
                <span className="material-symbols-outlined ml-1">arrow_forward</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
