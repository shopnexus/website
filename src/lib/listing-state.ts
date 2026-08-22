import type { ListingDetail } from "@/api/generated/types.gen"

/**
 * Whether a listing may be presented as a product.
 *
 * The read contract hands `hidden` and soft-deleted listings to anyone on purpose — a cart
 * row and an order item still have to render one — and says `status` and `deleted_at` are
 * what report that it cannot be bought. This site read neither, so a listing staff had taken
 * down kept serving its product page, buy button and all, at the URL it was shared under.
 */
export function listingIsLive(listing: {
	status: ListingDetail["status"]
	deleted_at: ListingDetail["deleted_at"]
}): boolean {
	return listing.status === "active" && !listing.deleted_at
}

/** Why a listing is not live, in the words the reader is owed. */
export function listingDownNote(listing: ListingDetail): { title: string; body: string } {
	if (listing.deleted_at) {
		return {
			title: "Tin đăng đã bị xoá",
			body: "Người bán đã xoá tin đăng này khỏi ShopNexus.",
		}
	}
	// `taken_down_at` is set by staff and by nothing else, which is the only thing telling a
	// moderator's verdict apart from a seller hiding their own — both read `hidden`.
	if (listing.taken_down_at) {
		return {
			title: "Tin đăng đã bị gỡ",
			body: listing.takedown_reason
				? `ShopNexus đã gỡ tin đăng này sau khi kiểm duyệt: ${listing.takedown_reason}`
				: "ShopNexus đã gỡ tin đăng này sau khi kiểm duyệt.",
		}
	}
	if (listing.status === "hidden") {
		return {
			title: "Tin đăng đang được ẩn",
			body: "Người bán đã tạm ẩn tin đăng này.",
		}
	}
	return {
		title: "Tin đăng chưa được đăng bán",
		body: "Tin đăng này đang chờ duyệt hoặc còn là bản nháp.",
	}
}
