"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import FollowButton from "@/components/ui/FollowButton";
import StartChatButton from "@/components/ui/StartChatButton";
import { useAuthStore } from "@/stores/use-auth-store";
import type { AccountId, ListingId } from "@/api/generated/types.gen";

/**
 * Chat, follow and the way into the shop.
 *
 * Its own client component so the seller reading their own listing is offered the shop link
 * alone: "Theo dõi" and "Chat" pointing at yourself are two controls that either fail or open
 * a thread with nobody.
 */
export default function SellerActions({
  sellerId,
  listingId,
  following,
}: {
  sellerId: AccountId;
  listingId: ListingId;
  /** Whether the reader already follows them — false for an anonymous read. */
  following: boolean;
}) {
  const user = useAuthStore((s) => s.user);
  const isOwn = user?.id === sellerId;
  const shopHref = `/shop/${sellerId}`;

  return (
    <div className="flex flex-col gap-2">
      {!isOwn && (
        <div className="flex items-center gap-2">
          <StartChatButton
            sellerId={sellerId}
            currentPath={`/product/${listingId}`}
            label="Chat"
            className="flex-1 whitespace-nowrap"
          />
          <FollowButton
            accountId={sellerId}
            initialIsFollowing={following}
            variant="outline"
            className="flex-1 whitespace-nowrap"
          />
        </div>
      )}
      <Link href={shopHref}>
        <Button
          variant={isOwn ? "primary" : "outline"}
          className="w-full"
          icon={<span className="material-symbols-outlined text-[20px]">storefront</span>}
        >
          Xem gian hàng
        </Button>
      </Link>
    </div>
  );
}
