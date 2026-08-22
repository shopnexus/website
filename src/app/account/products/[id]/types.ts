import type { ListingCondition, PriceMode } from "@/api/generated/types.gen"
import type { AttributePair } from "@/lib/variant-attributes"

/**
 * The listing fields this editor can change.
 *
 * A subset of `UpdateListingRequest` on purpose: photos and specifications are edited
 * where they are created, in the posting flow, and re-implementing the uploader here
 * would give the same field two behaviours.
 */
export interface ListingDraft {
	name: string
	description: string
	condition: ListingCondition
	price_mode: PriceMode
	category_id: string
	/** Comma-separated as typed; split and trimmed on the way out. */
	tags: string
}

/** One variant's editable state, including the pairs that name it. */
export interface VariantDraft {
	price: number
	quantity: number
	weightG: number
	attributes: AttributePair[]
}
