"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import StarRating from "@/components/ui/StarRating";
import { useAccountFeedback } from "@/hooks/api/useShop";
import type { AccountId, ReputationRole } from "@/api/generated/types.gen";

const ROLES: Array<{ value: ReputationRole; label: string; blurb: string }> = [
  { value: "seller", label: "Khi bán", blurb: "Người mua nói gì sau khi nhận hàng" },
  { value: "buyer", label: "Khi mua", blurb: "Người bán nói gì sau khi giao hàng" },
];

/**
 * Transaction feedback, split by the side the account was on.
 *
 * The API takes `role` and the page never sent it, so the two claims — how they sell and
 * how they buy — arrived as one undifferentiated list. On a C2C marketplace the same
 * account does both, so which one a reader is looking at has to be their choice.
 */
export default function ShopFeedback({ accountId }: { accountId: AccountId }) {
  const [role, setRole] = useState<ReputationRole>("seller");
  const { feedback, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useAccountFeedback(accountId, role);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {ROLES.map((option) => (
          <button
            key={option.value}
            type="button"
            title={option.blurb}
            aria-pressed={role === option.value}
            onClick={() => setRole(option.value)}
            className={`rounded-full border px-4 py-1.5 font-label-md transition-colors cursor-pointer ${
              role === option.value
                ? "border-transparent bg-primary-container text-on-primary-container"
                : "border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        // The shape of the list, not a sentence about waiting: centred text on a blank panel
        // is indistinguishable from a panel that failed to load.
        <div className="max-w-[80ch] divide-y divide-outline-variant overflow-hidden rounded-2xl border border-outline-variant bg-surface">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton shape="circle" className="h-8 w-8 shrink-0" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="mt-3 h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : feedback.length === 0 ? (
        <div className="max-w-[80ch]">
        <EmptyState
          icon="rate_review"
          title={
            role === "seller"
              ? "Chưa có đánh giá nào từ người mua"
              : "Chưa có đánh giá nào từ người bán"
          }
          description="Đánh giá chỉ đến từ những đơn đã hoàn thành, nên mỗi dòng ở đây đều là một giao dịch thật."
        />
        </div>
      ) : (
        <>
          <div className="max-w-[80ch] divide-y divide-outline-variant overflow-hidden rounded-2xl border border-outline-variant bg-surface">
            {feedback.map((entry) => (
              <article key={entry.id} className="p-4">
                <div className="mb-2 flex items-center gap-3">
                  <Link
                    href={`/shop/${entry.rater.id}`}
                    className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-secondary-container"
                  >
                    {entry.rater.avatar?.url ? (
                      <Image
                        src={entry.rater.avatar.url}
                        alt={entry.rater.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-label-sm text-on-surface">
                        {entry.rater.name.charAt(0)}
                      </span>
                    )}
                  </Link>
                  <Link
                    href={`/shop/${entry.rater.id}`}
                    className="font-label-md text-on-surface hover:text-primary"
                  >
                    {entry.rater.name}
                  </Link>
                  <StarRating rating={entry.rating} size={16} />
                  <span className="ml-auto font-body-sm text-on-surface-variant">
                    {new Date(entry.created_at).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                {entry.comment && (
                  <p className="font-body-sm leading-relaxed text-on-surface">{entry.comment}</p>
                )}
              </article>
            ))}
          </div>

          {hasNextPage && (
            <div className="mt-5 flex max-w-[80ch] justify-center">
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
      )}
    </div>
  );
}
