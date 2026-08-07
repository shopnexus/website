"use client";

import { toast } from "react-hot-toast";
import { useVoteReview } from "@/hooks/api/useReviews";
import { canVote, nextVote, type VoteValue } from "@/lib/reviews";
import { useAuthStore } from "@/stores/use-auth-store";
import type { Review } from "@/api/generated/types.gen";

const CHOICES: Array<{ vote: VoteValue; icon: string; label: string }> = [
  { vote: 1, icon: "thumb_up", label: "Hữu ích" },
  { vote: -1, icon: "thumb_down", label: "Không hữu ích" },
];

/**
 * The helpful tally, and the two thumbs that move it.
 *
 * Pressing the vote already cast withdraws it, which is a delete rather than a stored
 * zero. The author's own review offers no thumbs at all — the server refuses that vote,
 * and a control that always errors is worse than one that is not there.
 */
export default function ReviewVoteButtons({ review }: { review: Review }) {
  const { user } = useAuthStore();
  const vote = useVoteReview();
  const current = review.votes.my_vote;
  const allowed = canVote(review, user?.id);

  const counts: Record<VoteValue, number> = {
    1: review.votes.helpful,
    [-1]: review.votes.not_helpful,
  };

  const press = (pressed: VoteValue) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để bình chọn.");
      return;
    }
    vote.mutate({ id: review.id, vote: nextVote(current, pressed) });
  };

  return (
    <div className="flex items-center gap-2">
      {CHOICES.map(({ vote: choice, icon, label }) => {
        const active = current === choice;
        return (
          <button
            key={choice}
            type="button"
            onClick={() => press(choice)}
            disabled={!allowed || vote.isPending}
            aria-pressed={active}
            title={allowed ? label : "Không thể bình chọn đánh giá của chính mình"}
            className={[
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-label-sm transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              active
                ? "border-transparent bg-primary-container text-on-primary-container"
                : "border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary",
            ].join(" ")}
          >
            <span
              className="material-symbols-outlined text-[16px]"
              style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
              aria-hidden="true"
            >
              {icon}
            </span>
            <span className="sr-only">{label}</span>
            {counts[choice]}
          </button>
        );
      })}
    </div>
  );
}
