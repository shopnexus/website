"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Tabs from "@/components/ui/Tabs";
import Chip from "@/components/ui/Chip";
import ProductCard from "@/components/ui/ProductCard";
import { mockPublicAccount } from "@/lib/mocks/account.mock";
import { mockListingPage } from "@/lib/mocks/catalog.mock";
import { use } from "react";

export default function ShopProfilePage({ params }: { params: Promise<{ id: string }> }){
  const resolvedParams = use(params);
  const shopId = resolvedParams.id;
  
  // Using the new mock data
  const seller = mockPublicAccount;
  const displayProducts = mockListingPage.data;

  const [activeTab, setActiveTab] = useState("store");

  const tabs = [
    { id: "store", label: "Cửa hàng" },
    { id: "reviews", label: "Đánh giá", count: 127 },
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
                {seller.avatar?.url ? (
                  <Image src={seller.avatar.url} alt={seller.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-secondary-container flex items-center justify-center text-on-surface font-bold text-2xl">
                    {seller.name.charAt(0)}
                  </div>
                )}
              </div>
              
              <h1 className="font-headline-md font-bold text-on-surface flex items-center justify-center gap-1 mb-1">
                {seller.name}
                {seller.identity_verified && (
                  <span className="material-symbols-outlined text-primary text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                )}
              </h1>
              
              <div className="flex gap-3 mb-6 mt-4">
                <Button variant="primary" fullWidth icon={<span className="material-symbols-outlined">add</span>}>
                  Theo dõi
                </Button>
                <Button variant="outline" fullWidth icon={<span className="material-symbols-outlined">chat</span>}>
                  Nhắn tin
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-left pt-6 border-t border-outline-variant border-dashed">
                <div>
                  <div className="font-label-sm text-on-surface-variant mb-1">Người theo dõi</div>
                  <div className="font-headline-sm font-bold text-on-surface">{seller.follower_count}</div>
                </div>
                <div>
                  <div className="font-label-sm text-on-surface-variant mb-1">Tham gia</div>
                  <div className="font-headline-sm font-bold text-on-surface">
                    {new Date(seller.created_at).toLocaleDateString("vi-VN", { month: "short", year: "numeric" })}
                  </div>
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
          <div className="flex-1 mt-12 lg:mt-0">
            {/* Nav Tabs */}
            <div className="mb-6">
              <Tabs tabs={tabs} activeTabId={activeTab} onChange={setActiveTab} />
            </div>

            {/* Content Based on Tab */}
            {activeTab === "store" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-headline-sm font-bold text-on-surface">Tất cả sản phẩm ({displayProducts.length})</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" icon={<span className="material-symbols-outlined text-sm">filter_list</span>}>Lọc</Button>
                    <Button variant="outline" size="sm" icon={<span className="material-symbols-outlined text-sm">sort</span>}>Mới nhất</Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {displayProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="py-12 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-6xl text-outline mb-4">rate_review</span>
                <p className="font-body-lg">Chưa có đánh giá nào.</p>
              </div>
            )}

            {activeTab === "about" && (
              <div className="bg-surface rounded-2xl border border-outline-variant p-6 md:p-8">
                <h2 className="font-headline-sm font-bold text-on-surface mb-4">Về {seller.name}</h2>
                <div className="prose prose-sm text-on-surface-variant max-w-none">
                  <p>{seller.description}</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
