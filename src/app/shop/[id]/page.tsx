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
          a random picsum image, which is a picture of somebody else's shop.

          Slimmer than it was. At 192–256px it was the largest thing on the page and it says
          nothing — a shop with no cover image should not open with a quarter-screen of
          gradient before the reader learns whose shop it is. */}
      <div className="h-28 md:h-36 w-full relative overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,var(--color-primary-container),transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent" />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="relative -top-10 flex flex-col gap-6 lg:flex-row lg:gap-8">
          <aside className="w-full shrink-0 lg:w-72">
            <div className="rounded-2xl border border-outline-variant bg-surface p-5 text-center shadow-sm">
              <div className="relative -mt-14 mx-auto mb-3 h-24 w-24 overflow-hidden rounded-full border-4 border-surface bg-surface shadow-sm">
                {seller.avatar?.url ? (
                  <Image src={seller.avatar.url} alt={seller.name} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-secondary-container font-headline-sm font-bold text-on-secondary-container">
                    {seller.name.charAt(0)}
                  </div>
                )}
              </div>

              <h1 className="flex items-center justify-center gap-1 font-title-lg font-bold text-on-surface">
                {seller.name}
                {seller.identity_verified && (
                  <span
                    className="material-symbols-outlined text-primary text-[19px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                    title="Đã xác minh danh tính"
                  >
                    verified
                  </span>
                )}
              </h1>

              <div className="mb-4 mt-3 flex gap-2">
                <FollowButton accountId={seller.id} className="h-10 flex-1" />
                <StartChatButton
                  sellerId={seller.id}
                  currentPath={`/shop/${seller.id}`}
                  label="Nhắn tin"
                  className="h-10 flex-1"
                />
              </div>

              <ShopStats
                followerCount={seller.follower_count}
                joinedAt={seller.created_at}
                reputation={reputation}
              />

              {seller.description && (
                <div className="mt-4 text-left">
                  <div className="mb-1.5 font-label-sm uppercase tracking-wider text-on-surface-variant">
                    Giới thiệu
                  </div>
                  <p className="font-body-sm text-on-surface-variant leading-relaxed">
                    {seller.description}
                  </p>
                </div>
              )}
            </div>
          </aside>

          <div className="mt-10 flex-1 lg:mt-0">
            <div className="mb-5">
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
