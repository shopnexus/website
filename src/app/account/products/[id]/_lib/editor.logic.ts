import type {
	CategoryId,
	ListingDetail,
	UpdateListingRequest,
	Variant,
} from "@/api/generated/types.gen"
import { attributePairs, attributesEqual, pairsToAttributes } from "@/lib/variant-attributes"
import type { ListingDraft, VariantDraft } from "../types"

/** The form's starting values, read off the listing as the server has it. */
export function draftFrom(listing: ListingDetail): ListingDraft {
	return {
		name: listing.name,
		description: listing.description,
		condition: listing.condition,
		price_mode: listing.price_mode,
		category_id: listing.category.id,
		tags: listing.tags.join(", "),
	}
}

/**
 * Only what actually changed.
 *
 * `PATCH /listings/{id}` may hold the whole write for moderation, so sending back the
 * name that was already there would queue an edit that changes nothing and take the
 * listing off sale while a moderator reads it. Comparing against the loaded listing is
 * what keeps a no-op save a no-op.
 */
export function listingPatch(draft: ListingDraft, listing: ListingDetail): UpdateListingRequest {
	const patch: UpdateListingRequest = {}
	const name = draft.name.trim()
	const description = draft.description.trim()
	const tags = splitTags(draft.tags)

	if (name !== listing.name) patch.name = name
	if (description !== listing.description) patch.description = description
	if (draft.condition !== listing.condition) patch.condition = draft.condition
	if (draft.price_mode !== listing.price_mode) patch.price_mode = draft.price_mode
	if (draft.category_id !== listing.category.id) patch.category_id = draft.category_id as CategoryId
	if (!sameTags(tags, listing.tags)) patch.tags = tags
	return patch
}

export function splitTags(input: string): string[] {
	return input
		.split(",")
		.map((tag) => tag.trim())
		.filter(Boolean)
}

function sameTags(a: ReadonlyArray<string>, b: ReadonlyArray<string>): boolean {
	return a.length === b.length && a.every((tag, index) => tag === b[index])
}

/**
 * A variant's editable numbers.
 *
 * `weight_g` is read out of `package_details`, which the API types as free-form JSON —
 * the posting flow writes that key and the carrier quote is computed from it, so it is
 * read defensively rather than assumed to be a number.
 */
export function variantDraftFrom(variant: Variant): VariantDraft {
	const weight = variant.package_details["weight_g"]
	return {
		price: variant.price,
		quantity: variant.stock.quantity,
		weightG: typeof weight === "number" ? weight : 0,
		attributes: attributePairs(variant.attributes),
	}
}

/**
 * The floor a variant's stock can be set to.
 *
 * The server refuses a quantity below `reserved + sold`: those units are promised to a
 * checkout or already gone, and un-stocking them would oversell backwards. Showing the
 * floor is what turns a 422 into something the seller can act on.
 */
export function stockFloor(variant: Variant): number {
	return variant.stock.reserved + variant.stock.sold
}

/** Whether anything about this variant was actually edited. */
export function variantChanged(draft: VariantDraft, variant: Variant): boolean {
	const current = variantDraftFrom(variant)
	return (
		draft.price !== current.price ||
		draft.quantity !== current.quantity ||
		draft.weightG !== current.weightG ||
		!attributesEqual(pairsToAttributes(draft.attributes), variant.attributes)
	)
}
