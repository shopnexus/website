"use client";

import Image from "next/image";
import Link from "next/link";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import { useFollowers } from "@/hooks/api/useShop";
import type { AccountId } from "@/api/generated/types.gen";

/** Who follows this shop. `GET /accounts/{id}/followers` was served and never called. */
export default function ShopFollowers({ accountId }: { accountId: AccountId }) {
  const { followers, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useFollowers(accountId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-20 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (followers.length === 0) {
    return (
      <div className="max-w-[80ch]">
        <EmptyState
          icon="group"
          title="Chưa có ai theo dõi gian hàng này"
          description="Theo dõi để nhận thông báo khi người bán đăng tin mới."
        />
      </div>
    );
  }

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {followers.map((follower) => (
          <li key={follower.id}>
            <Link
              href={`/shop/${follower.id}`}
              className="flex items-center gap-3 rounded-2xl border border-outline-variant bg-surface p-3 transition-colors hover:border-primary"
            >
              <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-secondary-container">
                {follower.avatar?.url ? (
                  <Image src={follower.avatar.url} alt={follower.name} fill className="object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center font-bold text-on-surface">
                    {follower.name.charAt(0)}
                  </span>
                )}
              </span>
              <span className="min-w-0 flex-1 truncate font-label-md text-on-surface">
                {follower.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {hasNextPage && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="rounded-full border-2 border-primary px-10 py-2.5 font-label-md font-bold text-primary transition-colors hover:bg-primary hover:text-on-primary disabled:opacity-50"
          >
            {isFetchingNextPage ? "Đang tải..." : "Xem thêm"}
          </button>
        </div>
      )}
    </>
  );
}
