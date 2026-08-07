import { getListings } from "@/api/generated/sdk.gen";
import type { Listing, ListingDetail } from "@/api/generated/types.gen";

/** How many cards a rail shows once the listing itself has been dropped from the result. */
const RAIL_SIZE = 4;

/**
 * There is no `/listings/{id}/similar`. What the API has instead is a search with a
 * `mode`, so "similar" is spelled as a hybrid query — lexical plus vector — seeded by the
 * listing's own name and bounded to its category. `hybrid` rather than `semantic` on
 * purpose: an embedding is written by a worker that a deployment is allowed not to run,
 * and a rail that empties out when it is behind would be a rail nobody trusts.
 */
export async function fetchSimilarListings(product: ListingDetail): Promise<Listing[]> {
	const { data } = await getListings({
		query: {
			q: product.name,
			mode: "hybrid",
			category_id: product.category.id,
			limit: RAIL_SIZE + 1,
		},
	})
	return excludeSelf(data?.data, product)
}

/** The rest of this seller's shop, newest first. */
export async function fetchSellerListings(product: ListingDetail): Promise<Listing[]> {
	const { data } = await getListings({
		query: { seller_id: product.seller.id, sort: "newest", limit: RAIL_SIZE + 1 },
	})
	return excludeSelf(data?.data, product)
}

/** The listing being read is always its own best match, and is never worth a card. */
function excludeSelf(listings: ReadonlyArray<Listing> | undefined, product: ListingDetail): Listing[] {
	return (listings ?? []).filter((listing) => listing.id !== product.id).slice(0, RAIL_SIZE)
}
