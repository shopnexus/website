"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/stores/use-auth-store";
import { useStartConversation } from "@/hooks/api/useChat";
import { toast } from "react-hot-toast";
import type { AccountId } from "@/api/generated/types.gen";

export default function StartChatButton({
  sellerId,
  currentPath,
}: {
  sellerId: AccountId;
  currentPath: string;
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
          // Navigating to inbox and passing the listing_id if we are on a product page
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
        }
      }
    );
  };

  return (
    <Button
      variant="outline"
      icon={<span className="material-symbols-outlined">chat</span>}
      className="flex-1 sm:flex-none"
      onClick={handleStartChat}
      disabled={startConversation.isPending}
    >
      {startConversation.isPending ? "Đang mở..." : "Chat"}
    </Button>
  );
}
