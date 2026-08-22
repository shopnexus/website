import type { ListingDetail } from "@/api/generated/types.gen"

import { shortLocation } from "./facts"

/**
 * The fallback openers: what the dock offers when the server's own are not coming.
 *
 * `GET /listings/{id}/chat-suggestions` is where the real ones come from — a model reads the
 * whole listing and asks about what it does *not* already answer, which is the difference
 * between a chip worth tapping and a chip that asks about warranty on a listing whose warranty
 * is printed above it. This is the same idea with only the checks a client can make for itself:
 * skip haggling on a fixed price, skip warranty when the listing states one.
 *
 * It exists because a chat that opens without chips still opens. A model gateway that is down,
 * out of quota, or simply not configured in this deployment must not turn "ask the seller" into
 * an empty box.
 *
 * Four at most. Past that the chips are a menu to read, which is the thing they exist to
 * save the reader from.
 */
const MAX_PROMPTS = 4

export function chatPrompts(listing: ListingDetail): string[] {
	const prompts = ["Sản phẩm này còn không?"]

	if (listing.price_mode === "negotiable") {
		prompts.push("Giá này thương lượng được không?")
	}

	const warranty = listing.specifications?.warranty_remaining
	if (typeof warranty === "string" && warranty.trim() !== "") {
		prompts.push("Bảo hành còn giấy tờ gì không?")
	}

	// Where the goods are is where you would go to look at them, so the place belongs in the
	// question — "xem trực tiếp được không" leaves the seller to guess whether the buyer knows
	// how far away that is.
	if (listing.location) {
		prompts.push(`Mình xem trực tiếp ở ${shortLocation(listing.location)} được không?`)
	}

	prompts.push("Bạn có ship COD không?")

	return prompts.slice(0, MAX_PROMPTS)
}
