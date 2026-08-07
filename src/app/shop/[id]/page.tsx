"use client";

import { use, useState } from "react";
import Image from "next/image";
import StartChatButton from "@/components/ui/StartChatButton";
import Tabs from "@/components/ui/Tabs";
import FollowButton from "@/components/ui/FollowButton";
import { usePublicAccount, useReputation } from "@/hooks/api/useShop";
import type { AccountId } from "@/api/generated/types.gen";
import ShopFeedback from "./_components/ShopFeedback";
import ShopFollowers from "./_components/ShopFollowers";
import ShopListings from "./_components/ShopListings";
import ShopStats from "./_components/ShopStats";
import { useShopListings } from "./_hooks/useShopListings";

export default function ShopProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const shopId = use(params).id as AccountId;

  const { data: seller, isLoading: isLoadingSeller } = usePublicAccount(shopId);
  // Reputation is a separate read, and scoped by role: the same account has one standing
  // as a seller and another as a buyer.
  const { data: reputation } = useReputation(shopId, "seller");
  const listings = useShopListings(shopId);

  const [activeTab, setActiveTab] = useState("store");

  if (isLoadingSeller) {
    return (
      <div className="bg-surface-container-lowest min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">
          progress_activity
        </span>
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

  const tabs = [
    { id: "store", label: "Cửa hàng", count: listings.totalCount ?? undefined },
    { id: "reviews", label: "Đánh giá", count: reputation?.rating_count },
    { id: "followers", label: "Người theo dõi", count: seller.follower_count },
    { id: "about", label: "Giới thiệu" },
  ];

  return (
    <div className="bg-surface-container-lowest min-h-screen">
      {/* A banner drawn from the palette rather than a stock photo: the previous cover was
          a random picsum image, which is a picture of somebody else's shop. */}
      <div className="h-48 md:h-64 w-full relative overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,var(--color-primary-container),transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent" />
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
                  <span
                    className="material-symbols-outlined text-primary text-[22px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                    title="Đã xác minh danh tính"
                  >
                    verified
                  </span>
                )}
              </h1>

              <div className="flex gap-3 mb-6 mt-4">
                <FollowButton accountId={seller.id} className="flex-1" />
                <StartChatButton
                  sellerId={seller.id}
                  currentPath={`/shop/${seller.id}`}
                  label="Nhắn tin"
                  className="flex-1"
                />
              </div>

              <ShopStats
                followerCount={seller.follower_count}
                joinedAt={seller.created_at}
                reputation={reputation}
              />

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

            {activeTab === "store" && <ShopListings listings={listings} />}
            {activeTab === "reviews" && <ShopFeedback accountId={seller.id} />}
            {activeTab === "followers" && <ShopFollowers accountId={seller.id} />}
            {activeTab === "about" && (
              <div className="bg-surface rounded-2xl border border-outline-variant p-6 md:p-8">
                <h2 className="font-headline-sm font-bold text-on-surface mb-4">
                  Về {seller.name}
                </h2>
                <p className="font-body-md text-on-surface-variant leading-relaxed">
                  {seller.description || "Người bán chưa viết giới thiệu."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
