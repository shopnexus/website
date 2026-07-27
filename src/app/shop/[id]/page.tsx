"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Tabs from "@/components/ui/Tabs";
import Chip from "@/components/ui/Chip";
import ProductCard from "@/components/ui/ProductCard";
import { SELLERS, PRODUCTS } from "@/lib/mock-data";
import { use } from "react";

export default function ShopProfilePage({ params }: { params: Promise<{ id: string }> }){
  const resolvedParams = use(params);
  const shopId = resolvedParams.id;
  const seller = SELLERS.find(s => s.id === shopId) || SELLERS[0];
  const shopProducts = PRODUCTS.filter(p => p.seller.id === seller.id);
  // Fallback to all products if shop has none (for mock purposes)
  const displayProducts = shopProducts.length > 0 ? shopProducts : PRODUCTS.slice(0, 8);

  const [activeTab, setActiveTab] = useState("store");

  const tabs = [
    { id: "store", label: "Cửa hàng" },
    { id: "reviews", label: "Đánh giá", count: seller.reviewCount },
    { id: "about", label: "Giới thiệu" },
  ];

  return (
    <div className="bg-surface-container-lowest min-h-screen">
      
      {/* ── Shop Header Background ── */}
      <div className="h-48 md:h-64 bg-surface-container-low w-full relative overflow-hidden">
        <Image src="https://picsum.photos/seed/shopcover/1440/300" alt="Shop Cover" fill className="object-cover opacity-60" />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-8 relative -top-12">
          
          {/* ── Left Sidebar (Seller Info) ── */}
          <aside className="w-full lg:w-80 shrink-0">
            <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-md text-center">
              <div className="relative w-28 h-28 mx-auto rounded-full border-4 border-surface overflow-hidden mb-4 shadow-sm -mt-16 bg-surface">
                <Image src={seller.avatar} alt={seller.name} fill className="object-cover" />
              </div>
              
              <h1 className="font-headline-md font-bold text-on-surface flex items-center justify-center gap-1 mb-1">
                {seller.name}
                {seller.isVerified && (
                  <span className="material-symbols-outlined text-primary text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                )}
              </h1>
              <div className="flex items-center justify-center gap-1 text-on-surface-variant font-body-sm mb-4">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                {seller.location}
              </div>
              
              <div className="flex gap-3 mb-6">
                <Button variant="primary" fullWidth icon={<span className="material-symbols-outlined">add</span>}>
                  Theo dõi
                </Button>
                <Button variant="outline" fullWidth icon={<span className="material-symbols-outlined">chat</span>}>
                  Nhắn tin
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-left pt-6 border-t border-outline-variant border-dashed">
                <div>
                  <div className="font-label-sm text-on-surface-variant mb-1">Đánh giá</div>
                  <div className="font-headline-sm font-bold flex items-center gap-1 text-on-surface">
                    {seller.rating}
                    <span className="material-symbols-outlined text-[18px] text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  </div>
                </div>
                <div>
                  <div className="font-label-sm text-on-surface-variant mb-1">Người theo dõi</div>
                  <div className="font-headline-sm font-bold text-on-surface">{seller.followerCount || "2.1k"}</div>
                </div>
                <div>
                  <div className="font-label-sm text-on-surface-variant mb-1">Đã bán</div>
                  <div className="font-headline-sm font-bold text-on-surface">{seller.soldCount}</div>
                </div>
                <div>
                  <div className="font-label-sm text-on-surface-variant mb-1">Tham gia</div>
                  <div className="font-headline-sm font-bold text-on-surface">{seller.joinDate || "1 năm"}</div>
                </div>
              </div>
              
              <div className="mt-6 text-left">
                <div className="font-label-md text-on-surface mb-2">Giới thiệu</div>
                <p className="font-body-sm text-on-surface-variant leading-relaxed">
                  {seller.description || "Chào mừng đến với cửa hàng của chúng tôi! Chuyên cung cấp các sản phẩm chất lượng với giá tốt nhất."}
                </p>
              </div>
            </div>
          </aside>

          {/* ── Main Area ── */}
          <main className="flex-1 min-w-0 pt-12 lg:pt-0">
            <div className="mb-6">
              <Tabs tabs={tabs} activeTabId={activeTab} onChange={setActiveTab} />
            </div>

            {activeTab === "store" && (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div className="flex flex-wrap gap-2">
                    <Chip selected>Tất cả sản phẩm ({displayProducts.length})</Chip>
                    <Chip>Điện thoại</Chip>
                    <Chip>Phụ kiện</Chip>
                    <Chip>Laptop</Chip>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-body-sm text-on-surface-variant">Sắp xếp:</span>
                    <select className="bg-surface border border-outline-variant rounded-full py-1.5 pl-3 pr-8 text-body-sm text-on-surface outline-none focus:border-primary">
                      <option>Mới nhất</option>
                      <option>Bán chạy</option>
                      <option>Giá tăng dần</option>
                      <option>Giá giảm dần</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-12">
                  {displayProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}

            {activeTab === "reviews" && (
              <div className="bg-surface rounded-2xl border border-outline-variant p-8 text-center text-on-surface-variant">
                Chức năng Đánh giá đang được cập nhật.
              </div>
            )}
            
            {activeTab === "about" && (
              <div className="bg-surface rounded-2xl border border-outline-variant p-8 text-on-surface">
                <h3 className="font-headline-sm font-bold mb-4">Thông tin chi tiết</h3>
                <p className="font-body-md whitespace-pre-wrap">{seller.description || "Chưa có thông tin giới thiệu chi tiết."}</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
