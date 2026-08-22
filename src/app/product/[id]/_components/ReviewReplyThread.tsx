"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useReplyToReview, useReview } from "@/hooks/api/useReviews";
import { hiddenReplyCount } from "@/lib/reviews";
import { useAuthStore } from "@/stores/use-auth-store";
import type { Review, ReviewReply } from "@/api/generated/types.gen";

const MAX_BODY = 2000;

function ReplyRow({ reply }: { reply: ReviewReply }) {
  return (
    <li className="flex gap-3">
      <Link
        href={`/shop/${reply.author.id}`}
        className="relative mt-0.5 h-7 w-7 shrink-0 overflow-hidden rounded-full bg-secondary-container"
      >
        {reply.author.avatar?.url ? (
          <Image src={reply.author.avatar.url} alt={reply.author.name} fill className="object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[11px] font-bold text-on-surface">
            {reply.author.name.charAt(0)}
          </span>
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/shop/${reply.author.id}`} className="font-label-md text-on-surface hover:text-primary">
            {reply.author.name}
          </Link>
          {/* The seller answering their own listing is the whole reason this thread exists,
              so it is the one thing marked. */}
          {reply.is_seller && (
            <span className="inline-flex items-center gap-1 rounded-full bg-tertiary-container px-2 py-0.5 text-[11px] font-semibold text-on-tertiary-container">
              <span className="material-symbols-outlined text-[12px]" aria-hidden="true">
                storefront
              </span>
              Người bán
            </span>
          )}
          <span className="font-label-sm text-on-surface-variant">
            {new Date(reply.created_at).toLocaleDateString("vi-VN")}
          </span>
        </div>
        <p className="mt-1 whitespace-pre-wrap font-body-sm leading-relaxed text-on-surface-variant">
          {reply.body}
        </p>
      </div>
    </li>
  );
}

/**
 * The reply thread under one review, and the box that adds to it.
 *
 * A page of reviews carries only the first few replies, so the rest are fetched from
 * `GET /reviews/{id}` on demand rather than by asking for every thread of every review on
 * the page. Anyone signed in may reply — the seller answering is just the common case.
 */
export default function ReviewReplyThread({ review }: { review: Review }) {
  const { user } = useAuthStore();
  const reply = useReplyToReview();

  const [expanded, setExpanded] = useState(false);
  const [composing, setComposing] = useState(false);
  const [body, setBody] = useState("");

  const hidden = hiddenReplyCount(review);
  const full = useReview(expanded ? review.id : undefined);
  const replies = expanded && full.data ? full.data.replies : review.replies;

  const submit = () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    reply.mutate(
      { id: review.id, body: trimmed },
      {
        onSuccess: () => {
          setBody("");
          setComposing(false);
          // A new reply may be past the cap the list carries, so show the whole thread.
          setExpanded(true);
          toast.success("Đã gửi phản hồi.");
        },
      },
    );
  };

  return (
    <div className="mt-4 border-l-2 border-outline-variant pl-4">
      {replies.length > 0 && (
        <ul className="flex flex-col gap-4">
          {replies.map((item) => (
            <ReplyRow key={item.id} reply={item} />
          ))}
        </ul>
      )}

      {hidden > 0 && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-3 font-label-sm font-bold text-primary hover:underline"
        >
          Xem thêm {hidden} phản hồi
        </button>
      )}
      {expanded && full.isLoading && (
        <p className="mt-3 font-label-sm text-on-surface-variant">Đang tải phản hồi...</p>
      )}

      {composing ? (
        <div className="mt-3">
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value.slice(0, MAX_BODY))}
            rows={3}
            autoFocus
            aria-label="Nội dung phản hồi"
            placeholder="Viết phản hồi..."
            className="w-full resize-y rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-sm text-on-surface outline-none focus:border-primary"
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={submit}
              disabled={!body.trim() || reply.isPending}
              className="rounded-full bg-primary px-4 py-1.5 font-label-md text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {reply.isPending ? "Đang gửi..." : "Gửi"}
            </button>
            <button
              type="button"
              onClick={() => {
                setComposing(false);
                setBody("");
              }}
              className="rounded-full px-4 py-1.5 font-label-md text-on-surface-variant hover:text-on-surface"
            >
              Huỷ
            </button>
            <span className="ml-auto font-label-sm text-on-surface-variant">
              {body.length}/{MAX_BODY}
            </span>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            if (!user) {
              toast.error("Vui lòng đăng nhập để phản hồi.");
              return;
            }
            setComposing(true);
          }}
          className="mt-3 inline-flex items-center gap-1 font-label-sm font-bold text-on-surface-variant hover:text-primary"
        >
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
            reply
          </span>
          Phản hồi
        </button>
      )}
    </div>
  );
}
