"use client";

import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { useFollowingFeed, useToggleFollow } from "@/hooks/api/useAccount";
import type { AccountId } from "@/api/generated/types.gen";

/** The followed shops, one row each. */
export default function FollowedShopList() {
  const { sellers, totalCount, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useFollowingFeed();
  const toggleFollow = useToggleFollow();

  const handleUnfollow = (accountId: AccountId) => {
    // No optimistic removal: the hook invalidates the list on settle, so the row leaves
    // when the server agrees it has. Dropping it early and re-adding it on failure is
    // the kind of flicker a one-click undo does not earn.
    toggleFollow.mutate(
      { accountId, following: false },
      { onSuccess: () => toast.success("Đã bỏ theo dõi gian hàng.") },
    );
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 md:p-6 flex justify-center">
        <span className="material-symbols-outlined animate-spin text-primary text-[28px]">
          progress_activity
        </span>
      </div>
    );
  }

  if (sellers.length === 0) {
    return (
      <EmptyState
        icon="storefront"
        title="Bạn chưa theo dõi gian hàng nào"
        description="Theo dõi một gian hàng để tin đăng mới của họ đến với bạn trước tiên."
        action={{ label: "Tìm gian hàng", href: "/search" }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {totalCount !== null && (
        <p className="text-label-md text-on-surface-variant">
          Bạn đang theo dõi {totalCount} gian hàng.
        </p>
      )}

      <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest overflow-hidden">
        <div className="divide-y divide-outline-variant">
          {sellers.map((seller) => (
            <div
              key={seller.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 md:p-6 hover:bg-surface-container-low transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border border-outline-variant relative bg-surface-container-high flex shrink-0 items-center justify-center">
                  {seller.avatar?.url ? (
                    <Image src={seller.avatar.url} alt={seller.name} fill className="object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-on-surface-variant">
                      storefront
                    </span>
                  )}
                </div>
                {/* A follow row is an AccountSummary: id, name and avatar. There is
                    no username or join date here — the shop page reads those. */}
                <Link
                  href={`/shop/${seller.id}`}
                  className="text-label-lg text-on-surface hover:text-primary transition-colors"
                >
                  {seller.name}
                </Link>
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/shop/${seller.id}`}>
                  <Button variant="outline">Xem Shop</Button>
                </Link>
                <Button
                  variant="outline"
                  disabled={toggleFollow.isPending}
                  onClick={() => handleUnfollow(seller.id)}
                >
                  Đang theo dõi
                </Button>
              </div>
            </div>
          ))}
        </div>

        {hasNextPage && (
          <div className="p-5 md:p-6 flex justify-center border-t border-outline-variant">
            <Button
              variant="outline"
              disabled={isFetchingNextPage}
              onClick={() => fetchNextPage()}
            >
              {isFetchingNextPage ? "Đang tải..." : "Tải thêm"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
