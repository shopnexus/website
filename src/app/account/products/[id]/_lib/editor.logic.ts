import type {
	CategoryId,
	ListingDetail,
	UpdateListingRequest,
	Variant,
} from "@/api/generated/types.gen"
import { attributePairs, attributesEqual, pairsToAttributes } from "@/lib/variant-attributes"
import type { ListingDraft, VariantDraft } from "../types"

/**
 * What the seller last said about the listing, which is not always what buyers see.
 *
 * An edit to a live listing is held for moderation: the row keeps the approved version and the
 * change sits in `pending_edit`. The form has to open on the held one — it is what the seller
 * wrote and what a moderator will publish — because seeding from the live fields made a save
 * look like it had been thrown away: come back to the page and their words were gone.
 *
 * `tags` and `attachments` arrive as `[]` when the edit did not touch them, so an empty list
 * reads as "unchanged" rather than "cleared". Clearing every tag is rare and repeatable; losing
 * the live tags on every unrelated edit would not be.
 */
export function effectiveListing(listing: ListingDetail) {
	const held = listing.pending_edit
	return {
		name: held?.name ?? listing.name,
		description: held?.description ?? listing.description,
		condition: held?.condition ?? listing.condition,
		price_mode: held?.price_mode ?? listing.price_mode,
		category_id: held?.category_id ?? listing.category.id,
		tags: held?.tags?.length ? held.tags : listing.tags,
	}
}

/** The form's starting values: the newest thing the seller wrote. */
export function draftFrom(listing: ListingDetail): ListingDraft {
	const current = effectiveListing(listing)
	return { ...current, tags: current.tags.join(", ") }
}

/**
 * Whether the form differs from what the seller last submitted.
 *
 * Separate from `listingPatch` on purpose, and compared against a different thing: this asks
 * "is there anything to send", so it reads the held edit, while the patch is built against the
 * live version — see below.
 */
export function hasChanges(draft: ListingDraft, listing: ListingDetail): boolean {
	const current = effectiveListing(listing)
	return (
		draft.name.trim() !== current.name ||
		draft.description.trim() !== current.description ||
		draft.condition !== current.condition ||
		draft.price_mode !== current.price_mode ||
		draft.category_id !== current.category_id ||
		!sameTags(splitTags(draft.tags), current.tags)
	)
}

/**
 * Everything that differs from the version buyers can see.
 *
 * Against the live listing and not against the held edit, because a new edit *replaces* the
 * held one rather than merging into it: sending only what changed since the last submission
 * would drop the fields that submission carried. So the patch is always the full set of
 * differences from live, and `hasChanges` is what decides whether to send it at all.
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
