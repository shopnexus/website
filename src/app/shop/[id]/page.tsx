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
          gradient before the reader learns whose shop it is. The identity card overlaps its
          bottom, so what actually shows is about seventy pixels. */}
      <div className="relative h-24 w-full overflow-hidden bg-primary md:h-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,var(--color-primary-container),transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent" />
      </div>

      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        {/* One band across the page rather than a column down the side.
            The sidebar held an avatar, a name, two buttons and a joining date — about 300px of
            content — and it stood beside a grid of a hundred and sixty products, so from the
            second row down the left quarter of every screen was empty. Read once at the top, it
            costs one band; kept in a column, it costs a quarter of the page for as long as the
            reader scrolls. */}
        {/* `relative`: the banner above is positioned, so without a stacking context of its own
            this card was painted *under* it and lost its top forty-eight pixels — the shop's
            name and half of both buttons. */}
        <section className="relative -mt-12 rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-outline-variant bg-surface">
              {seller.avatar?.url ? (
                <Image src={seller.avatar.url} alt={seller.name} fill className="object-cover" sizes="80px" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-secondary-container font-headline-sm font-bold text-on-secondary-container">
                  {seller.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="flex items-center gap-1.5 font-title-lg font-bold text-on-surface">
                <span className="truncate">{seller.name}</span>
                {seller.identity_verified && (
                  <span
                    className="material-symbols-outlined shrink-0 text-[19px] text-primary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                    title="Đã xác minh danh tính"
                  >
                    verified
                  </span>
                )}
              </h1>

              <div className="mt-1.5">
                <ShopStats
                  followerCount={seller.follower_count}
                  joinedAt={seller.created_at}
                  reputation={reputation}
                />
              </div>

              {/* Two lines here; the whole thing is what the "Giới thiệu" tab is for. */}
              {seller.description && (
                <p className="mt-2 line-clamp-2 max-w-[80ch] font-body-sm leading-relaxed text-on-surface-variant">
                  {seller.description}
                </p>
              )}
            </div>

            <div className="flex gap-2 sm:shrink-0">
              <FollowButton accountId={seller.id} className="h-10 flex-1 sm:flex-none sm:px-6" />
              <StartChatButton
                sellerId={seller.id}
                currentPath={`/shop/${seller.id}`}
                label="Nhắn tin"
                className="h-10 flex-1 sm:flex-none sm:px-6"
              />
            </div>
          </div>
        </section>

        <div className="mt-6">
          <div className="mb-5">
            <Tabs tabs={tabs} activeTabId={activeTab} onChange={setActiveTab} />
          </div>

          {activeTab === "store" && <ShopListings listings={listings} />}
          {activeTab === "reviews" && <ShopFeedback accountId={seller.id} />}
          {activeTab === "followers" && <ShopFollowers accountId={seller.id} />}
          {activeTab === "about" && (
            <div className="max-w-[80ch] rounded-2xl border border-outline-variant bg-surface p-5">
              <h2 className="font-title-lg font-bold text-on-surface">Về {seller.name}</h2>
              <p className="mt-3 whitespace-pre-wrap font-body-md leading-relaxed text-on-surface-variant">
                {seller.description || "Người bán chưa viết giới thiệu."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
