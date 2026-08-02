"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { AccountService } from "@/services/account.service";
import { toast } from "react-hot-toast";

interface FollowButtonProps {
  accountId: string;
  initialIsFollowing?: boolean;
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "error";
}

export default function FollowButton({ accountId, initialIsFollowing = false, className, variant = "primary" }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent navigating if wrapped in a link

    setIsLoading(true);
    try {
      if (isFollowing) {
        await AccountService.unfollowSeller(accountId);
        setIsFollowing(false);
        toast.success("Đã bỏ theo dõi.");
      } else {
        await AccountService.followSeller(accountId);
        setIsFollowing(true);
        toast.success("Đã theo dõi gian hàng.");
      }
    } catch (error) {
      // Error is handled by apiClient interceptor
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant={isFollowing ? "outline" : variant} 
      className={className} 
      onClick={handleToggleFollow}
      disabled={isLoading}
    >
      {isLoading ? (
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
