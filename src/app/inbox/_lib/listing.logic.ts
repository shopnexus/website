import type { ListingDetail } from "@/api/generated/types.gen"

/**
 * The price a listing shows in the thread: the featured variant's, falling back to the
 * first. `ListingDetail` carries variants rather than one price, so the choice has to be
 * made somewhere — once, here, rather than at each of the two places that render it.
 */
export function listingPrice(listing: ListingDetail): number {
	return (
		listing.variants.find((variant) => variant.is_featured)?.price ??
		listing.variants[0]?.price ??
		0
	)
}
