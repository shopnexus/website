import type { Listing, ListingDetail } from "@/api/generated/types.gen";
import type { ListingFilters } from "@/hooks/api/useCatalog";

/**
 * What the two rails under a listing ask for. Filters and a filter, no fetching: the page reads
 * them through the ordinary query hooks now, so what is left here is the part worth naming.
 */

/**
 * How many cards a rail asks for.
 *
 * Twelve, not four. Four was right while the rail was a four-column grid — it filled the row
 * exactly. The rail is a carousel now, and four cards in a carousel that shows five is a
 * carousel that cannot move: the arrows are born disabled and a drag rubber-bands back, which
 * reads as broken rather than as "there is nothing more". A rail is worth scrolling or it is not
 * worth being a rail.
 */
export const RAIL_SIZE = 12;

/**
 * Listings like this one.
 *
 * Ranked by this listing's own stored embedding (`similar_to`), which is what "similar" means.
 * It used to be spelled as a search for the listing's *name*: that ran the whole
 * query-understanding stage — model call included — once per product page view, to rediscover a
 * vector that was already in the database, and then ranked by the words of the title, which puts
 * a phone case beside a phone.
 *
 * No `category_id` bound either. The embedding already knows what the thing is, and the category
 * was doing the work the vector does better — while excluding the genuinely similar item
 * somebody filed one category over.
 */
export function similarFilters(product: ListingDetail): ListingFilters {
	return { similar_to: product.id, limit: RAIL_SIZE };
}

/** The rest of this seller's shop, newest first. One extra, because this listing is in it. */
export function sellerFilters(product: ListingDetail): ListingFilters {
	return { seller_id: product.seller.id, sort: "newest", limit: RAIL_SIZE + 1 };
}

/**
 * The listing being read is always its own best match, and is never worth a card.
 *
 * `similar_to` excludes it server-side, so this is the second line for it and the first for the
 * seller's rail, which has no reason to know about it.
 */
export function excludeSelf(
	listings: ReadonlyArray<Listing> | undefined,
	product: ListingDetail,
): Listing[] {
	return (listings ?? []).filter((listing) => listing.id !== product.id).slice(0, RAIL_SIZE);
}
