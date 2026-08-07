import type { Review } from "@/api/generated/types.gen"

/**
 * Pure rules about a product review. No React, no fetching — everything here is a
 * function of what the server already sent, so the components stay render-only.
 */

/** Helpful, or not. The API has no neutral value: withdrawing a vote is a delete. */
export type VoteValue = -1 | 1

/**
 * What pressing a thumb means. Pressing the vote already cast withdraws it — which is a
 * DELETE rather than a neutral value — and pressing the other one replaces it in place.
 */
export function nextVote(current: VoteValue | null, pressed: VoteValue): VoteValue | null {
	return current === pressed ? null : pressed
}

/** Voting on your own review is refused by the server, so it is not offered. */
export function canVote(review: Review, viewerId: string | undefined): boolean {
	return Boolean(viewerId) && review.author.id !== viewerId
}

/** Five slots, each either filled or not, so a star row is a map rather than two loops. */
export function starSlots(rating: number): boolean[] {
	return [1, 2, 3, 4, 5].map((slot) => slot <= rating)
}

/** Rounded to one decimal, and "0" reads as no rating rather than as a bad one. */
export function formatRating(rating: number): string {
	return rating.toFixed(1)
}

/** A review the author has rewritten says so — the reply thread cannot say it for them. */
export function wasEdited(review: Review): boolean {
	return review.updated_at !== null
}

/**
 * How many replies are not in `replies`.
 *
 * A page of reviews caps the thread at the first few; `reply_count` is the real total and
 * `GET /reviews/{id}` returns the rest. Zero means the card is showing all of them.
 */
export function hiddenReplyCount(review: Review): number {
	return Math.max(0, review.reply_count - review.replies.length)
}
