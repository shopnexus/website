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
  onChat,
}: {
  sellerId: AccountId;
  listingId: ListingId;
  /** Whether the reader already follows them — false for an anonymous read. */
  following: boolean;
  /** Passed through to the chat button: open the caller's own thread instead of the inbox. */
  onChat?: () => void;
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
            className="h-10 flex-1 whitespace-nowrap"
            onStart={onChat}
          />
          <FollowButton
            accountId={sellerId}
            initialIsFollowing={following}
            variant="outline"
            className="h-10 flex-1 whitespace-nowrap"
          />
        </div>
      )}
      <Link href={shopHref}>
        <Button
          variant={isOwn ? "primary" : "ghost"}
          className="h-10 w-full"
          icon={<span className="material-symbols-outlined text-[18px]">storefront</span>}
        >
          Xem gian hàng
        </Button>
      </Link>
    </div>
  );
}
