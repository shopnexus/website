"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/stores/use-auth-store";
import { useStartConversation } from "@/hooks/api/useChat";
import { toast } from "react-hot-toast";
import type { AccountId } from "@/api/generated/types.gen";

/**
 * Open the thread with an account, from wherever the reader is standing.
 *
 * `currentPath` is both where a sign-in comes back to and how the inbox learns which
 * listing the conversation is about — chat already has one thread per pair of accounts,
 * so there is nothing to create per product and no id to invent.
 */
export default function StartChatButton({
  sellerId,
  currentPath,
  label = "Chat",
  className = "flex-1 sm:flex-none",
}: {
  sellerId: AccountId;
  currentPath: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const startConversation = useStartConversation();

  const handleStartChat = () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để chat");
      router.push(`/login?callbackUrl=${encodeURIComponent(currentPath)}`);
      return;
    }

    startConversation.mutate(
      { account_id: sellerId },
      {
        onSuccess: (conversation) => {
          const match = currentPath.match(/\/product\/([^/]+)/);
          const listingId = match ? match[1] : null;

          if (listingId) {
            router.push(`/inbox?c=${conversation.id}&listing_id=${listingId}`);
          } else {
            router.push(`/inbox?c=${conversation.id}`);
          }
        },
        onError: () => {
          toast.error("Không thể mở cuộc trò chuyện");
        },
      },
    );
  };

  return (
    <Button
      variant="outline"
      icon={<span className="material-symbols-outlined">chat</span>}
      className={className}
      onClick={handleStartChat}
      disabled={startConversation.isPending}
    >
      {startConversation.isPending ? "Đang mở..." : label}
    </Button>
  );
}
