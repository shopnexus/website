import type { ListingDetail } from "@/api/generated/types.gen"

import { shortLocation } from "./facts"

/**
 * The questions somebody actually opens a chat to ask, written out so the first one costs a
 * tap instead of a paragraph.
 *
 * They are drawn from the listing rather than a fixed list, because a suggestion that does
 * not apply is worse than no suggestion: offering "thương lượng" on a fixed price teaches the
 * reader that these chips are decoration, and asking about warranty on a listing with no
 * warranty field puts a question to the seller that the page already answered.
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
