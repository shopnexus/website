import type { ListingDetail, Variant } from "@/api/generated/types.gen"

/**
 * What the thread needs to say about the item being traded.
 *
 * `ListingDetail` carries variants rather than one price and one stock count, so the
 * choice of which variant speaks for the listing is made once here — the banner, the row
 * and the rail all read the same one.
 */

/** The variant the listing shows: the featured one, falling back to the first. */
export function featuredVariant(listing: ListingDetail): Variant | undefined {
	return listing.variants.find((variant) => variant.is_featured) ?? listing.variants[0]
}

export function listingPrice(listing: ListingDetail): number {
	return featuredVariant(listing)?.price ?? 0
}

/** How many can still be bought — quantity less what is reserved or already sold. */
export function listingAvailable(listing: ListingDetail): number {
	return featuredVariant(listing)?.stock.available ?? 0
}

/**
 * Where the goods are, at the precision a chat needs. Null on a listing that was never
 * published, which has no address yet.
 */
export function listingPlace(listing: ListingDetail): string | null {
	const location = listing.location
	if (!location) return null
	return location.district_name
		? `${location.district_name}, ${location.province_name}`
		: location.province_name
}
