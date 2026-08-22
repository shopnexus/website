"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import ImageViewerModal from "@/components/ui/ImageViewerModal";
import StarRating from "@/components/ui/StarRating";
import { useDeleteReview } from "@/hooks/api/useReviews";
import { wasEdited } from "@/lib/reviews";
import { useAuthStore } from "@/stores/use-auth-store";
import type { Review } from "@/api/generated/types.gen";
import ReviewReplyThread from "./ReviewReplyThread";
import ReviewVoteButtons from "./ReviewVoteButtons";

/**
 * One review: who wrote it, what they gave it, what they showed, and the thread under it.
 *
 * The photos are the reason a card is worth its space on a secondhand marketplace — a
 * buyer is rating goods somebody else described — so they get a real grid and open full
 * size, rather than a strip of thumbnails nothing happens to.
 */
export default function ReviewCard({ review }: { review: Review }) {
  const { user } = useAuthStore();
  const remove = useDeleteReview();
  const [viewing, setViewing] = useState<number | null>(null);
  const photoUrls = review.attachments
    .map((attachment) => attachment.url)
    .filter((url): url is string => Boolean(url));

  const isAuthor = user?.id === review.author.id;

  const handleDelete = () => {
    remove.mutate(review.id, {
      onSuccess: () => toast.success("Đã xoá đánh giá."),
    });
  };

  return (
    <article className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm">
      <header className="flex items-start gap-3">
        <Link
          href={`/shop/${review.author.id}`}
          className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-secondary-container"
        >
          {review.author.avatar?.url ? (
            <Image
              src={review.author.avatar.url}
              alt={review.author.name}
              fill
              className="object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-bold text-on-surface">
              {review.author.name.charAt(0)}
            </span>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            href={`/shop/${review.author.id}`}
            className="block truncate font-label-md text-on-surface hover:text-primary"
          >
            {review.author.name}
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <StarRating rating={review.rating} size={16} />
            <span className="font-label-sm text-on-surface-variant">
              {new Date(review.created_at).toLocaleDateString("vi-VN")}
            </span>
            {wasEdited(review) && (
              <span className="font-label-sm text-on-surface-variant">· đã chỉnh sửa</span>
            )}
          </div>
        </div>

        {isAuthor && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={remove.isPending}
            className="shrink-0 rounded-full p-1.5 text-on-surface-variant transition-colors hover:bg-error-container hover:text-on-error-container disabled:opacity-50"
            aria-label="Xoá đánh giá của bạn"
            title="Xoá đánh giá"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              delete
            </span>
          </button>
        )}
      </header>

      {review.body && (
        <p className="mt-3 whitespace-pre-wrap font-body-md leading-relaxed text-on-surface">
          {review.body}
        </p>
      )}

      {review.attachments.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {review.attachments.map((attachment) => (
            <button
              key={attachment.id}
              type="button"
              onClick={() => setViewing(photoUrls.indexOf(attachment.url!))}
              disabled={!attachment.url}
              className="relative h-20 w-20 overflow-hidden rounded-xl border border-outline-variant transition-colors hover:border-primary disabled:opacity-50"
              aria-label="Xem ảnh đánh giá"
            >
              {attachment.url ? (
                <Image src={attachment.url} alt="" fill className="object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-surface-container text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                    hide_image
                  </span>
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-4">
        <ReviewVoteButtons review={review} />
        {review.reply_count > 0 && (
          <span className="font-label-sm text-on-surface-variant">
            {review.reply_count} phản hồi
          </span>
        )}
      </div>

      <ReviewReplyThread review={review} />

      <ImageViewerModal
        images={photoUrls}
        index={viewing}
        onIndexChange={setViewing}
        onClose={() => setViewing(null)}
        altText={`Ảnh trong đánh giá của ${review.author.name}`}
      />
    </article>
  );
}
