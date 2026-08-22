import type { AccountId, Offer } from "@/api/generated/types.gen"

/**
 * Pure rules about a negotiation. No React, no fetching — so the card stays render-only and
 * the questions it answers can be checked without a browser.
 */

/**
 * What the card is, from the reader's side.
 *
 * Not the same thing as `offer.status`, and the difference is the whole point. `active` means
 * two opposite things depending on who is looking — my move, or theirs — and it goes on meaning
 * `active` after the window has closed, because nothing writes to the row until a sweep gets to
 * it. A card keyed on the status showed "Đồng ý mức giá này" on an offer the server would refuse
 * for being expired, and showed the buyer a checkout button for an acceptance that had already
 * lapsed.
 */
export type OfferStage =
	/** Standing proposal from the other side: the reader is the one who answers. */
	| "yours"
	/** The reader's own proposal, waiting on the other side. */
	| "theirs"
	/** The window ran out. Nothing can be done to this offer by either party. */
	| "expired"
	/** Terms agreed, price frozen for the short checkout window. */
	| "agreed"
	/** The buyer paid; this is a sale now. */
	| "paid"
	/** Withdrawn or refused — the row cannot tell which, and it does not matter here. */
	| "closed"

export function offerStage(offer: Offer, me: AccountId | undefined, now = Date.now()): OfferStage {
	if (offer.status === "cancelled") return "closed"
	if (offer.status === "checked-out") return "paid"

	// Both live statuses are bounded by the same field — twelve hours for a proposal, thirty
	// minutes for an acceptance — so the check is one and it comes before either.
	const lapsed = new Date(offer.expires_at).getTime() <= now
	if (lapsed) return "expired"

	if (offer.status === "accepted") return "agreed"
	// Whose move it is follows authorship, never which side of the sale you are on: the two
	// parties alternate, so keying on buyer/seller is right for the first offer and wrong for
	// every counter after it.
	return me !== undefined && me === offer.author_id ? "theirs" : "yours"
}

/** Whether this stage is one the reader can act on. Drives the card's whole visual weight. */
export function isReadersMove(stage: OfferStage, isBuyer: boolean): boolean {
	return stage === "yours" || (stage === "agreed" && isBuyer)
}

/**
 * How far the proposal sits below the asking price.
 *
 * This is the number a negotiation is *about*, and the card never showed it: a bare "400.000 ₫"
 * says nothing without the price it is answering. The asking price is not on the offer — the DTO
 * carries the variant id and nothing else — so a caller resolves it from the listing, the same
 * read the counter-offer dialog already makes to find its ceiling.
 *
 * Null when there is nothing to say: no asking price resolved, or a proposal at the asking price,
 * which is not a discount and reads as noise. `cheaper` is false for the case the server refuses
 * (the asking price is a ceiling) rather than assumed away — a card that renders "giảm −12%" on
 * the day that rule changes is worse than one that says the truth.
 */
export function priceGap(
	total: number,
	asking: number | undefined,
): { percent: number; cheaper: boolean } | null {
	if (!asking || asking <= 0 || total === asking) return null
	const percent = Math.round((Math.abs(asking - total) / asking) * 100)
	// Under a percent is a rounding artefact, not a discount worth a line of its own.
	if (percent < 1) return null
	return { percent, cheaper: total < asking }
}

/** How loudly the clock should read. A window with hours left is information, not a warning. */
export type Urgency = "calm" | "soon" | "gone"

const SOON_MS = 2 * 60 * 60 * 1000

export function urgencyOf(expiresAt: string, now = Date.now()): Urgency {
	const left = new Date(expiresAt).getTime() - now
	if (left <= 0) return "gone"
	return left < SOON_MS ? "soon" : "calm"
}

/**
 * The most a proposal may be — one đồng under the asking price for that quantity.
 *
 * The ceiling is on the *total*, because the total is what either side types and what the escrow
 * will hold: comparing a derived unit price would let a total over the line through on a rounding
 * down. Undefined when no asking price could be resolved, and then nothing is enforced here —
 * the server holds the rule, and refusing to let somebody negotiate because a secondary read
 * failed trades a small inconvenience for a broken feature.
 *
 * Exclusive, mirroring `domain.BelowAsking`: a proposal *at* the asking price is refused too,
 * because the asking price is already takeable by pressing buy — agreeing to it costs the pair
 * two round trips to reach a number that was one press away.
 */
export function ceilingFor(unitPrice: number | undefined, quantity: number): number | undefined {
	if (!unitPrice || unitPrice <= 0 || quantity <= 0) return undefined
	return unitPrice * quantity
}

/** Whether a typed total is one the server will refuse for sitting at or above the asking price. */
export function isAtOrAboveAsking(total: number, ceiling: number | undefined): boolean {
	return ceiling !== undefined && Number.isFinite(total) && total >= ceiling
}

/**
 * A round number, at the scale of the number itself: 10.000 near a million, 1.000 near a hundred
 * thousand, 100 below that. Nobody offers 428.719 ₫, so a suggestion that reads like a computed
 * value is a suggestion nobody takes.
 */
export function roundToNice(value: number): number {
	const step = value >= 1_000_000 ? 10_000 : value >= 100_000 ? 1_000 : 100
	return Math.max(step, Math.round(value / step) * step)
}

/**
 * What to put in the empty price field, derived from the numbers already on screen.
 *
 * A placeholder is the cheapest teaching there is, and "Ví dụ: 500000" — a constant, unrelated to
 * this listing, unformatted — taught nothing. Derived instead, in the direction the reader wants
 * to move, so the hint doubles as a statement of where the boundary is.
 *
 * `standing` is the proposal being answered, absent when this is the first offer:
 *
 *   - Opening (no standing proposal): a tenth under the asking price. A first offer is a probe,
 *     and a tenth is roughly where one lands.
 *   - Answering as the seller: halfway between their number and your asking price, which is the
 *     move both sides make most — splitting the difference.
 *   - Answering as the buyer: a twentieth under what they just asked, because a buyer's counter
 *     goes *down* from the seller's, and the midpoint would be a number above the one on the
 *     table.
 *
 * Never at or above the ceiling, since that is precisely the total the server refuses.
 */
export function suggestedTotal(
	{ ceiling, standing, asSeller }: { ceiling: number | undefined; standing?: number; asSeller: boolean },
): number | undefined {
	if (ceiling === undefined || ceiling <= 1) return undefined
	const raw =
		standing === undefined
			? ceiling * 0.9
			: asSeller
				? (standing + ceiling) / 2
				: standing * 0.95
	const rounded = roundToNice(raw)
	// One step under the ceiling rather than the ceiling itself: a suggestion the field would
	// immediately mark invalid is worse than none.
	return Math.max(1, Math.min(rounded, roundToNice(ceiling * 0.95)))
}
