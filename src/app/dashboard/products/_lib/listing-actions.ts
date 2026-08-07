import type { ListingStatus } from "@/api/generated/types.gen"

/**
 * What a seller may do to a listing in each state.
 *
 * Derived from the statuses the server refuses rather than from what looks tidy:
 * publishing answers 409 when the listing is already live or already under moderation,
 * and taking down answers 409 when it is not live. Drawing a button that is guaranteed to
 * fail is worse than not drawing it — the seller presses it, gets an error, and learns
 * nothing about which state their listing is in.
 */
export function canPublish(status: ListingStatus): boolean {
	return status === "draft" || status === "hidden"
}

export function canUnpublish(status: ListingStatus): boolean {
	return status === "active"
}

/** What pressing "publish" actually achieves, which is not "it is live now". */
export const PUBLISH_HINT =
	"Sản phẩm sẽ được gửi đi kiểm duyệt trước khi hiển thị công khai."
