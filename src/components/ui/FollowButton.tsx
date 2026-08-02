"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";
import { useToggleFollow } from "@/hooks/api/useAccount";
import type { AccountId } from "@/api/generated/types.gen";

interface FollowButtonProps {
  accountId: AccountId;
  initialIsFollowing?: boolean;
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "error";
}

export default function FollowButton({
  accountId,
  initialIsFollowing = false,
  className,
  variant = "primary",
}: FollowButtonProps) {
  // Local, because there is no per-seller "am I following this one" read: the state
  // arrives as a prop from whatever listed the seller, and the button owns it after the
  // first click. A failure below puts it back.
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const toggleFollow = useToggleFollow();

  const handleToggleFollow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // The card around this is often a link.

    const next = !isFollowing;
    setIsFollowing(next);

    toggleFollow.mutate(
      { accountId, following: next },
      {
        onSuccess: () => toast.success(next ? "Đã theo dõi gian hàng." : "Đã bỏ theo dõi."),
        // The global handler raises the toast; this only undoes the optimistic flip.
        onError: () => setIsFollowing(!next),
      },
    );
  };

  return (
    <Button
      variant={isFollowing ? "outline" : variant}
      className={className}
      onClick={handleToggleFollow}
      disabled={toggleFollow.isPending}
    >
      {toggleFollow.isPending ? (
        <span className="material-symbols-outlined animate-spin mr-2 text-[18px]">progress_activity</span>
      ) : isFollowing ? (
        <span className="material-symbols-outlined mr-2 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
      ) : (
        <span className="material-symbols-outlined mr-2 text-[18px]">add</span>
      )}
      {isFollowing ? "Đang theo dõi" : "Theo dõi"}
    </Button>
  );
}
