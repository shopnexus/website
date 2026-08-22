import type { AccountId, ListingId, Offer } from "@/api/generated/types.gen"

/**
 * The negotiation behind a thread.
 *
 * `GET /offers` answers both roles in one cursor stream, newest first, so a single read
 * covers the whole list — the alternative is an offer request per row.
 */

/**
 * Still in play: something one side can act on. `cancelled` is over and `checked-out`
 * became an order, so neither is a negotiation the inbox is waiting on.
 */
export function isInPlay(offer: Offer): boolean {
	return offer.status === "active" || offer.status === "accepted"
}

/** Offers still in play, keyed by the account they are with. Newest first within a key. */
export function dealsByCounterparty(offers: readonly Offer[]): Map<AccountId, Offer[]> {
	const map = new Map<AccountId, Offer[]>()

	for (const offer of offers) {
		if (!isInPlay(offer)) continue
		const existing = map.get(offer.counterparty.id)
		if (existing) existing.push(offer)
		else map.set(offer.counterparty.id, [offer])
	}

	return map
}

/**
 * What the row says about the negotiation. An agreed price is a different state from one
 * still being haggled over — it is the one that expires and needs paying.
 */
export function dealLabel(deals: readonly Offer[] | undefined): string | null {
	if (!deals || deals.length === 0) return null
	return deals.some((offer) => offer.status === "accepted") ? "Đã chốt giá" : "Đang thương lượng"
}

/** The standing offer over one listing — the price the deal line shows beside the asking one. */
export function offerForListing(
	deals: readonly Offer[] | undefined,
	listingId: ListingId | undefined,
): Offer | undefined {
	if (!deals || !listingId) return undefined
	return deals.find((offer) => offer.listing_id === listingId)
}
