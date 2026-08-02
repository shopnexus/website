"use client";

import { use, useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Tabs from "@/components/ui/Tabs";
import ProductCard from "@/components/ui/ProductCard";
import FollowButton from "@/components/ui/FollowButton";
import { useListingsFeed } from "@/hooks/api/useCatalog";
import { useAccountFeedback, usePublicAccount, useReputation } from "@/hooks/api/useShop";
import type { AccountId } from "@/api/generated/types.gen";

export default function ShopProfilePage({ params }: { params: Promise<{ id: string }> }){
  const shopId = use(params).id as AccountId;

  const { data: seller, isLoading: isLoadingSeller } = usePublicAccount(shopId);
  const { data: reputation } = useReputation(shopId, "seller");
  const {
    listings,
    totalCount,
    isLoading: isLoadingListings,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useListingsFeed({ seller_id: shopId, limit: 24 });
  const { feedback } = useAccountFeedback(shopId);

  const [activeTab, setActiveTab] = useState("store");

  const tabs = [
    { id: "store", label: "Cửa hàng", count: totalCount ?? undefined },
    { id: "reviews", label: "Đánh giá", count: reputation?.review_rating_count },
    { id: "about", label: "Giới thiệu" },
  ];

  if (isLoadingSeller) {
    return (
      <div className="bg-surface-container-lowest min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="bg-surface-container-lowest min-h-screen flex items-center justify-center text-on-surface-variant">
        Không tìm thấy gian hàng này.
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest min-h-screen">
      
      <div className="h-48 md:h-64 bg-surface-container-low w-full relative overflow-hidden">
        <Image src="https://picsum.photos/seed/shopcover/1440/300" alt="Shop Cover" fill className="object-cover opacity-60" />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-8 relative -top-12">
          
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
                <FollowButton accountId={seller.id} className="flex-1" />
                <Button variant="outline" fullWidth icon={<span className="material-symbols-outlined">chat</span>}>
                  Nhắn tin
                </Button>
              </div>

              {/* Reputation is a separate read, and scoped by role: the same account has
                  one standing as a seller and another as a buyer. */}
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
                {reputation && (
                  <>
                    <div>
                      <div className="font-label-sm text-on-surface-variant mb-1">Đánh giá</div>
                      <div className="font-headline-sm font-bold text-on-surface flex items-center gap-1">
                        {reputation.rating_count > 0 ? (
                          <>
                            <span className="material-symbols-outlined text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            {reputation.rating_average.toFixed(1)}
                            <span className="font-body-sm font-normal text-on-surface-variant">
                              ({reputation.rating_count})
                            </span>
                          </>
                        ) : (
                          <span className="font-body-sm font-normal text-on-surface-variant">Chưa có</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="font-label-sm text-on-surface-variant mb-1">Đơn hoàn thành</div>
                      <div className="font-headline-sm font-bold text-on-surface">
                        {reputation.completed_orders}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {seller.description && (
                <div className="mt-6 text-left">
                  <div className="font-label-md text-on-surface mb-2">Giới thiệu</div>
                  <p className="font-body-sm text-on-surface-variant leading-relaxed">
                    {seller.description}
                  </p>
                </div>
              )}
            </div>
          </aside>

          <div className="flex-1 mt-12 lg:mt-0">
            <div className="mb-6">
              <Tabs tabs={tabs} activeTabId={activeTab} onChange={setActiveTab} />
            </div>

            {activeTab === "store" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-headline-sm font-bold text-on-surface">
                    Tất cả sản phẩm{totalCount !== null ? ` (${totalCount})` : ""}
                  </h2>
                </div>

                {isLoadingListings ? (
                  <div className="py-12 text-center text-on-surface-variant">Đang tải sản phẩm...</div>
                ) : listings.length === 0 ? (
                  <div className="py-12 text-center text-on-surface-variant">
                    Gian hàng này chưa có sản phẩm nào.
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {listings.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>

                    {hasNextPage && (
                      <div className="mt-8 flex justify-center">
                        <Button variant="outline" disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>
                          {isFetchingNextPage ? "Đang tải..." : "Tải thêm"}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              feedback.length === 0 ? (
                <div className="py-12 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-6xl text-outline mb-4">rate_review</span>
                  <p className="font-body-lg">Chưa có đánh giá nào.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {feedback.map((entry) => (
                    <div key={entry.id} className="bg-surface rounded-2xl border border-outline-variant p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-0.5 text-primary">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span
                              key={i}
                              className="material-symbols-outlined text-[18px]"
                              style={{ fontVariationSettings: i < entry.rating ? "'FILL' 1" : "'FILL' 0" }}
                            >
                              star
                            </span>
                          ))}
                        </div>
                        <span className="font-body-sm text-on-surface-variant">
                          {new Date(entry.created_at).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      {entry.comment && (
                        <p className="font-body-md text-on-surface leading-relaxed">{entry.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )
            )}

            {activeTab === "about" && (
              <div className="bg-surface rounded-2xl border border-outline-variant p-6 md:p-8">
                <h2 className="font-headline-sm font-bold text-on-surface mb-4">Về {seller.name}</h2>
                <div className="prose prose-sm text-on-surface-variant max-w-none">
                  <p>{seller.description || "Người bán chưa viết giới thiệu."}</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
